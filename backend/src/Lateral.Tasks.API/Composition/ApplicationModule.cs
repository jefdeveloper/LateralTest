using FluentValidation;
using Lateral.Tasks.Application.Interfaces.UseCases;
using Lateral.Tasks.Application.UseCases;
using Lateral.Tasks.Application.Validators.Tasks;

namespace Lateral.Tasks.API.Composition
{
    public static class ApplicationModule
    {
        public static IServiceCollection AddApplicationModule(this IServiceCollection services)
        {
            services.AddScoped<ITasksUseCases, TasksUseCases>();

            services.AddValidatorsFromAssemblyContaining<TasksApplicationValidatorsAssemblyMarker>();

            return services;
        }
    }
}
