using Lateral.Tasks.Application.Common;
using Lateral.Tasks.Domain.Entities;

namespace Lateral.Tasks.Application.Interfaces.Repositories
{
    public interface ITasksRepository
    {
        Task<PagedResult<TaskItem>> ListPagedAsync(int page, int pageSize, CancellationToken ct);

        Task<TaskItem?> GetAsync(Guid id, CancellationToken ct);

        Task<List<TaskItem>> GetManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct);

        Task AddAsync(TaskItem task, CancellationToken ct);

        Task SaveChangesAsync(CancellationToken ct);
    }
}
