using Lateral.Tasks.API.Middlewares;
using Lateral.Tasks.Infrastructure.Context;
using Lateral.Tasks.Infrastructure.Seed;
using Microsoft.EntityFrameworkCore;

namespace Lateral.Tasks.API.DependencyInjection
{
    public static class WebApplicationInfrastructureExtensions
    {
        public static async Task MigrateAndSeedAsync(this WebApplication app, bool runOnlyInDevelopment = true)
        {
            if (runOnlyInDevelopment && !app.Environment.IsDevelopment())
                return;

            using var scope = app.Services.CreateScope();
            var services = scope.ServiceProvider;
            var logger = services.GetService<ILoggerFactory>()?.CreateLogger("MigrateAndSeed");

            try
            {
                var db = services.GetRequiredService<TasksDbContext>();
                await db.Database.MigrateAsync();

                var seeder = services.GetRequiredService<TasksDbSeeder>();
                await seeder.SeedAsync();

                logger?.LogInformation("Database migrated and seeded successfully.");
            }
            catch (Exception ex)
            {
                logger?.LogError(ex, "An error occurred while migrating or seeding the database.");
                throw;
            }
        }

        public static async void UseMiddlewares(this WebApplication app)
        {
            app.UseMiddleware<ExceptionHandlingMiddleware>();
        }
    }
}
