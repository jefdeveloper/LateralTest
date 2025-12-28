using FluentValidation;
using Lateral.Tasks.API.Middlewares;
using Lateral.Tasks.API.Validators.Tasks;

namespace Lateral.Tasks.API.Composition
{
    public static class ApiModule
    {
        public static IServiceCollection AddApiModule(this IServiceCollection services)
        {
            services.AddTransient<ExceptionHandlingMiddleware>();
            services.AddValidatorsFromAssemblyContaining<TasksApiValidatorsAssemblyMarker>();

            return services;
        }
    }
}
