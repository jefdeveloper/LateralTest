using Lateral.Tasks.Application.Interfaces.Repositories;
using Lateral.Tasks.Infrastructure.Context;
using Lateral.Tasks.Infrastructure.Repositories;
using Lateral.Tasks.Infrastructure.Seed;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Lateral.Tasks.Infrastructure.DependencyInjection
{
    public static class InfrastructureServiceCollectionExtensions
    {
        public static IServiceCollection AddInfrastructureModule(this IServiceCollection services, IConfiguration config)
        {
            services.AddDbContexts(config);
            services.AddRepositories();
            services.AddSeeders();
            return services;
        }

        public static IServiceCollection AddDbContexts(this IServiceCollection services, IConfiguration config)
        {
            services.AddDbContext<TasksDbContext>(opt =>
                opt.UseNpgsql(config.GetConnectionString("TasksDb")));
            return services;
        }

        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            services.AddScoped<ITasksRepository, TasksRepository>();
            return services;
        }

        public static IServiceCollection AddSeeders(this IServiceCollection services)
        {
            services.AddScoped<TasksDbSeeder>();
            return services;
        }
    }
}
