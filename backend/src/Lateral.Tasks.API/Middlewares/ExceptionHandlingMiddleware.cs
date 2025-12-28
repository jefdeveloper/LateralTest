using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Net.Mime;

namespace Lateral.Tasks.API.Middlewares
{
    public sealed class ExceptionHandlingMiddleware(ILogger<ExceptionHandlingMiddleware> logger) : IMiddleware
    {
        private readonly ILogger<ExceptionHandlingMiddleware> _logger = logger;

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            try
            {
                await next(context);
            }
            catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
            {
                context.Response.StatusCode = 499;
            }
            catch (Exception ex)
            {
                var (status, title, detail, code) = MapException(ex);

                if (_logger.IsEnabled(LogLevel.Error))
                {
                    _logger.LogError(ex,
                        "Unhandled exception mapped to {Status}. Code: {Code}. TraceId: {TraceId}",
                        status, code, context.TraceIdentifier);
                }

                if (context.Response.HasStarted)
                    throw;

                context.Response.Clear();
                context.Response.StatusCode = status;
                context.Response.ContentType = MediaTypeNames.Application.ProblemJson;

                var problem = new ProblemDetails
                {
                    Status = status,
                    Title = title,
                    Detail = detail,
                    Instance = context.Request.Path
                };

                problem.Extensions["traceId"] = context.TraceIdentifier;
                problem.Extensions["code"] = code;

                await context.Response.WriteAsJsonAsync(problem);
            }
        }

        private static (int status, string title, string detail, string code) MapException(Exception ex)
        {
            if (ex is NpgsqlException ||
                ex is TimeoutException ||
                ex is DbUpdateException ||
                ex is DbUpdateConcurrencyException)
            {
                return (
                    StatusCodes.Status503ServiceUnavailable,
                    "Service unavailable",
                    "The service is temporarily unavailable. Please try again later.",
                    "Infra.Unavailable"
                );
            }

            if (ex is BadHttpRequestException)
            {
                return (
                    StatusCodes.Status400BadRequest,
                    "Bad request",
                    "Invalid request payload.",
                    "Request.Invalid"
                );
            }

            return (
                StatusCodes.Status500InternalServerError,
                "Unexpected error",
                "An unexpected error occurred.",
                "Server.Error"
            );
        }
    }
}
