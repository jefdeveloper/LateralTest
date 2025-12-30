using FluentValidation;
using Lateral.Tasks.Application.Interfaces.UseCases;
using Lateral.Tasks.Application.UseCases;
using Lateral.Tasks.Application.Validators.Tasks;

namespace Lateral.Tasks.API.Composition
{
    public static class ApplicationServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<ITasksUseCases, TasksUseCases>();
            return services;
        }

        public static IServiceCollection AddApplicationValidators(this IServiceCollection services)
        {
            services.AddValidatorsFromAssemblyContaining<TasksApplicationValidatorsAssemblyMarker>();
            return services;
        }

        public static IServiceCollection AddApplicationModule(this IServiceCollection services)
        {
            return services
                .AddApplicationServices()
                .AddApplicationValidators();
        }
    }
}
