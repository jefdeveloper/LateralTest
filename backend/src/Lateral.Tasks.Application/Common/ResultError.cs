namespace Lateral.Tasks.Application.Common
{
    public enum ErrorType { Validation, NotFound, Conflict, Forbidden, Unexpected }

    public sealed record ResultError(string Code, string Message, ErrorType Type, string? Field = null);

}
