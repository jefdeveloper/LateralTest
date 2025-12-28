using FluentValidation;

namespace Lateral.Tasks.API.Filters
{
    public sealed class FluentValidationFilter<T> : IEndpointFilter
    {
        public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext ctx, EndpointFilterDelegate next)
        {
            var validator = ctx.HttpContext.RequestServices.GetRequiredService<IValidator<T>>();

            var model = ctx.Arguments.OfType<T>().FirstOrDefault();
            if (model is null)
                return Results.Problem("Invalid request body.", statusCode: 400);

            var result = await validator.ValidateAsync(model, ctx.HttpContext.RequestAborted);
            if (result.IsValid)
                return await next(ctx);

            var errors = result.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

            return Results.ValidationProblem(errors);
        }
    }
}
