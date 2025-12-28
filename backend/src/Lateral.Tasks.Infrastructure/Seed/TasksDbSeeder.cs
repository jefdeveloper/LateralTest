using Lateral.Tasks.Domain.Entities;
using Lateral.Tasks.Domain.Enums;
using Lateral.Tasks.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace Lateral.Tasks.Infrastructure.Seed
{
    public sealed class TasksDbSeeder(TasksDbContext db)
    {
        private readonly TasksDbContext _db = db;

        public async Task SeedAsync(CancellationToken ct = default)
        {
            // garante que o banco está criado / migrado
            await _db.Database.MigrateAsync(ct);

            // se já existir dados, não insere novamente
            if (await _db.Tasks.AnyAsync(ct))
                return;

            var now = DateTime.UtcNow;

            var tasks = new List<TaskItem>
        {
            new()
            {
                Description = "Read project requirements",
                Status = TaskItemStatus.Pending,
                CreatedAtUtc = now.AddMinutes(-30)
            },
            new()
            {
                Description = "Implement backend API",
                Status = TaskItemStatus.InProgress,
                CreatedAtUtc = now.AddMinutes(-20)
            },
            new()
            {
                Description = "Connect frontend to API",
                Status = TaskItemStatus.Pending,
                CreatedAtUtc = now.AddMinutes(-10)
            },
            new()
            {
                Description = "Deploy application",
                Status = TaskItemStatus.Finished,
                CreatedAtUtc = now.AddMinutes(-5)
            }
        };

            await _db.Tasks.AddRangeAsync(tasks, ct);
            await _db.SaveChangesAsync(ct);
        }
    }
}
