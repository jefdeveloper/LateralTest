using Lateral.Tasks.Application.Common;
using Lateral.Tasks.Application.Interfaces.Repositories;
using Lateral.Tasks.Domain.Entities;
using Lateral.Tasks.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace Lateral.Tasks.Infrastructure.Repositories
{
    public class TasksRepository(TasksDbContext db) : ITasksRepository
    {
        public async Task<PagedResult<TaskItem>> ListPagedAsync(int page, int pageSize, CancellationToken ct)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 5, 50);

            var query = db.Tasks.AsNoTracking().OrderByDescending(t => t.CreatedAtUtc);

            var total = await query.CountAsync(ct);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return new PagedResult<TaskItem>(items, page, pageSize, total);
        }

        public async Task<TaskItem?> GetAsync(Guid id, CancellationToken ct)
            => await db.Tasks.FirstOrDefaultAsync(t => t.Id == id, ct);

        public async Task<List<TaskItem>> GetManyAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct)
            => await db.Tasks.Where(t => ids.Contains(t.Id)).ToListAsync(ct);

        public async Task AddAsync(TaskItem task, CancellationToken ct)
            => await db.Tasks.AddAsync(task, ct);

        public async Task SaveChangesAsync(CancellationToken ct)
            => await db.SaveChangesAsync(ct);
    }
}
