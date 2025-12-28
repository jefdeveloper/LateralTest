namespace Lateral.Tasks.Application.Requests.Tasks
{
    public record UpdateTaskStatusRequest(Guid Id, string Status);
}
