namespace Lateral.Tasks.Application.Requests.Tasks
{
    public record BulkUpdateTaskStatusRequest(List<Guid>? Ids, string Status);
}
