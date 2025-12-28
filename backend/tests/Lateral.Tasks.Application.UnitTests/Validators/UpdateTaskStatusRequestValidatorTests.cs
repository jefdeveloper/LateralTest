using FluentAssertions;
using FluentValidation.TestHelper;
using Lateral.Tasks.Application.Requests.Tasks;
using Lateral.Tasks.Application.Validators.Tasks;

namespace Lateral.Tasks.Application.UnitTests.Validators
{
    public class UpdateTaskStatusRequestValidatorTests
    {
        private readonly UpdateTaskStatusRequestValidator _validator = new();

        [Fact]
        public void Id_Is_Required()
        {
            var model = new UpdateTaskStatusRequest(Guid.Empty, "Pending");

            var result = _validator.TestValidate(model);

            result.ShouldHaveValidationErrorFor(x => x.Id);
        }

        [Fact]
        public void Status_Is_Required()
        {
            var model = new UpdateTaskStatusRequest(Guid.NewGuid(), "");

            var result = _validator.TestValidate(model);

            result.ShouldHaveValidationErrorFor(x => x.Status);
        }

        [Theory]
        [InlineData("Pending")]
        [InlineData("InProgress")]
        [InlineData("Finished")]
        public void Valid_Status_Is_Accepted(string status)
        {
            var model = new UpdateTaskStatusRequest(Guid.NewGuid(), status);

            var result = _validator.TestValidate(model);

            result.ShouldNotHaveValidationErrorFor(x => x.Status);
            result.IsValid.Should().BeTrue();
        }

        [Theory]
        [InlineData("pending")]
        [InlineData("INPROGRESS")]
        [InlineData("finished")]
        public void Status_Is_Case_Insensitive(string status)
        {
            var model = new UpdateTaskStatusRequest(Guid.NewGuid(), status);

            var result = _validator.TestValidate(model);

            result.ShouldNotHaveValidationErrorFor(x => x.Status);
            result.IsValid.Should().BeTrue();
        }

        [Theory]
        [InlineData("pend")]
        [InlineData("IN_PROGRESS")]
        [InlineData("Done")]
        [InlineData("X")]
        public void Invalid_Status_Is_Rejected(string status)
        {
            var model = new UpdateTaskStatusRequest(Guid.NewGuid(), status);

            var result = _validator.TestValidate(model);

            result.ShouldHaveValidationErrorFor(x => x.Status);
        }
    }
}
