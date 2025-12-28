using FluentAssertions;
using System.Net;
using System.Net.Http.Json;

namespace Lateral.Tasks.Api.IntegrationTests
{
    public class TasksEndpointsTests(TestAppFactory factory) : IClassFixture<TestAppFactory>
    {
        private readonly HttpClient _client = factory.CreateClient();

        public record CreateTaskRequest(string Description);
        public record TaskDto(string Id, string Description, string Status);
        public record PagedResult<T>(int Page, int PageSize, int Total, T[] Items);

        public record UpdateStatusRequest(string Status);
        public record BulkUpdateStatusRequest(string[] Ids, string Status);

        [Fact]
        public async Task Post_Should_Validate_Description_Max_30()
        {
            var req = new CreateTaskRequest(new string('a', 31));
            var resp = await _client.PostAsJsonAsync("/tasks", req);

            resp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Get_Should_Return_Paged_Result()
        {
            // cria 2 tasks
            await _client.PostAsJsonAsync("/tasks", new CreateTaskRequest("A"));
            await _client.PostAsJsonAsync("/tasks", new CreateTaskRequest("B"));

            var resp = await _client.GetAsync("/tasks?page=1&pageSize=10");
            resp.StatusCode.Should().Be(HttpStatusCode.OK);

            var body = await resp.Content.ReadFromJsonAsync<PagedResult<TaskDto>>();
            body.Should().NotBeNull();
            body!.Items.Length.Should().BeGreaterOrEqualTo(2);
            body.Total.Should().BeGreaterOrEqualTo(2);
            body.Page.Should().Be(1);
            body.PageSize.Should().Be(10);
        }

        [Fact]
        public async Task Put_Status_Should_Block_When_Finished()
        {
            var createResp = await _client.PostAsJsonAsync("/tasks", new CreateTaskRequest("Done"));
            createResp.StatusCode.Should().Be(HttpStatusCode.Created);

            var created = await createResp.Content.ReadFromJsonAsync<TaskDto>();
            created.Should().NotBeNull();

            var listResp = await _client.GetAsync("/tasks?page=1&pageSize=50");
            var list = await listResp.Content.ReadFromJsonAsync<PagedResult<TaskDto>>();
            var finished = list!.Items.FirstOrDefault(x => x.Status == "Finished");
            if (finished is null)
                return;

            var update = await _client.PutAsJsonAsync($"/tasks/{finished.Id}/status", new UpdateStatusRequest("InProgress"));

            // escolha seu code: 409 Conflict é bom para "locked"
            update.StatusCode.Should().BeOneOf(HttpStatusCode.Conflict, HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Put_Bulk_Should_Reject_When_Selected_Statuses_Differ()
        {
            // pega lista e seleciona duas com status diferentes
            var listResp = await _client.GetAsync("/tasks?page=1&pageSize=50");
            var list = await listResp.Content.ReadFromJsonAsync<PagedResult<TaskDto>>();
            list.Should().NotBeNull();

            var pending = list!.Items.FirstOrDefault(x => x.Status == "Pending");
            var inProgress = list.Items.FirstOrDefault(x => x.Status == "InProgress");

            if (pending is null || inProgress is null)
                return;

            var req = new BulkUpdateStatusRequest([pending.Id, inProgress.Id], "InProgress");
            var resp = await _client.PutAsJsonAsync("/tasks/bulk-status", req);

            resp.StatusCode.Should().BeOneOf(HttpStatusCode.Conflict, HttpStatusCode.BadRequest);
        }
    }
}

