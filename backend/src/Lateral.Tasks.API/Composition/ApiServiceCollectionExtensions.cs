using FluentValidation;
using Lateral.Tasks.API.Middlewares;
using Lateral.Tasks.API.Validators.Tasks;

namespace Lateral.Tasks.API.Composition
{
    public static class ApiServiceCollectionExtensions
    {
        public static IServiceCollection AddApiServices(this IServiceCollection services)
        {
            services.AddTransient<ExceptionHandlingMiddleware>();
            return services;
        }

        public static IServiceCollection AddApiValidators(this IServiceCollection services)
        {
            services.AddValidatorsFromAssemblyContaining<TasksApiValidatorsAssemblyMarker>();
            return services;
        }

        public static IServiceCollection AddApiCors(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                    policy.WithOrigins("http://localhost:5173")
                          .AllowAnyHeader()
                          .AllowAnyMethod());
            });

            return services;
        }

        public static IServiceCollection AddApiModule(this IServiceCollection services)
        {
            return services
                .AddApiServices()
                .AddApiValidators()
                .AddApiCors();
        }
    }
}
