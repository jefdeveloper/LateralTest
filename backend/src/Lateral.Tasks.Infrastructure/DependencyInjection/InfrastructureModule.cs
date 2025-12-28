using Lateral.Tasks.Application.Interfaces.Repositories;
using Lateral.Tasks.Infrastructure.Context;
using Lateral.Tasks.Infrastructure.Repositories;
using Lateral.Tasks.Infrastructure.Seed;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Lateral.Tasks.Infrastructure.DependencyInjection
{
    public static class InfrastructureModule
    {
        public static IServiceCollection AddInfrastructureModule(this IServiceCollection services, IConfiguration config)
        {
            services.AddDbContext<TasksDbContext>(opt =>
                opt.UseNpgsql(config.GetConnectionString("TasksDb")));

            services.AddScoped<ITasksRepository, TasksRepository>();
            services.AddScoped<TasksDbSeeder>();

            return services;
        }
    }
}
