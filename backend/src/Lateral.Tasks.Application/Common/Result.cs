namespace Lateral.Tasks.Application.Common
{
    public class Result
    {
        public bool IsSuccess { get; }
        public IReadOnlyList<ResultError> Errors { get; }

        protected Result(bool isSuccess, IReadOnlyList<ResultError> errors)
        {
            IsSuccess = isSuccess;
            Errors = errors;
        }

        public static Result Ok() => new(true, []);
        public static Result Fail(IEnumerable<ResultError> errors) => new(false, [.. errors]);
    }

    public sealed class Result<T> : Result
    {
        public T? Value { get; }

        private Result(bool isSuccess, T? value, IReadOnlyList<ResultError> errors)
            : base(isSuccess, errors) => Value = value;

        public static Result<T> Ok(T value) => new(true, value, []);
        public static new Result<T> Fail(IEnumerable<ResultError> errors) => new(false, default, [.. errors]);
    }
}
