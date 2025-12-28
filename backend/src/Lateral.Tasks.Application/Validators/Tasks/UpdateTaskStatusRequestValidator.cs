using FluentValidation;
using Lateral.Tasks.Application.Requests.Tasks;

namespace Lateral.Tasks.Application.Validators.Tasks
{
    public sealed class UpdateTaskStatusRequestValidator : AbstractValidator<UpdateTaskStatusRequest>
    {
        public UpdateTaskStatusRequestValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty()
                .WithMessage("Task id is required.");

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
