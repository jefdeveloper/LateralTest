using Lateral.Tasks.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Lateral.Tasks.Infrastructure.Context
{
    public class TasksDbContext(DbContextOptions<TasksDbContext> options) : DbContext(options)
    {
        public DbSet<TaskItem> Tasks => Set<TaskItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TaskItem>(b =>
            {
                b.ToTable("Tasks");
                b.HasKey(x => x.Id);
                b.Property(x => x.Description).HasMaxLength(30).IsRequired();
                b.Property(x => x.Status).IsRequired();
                b.Property(x => x.CreatedAtUtc).IsRequired();
            });
        }
    }
}
