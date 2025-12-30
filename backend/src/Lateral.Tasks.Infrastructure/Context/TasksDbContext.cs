using Lateral.Tasks.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Lateral.Tasks.Infrastructure.Context
{
    public class TasksDbContext(DbContextOptions<TasksDbContext> options) : DbContext(options)
    {
        public DbSet<TaskItem> Tasks => Set<TaskItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TaskItem>(task =>
            {
                task.ToTable("Tasks");
                task.HasKey(x => x.Id);
                task.Property(x => x.Description).HasMaxLength(30).IsRequired();
                task.Property(x => x.Status)
                    .HasConversion<string>()
                    .HasMaxLength(20)
                    .IsRequired();
                task.Property(x => x.CreatedAtUtc).IsRequired();
            });
        }
    }
}
