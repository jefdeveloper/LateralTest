using Lateral.Tasks.Application.Common;
using Lateral.Tasks.Application.Requests.Tasks;
using Lateral.Tasks.Application.Responses.Tasks;
using Lateral.Tasks.Domain.Entities;

namespace Lateral.Tasks.Application.Interfaces.UseCases
{
    public interface ITasksUseCases
    {
        Task<Result<PagedResult<TaskItemDto>>> ListPagedAsync(int page, int pageSize, CancellationToken ct);
        Task<Result<TaskItemDto>> CreateAsync(CreateTaskRequest request, CancellationToken ct);
        Task<Result<TaskItemDto>> UpdateStatusAsync(UpdateTaskStatusRequest request, CancellationToken ct);
        Task<Result<int>> BulkUpdateStatusAsync(BulkUpdateTaskStatusRequest request, CancellationToken ct);
    }
}
