using Lateral.Tasks.Application.Common;

namespace Lateral.Tasks.API.Common
{
    public static class ResultHttpMapper
    {
        public static IResult ToHttp<T>(this Result<T> result)
        {
            if (result.IsSuccess) return Results.Ok(result.Value);
            return MapErrors(result.Errors);
        }

        public static IResult ToHttp(this Result result)
        {
            if (result.IsSuccess) return Results.Ok();
            return MapErrors(result.Errors);
        }

        private static IResult MapErrors(IReadOnlyList<ResultError> errors)
        {
            var primary = errors[0];

            return primary.Type switch
            {
                ErrorType.Validation => Results.ValidationProblem(
                    errors.Where(e => e.Type == ErrorType.Validation)
                          .GroupBy(e => e.Field ?? "Request")
                          .ToDictionary(g => g.Key, g => g.Select(x => x.Message).ToArray())
                ),

                ErrorType.NotFound => Results.Problem(primary.Message, statusCode: 404, title: primary.Code),
                ErrorType.Forbidden => Results.Problem(primary.Message, statusCode: 403, title: primary.Code),
                ErrorType.Conflict => Results.Problem(primary.Message, statusCode: 409, title: primary.Code),

                _ => Results.Problem(primary.Message, statusCode: 400, title: primary.Code),
            };
        }
    }
}
