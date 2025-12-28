using FluentValidation;
using Lateral.Tasks.Application.Requests.Tasks;

namespace Lateral.Tasks.Application.Validators.Tasks
{
    public sealed class BulkUpdateTaskStatusRequestValidator : AbstractValidator<BulkUpdateTaskStatusRequest>
    {
        public BulkUpdateTaskStatusRequestValidator()
        {
            RuleFor(x => x.Ids)
                .NotNull()
                .WithMessage("Ids are required.")
                .Must(ids => ids != null && ids.Count > 0)
                .WithMessage("At least one task id must be provided.");

            RuleForEach(x => x.Ids)
                .NotEmpty()
                .WithMessage("Task id cannot be empty.");

            RuleFor(x => x.Status)
                .NotEmpty()
                .WithMessage("Status is required.")
                .Must(BeValidStatus)
                .WithMessage("Invalid status value.");
        }

        private static bool BeValidStatus(string status)
        {
            return StatusRules.IsValid(status);
        }
    }
}
