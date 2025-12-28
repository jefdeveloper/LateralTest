namespace Lateral.Tasks.API.Filters.Extensions
{
    public static class ValidationExtensions
    {
        public static RouteHandlerBuilder Validate<T>(this RouteHandlerBuilder b) =>
            b.AddEndpointFilter<FluentValidationFilter<T>>();
    }
}
