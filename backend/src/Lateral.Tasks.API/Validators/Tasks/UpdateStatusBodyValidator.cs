using FluentValidation;
using Lateral.Tasks.Application.Validators.Tasks;
using static Lateral.Tasks.API.Endpoints.TasksEndpoints;

namespace Lateral.Tasks.API.Validators.Tasks
{
    public sealed class UpdateStatusBodyValidator : AbstractValidator<UpdateStatusBody>
    {
        public UpdateStatusBodyValidator()
        {
            RuleFor(x => x.Status)
                .NotEmpty()
                .WithMessage("Status is required.")
                .Must(StatusRules.IsValid)
                .WithMessage("Invalid status value.");
        }
    }
}
