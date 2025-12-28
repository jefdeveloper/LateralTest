using FluentValidation;
using Lateral.Tasks.Application.Requests.Tasks;

namespace Lateral.Tasks.Application.Validators.Tasks
{
    public sealed class CreateTaskRequestValidator : AbstractValidator<CreateTaskRequest>
    {
        public CreateTaskRequestValidator()
        {
            RuleFor(x => x.Description)
                .NotEmpty()
                .WithMessage("Description is required.")
                .Must(d => !string.IsNullOrWhiteSpace(d))
                .WithMessage("Description is required.")
                .MaximumLength(30)
                .WithMessage("Description must be at most 30 characters.");
        }
    }
}
