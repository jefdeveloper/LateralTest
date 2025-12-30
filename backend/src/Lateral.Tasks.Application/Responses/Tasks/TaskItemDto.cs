namespace Lateral.Tasks.Application.Responses.Tasks
{
    public sealed record TaskItemDto(
        Guid Id,
        string Description,
        string Status
    );
}
