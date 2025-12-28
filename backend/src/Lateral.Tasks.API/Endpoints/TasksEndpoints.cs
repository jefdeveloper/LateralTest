using Lateral.Tasks.API.Common;
using Lateral.Tasks.API.Filters.Extensions;
using Lateral.Tasks.Application.Common;
using Lateral.Tasks.Application.Interfaces.UseCases;
using Lateral.Tasks.Application.Requests.Tasks;
using Lateral.Tasks.Domain.Entities;

namespace Lateral.Tasks.API.Endpoints
{
    public static class TasksEndpoints
    {
        public static IEndpointRouteBuilder MapTasksEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/tasks")
                .WithTags("Tasks");

            // GET /tasks?page=1&pageSize=10
            group.MapGet("", async (int? page, int? pageSize, ITasksUseCases taskUseCase, CancellationToken ct) =>
            {
                var defaultPage = page ?? 1;
                var defaultPageSize = pageSize ?? 10;

                var result = await taskUseCase.ListPagedAsync(defaultPage, defaultPageSize, ct);
                return result.ToHttp();
            })
            .WithName("Tasks_ListPaged")
            .WithSummary("List tasks (paged)")
            .WithDescription("Returns a paginated list of tasks.")
            .Produces<PagedResult<TaskItem>>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

            // POST /tasks
            group.MapPost("", async (CreateTaskRequest request, ITasksUseCases taskUseCase, CancellationToken ct) =>
            {
                var result = await taskUseCase.CreateAsync(request, ct);

                return result.IsSuccess
                    ? Results.Created($"/tasks/{result.Value!.Id}", result.Value)
                    : result.ToHttp();
            })
            .WithName("Tasks_Create")
            .WithSummary("Create a task")
            .WithDescription("Creates a new task. The status is always set to Pending.")
            .Produces<TaskItem>(StatusCodes.Status201Created)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status500InternalServerError)
            .Validate<CreateTaskRequest>();

            // PUT /tasks/{id}/status
            group.MapPut("/{id:guid}/status", async (Guid id, UpdateStatusBody body, ITasksUseCases taskUseCase, CancellationToken ct) =>
            {
                var request = new UpdateTaskStatusRequest(id, body.Status);
                var result = await taskUseCase.UpdateStatusAsync(request, ct);
                return result.ToHttp();
            })
            .WithName("Tasks_UpdateStatus")
            .WithSummary("Update a task status")
            .WithDescription("Updates the status of a task. Finished tasks cannot be updated.")
            .Produces<TaskItem>(StatusCodes.Status200OK)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)   // Task.NotFound
            .ProducesProblem(StatusCodes.Status403Forbidden)  // Task.Locked
            .ProducesProblem(StatusCodes.Status500InternalServerError)
            .Validate<UpdateStatusBody>();

            // PUT /tasks/status/bulk
            group.MapPut("/status/bulk", async (BulkUpdateTaskStatusRequest request, ITasksUseCases taskUseCase, CancellationToken ct) =>
            {
                var result = await taskUseCase.BulkUpdateStatusAsync(request, ct);
                return result.IsSuccess
                    ? Results.Ok(new { updated = result.Value })
                    : result.ToHttp();
            })
            .WithName("Tasks_BulkUpdateStatus")
            .WithSummary("Update status in bulk")
            .WithDescription("Updates multiple tasks at once. All selected tasks must have the same current status and none can be Finished.")
            .Produces(StatusCodes.Status200OK)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)   // one or more not found
            .ProducesProblem(StatusCodes.Status403Forbidden)  // finished locked
            .ProducesProblem(StatusCodes.Status409Conflict)   // bulk mismatch
            .ProducesProblem(StatusCodes.Status500InternalServerError)
            .Validate<BulkUpdateTaskStatusRequest>();

            return app;
        }

        public sealed record UpdateStatusBody(string Status);
    }
}
