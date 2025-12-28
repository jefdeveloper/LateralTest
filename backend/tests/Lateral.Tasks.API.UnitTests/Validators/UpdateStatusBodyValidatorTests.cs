using FluentAssertions;
using FluentValidation.TestHelper;
using Lateral.Tasks.API.Validators.Tasks;
using static Lateral.Tasks.API.Endpoints.TasksEndpoints;

namespace Lateral.Tasks.API.UnitTests.Validators
{
    public class UpdateStatusBodyValidatorTests
    {
        private readonly UpdateStatusBodyValidator _validator = new();

        [Fact]
        public void Status_Is_Required()
        {
            var model = new UpdateStatusBody("");

            var result = _validator.TestValidate(model);

            result.ShouldHaveValidationErrorFor(x => x.Status);
        }

        [Theory]
        [InlineData("Pending")]
        [InlineData("InProgress")]
        [InlineData("Finished")]
        public void Valid_Status_Is_Accepted(string status)
        {
            var model = new UpdateStatusBody(status);

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
            var model = new UpdateStatusBody(status);

            var result = _validator.TestValidate(model);

            result.ShouldNotHaveValidationErrorFor(x => x.Status);
            result.IsValid.Should().BeTrue();
        }

        [Theory]
        [InlineData("Done")]
        [InlineData("X")]
        [InlineData("IN_PROGRESS")]
        public void Invalid_Status_Is_Rejected(string status)
        {
            var model = new UpdateStatusBody(status);

            var result = _validator.TestValidate(model);

            result.ShouldHaveValidationErrorFor(x => x.Status);
        }
    }
}
