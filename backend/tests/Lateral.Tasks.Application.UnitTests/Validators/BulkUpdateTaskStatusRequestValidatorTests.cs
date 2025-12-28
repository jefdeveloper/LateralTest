using FluentAssertions;
using FluentValidation.TestHelper;
using Lateral.Tasks.Application.Requests.Tasks;
using Lateral.Tasks.Application.Validators.Tasks;

namespace Lateral.Tasks.Application.UnitTests.Validators
{
    public class BulkUpdateTaskStatusRequestValidatorTests
    {
        private readonly BulkUpdateTaskStatusRequestValidator _validator = new();

        [Fact]
        public void Ids_Must_Not_Be_Null()
        {
            var model = new BulkUpdateTaskStatusRequest(null!, "Pending");

            var result = _validator.TestValidate(model);

            result.ShouldHaveValidationErrorFor(x => x.Ids);
        }

        [Fact]
        public void Ids_Must_Not_Be_Empty()
        {
            var model = new BulkUpdateTaskStatusRequest([], "Pending");

            var result = _validator.TestValidate(model);

            result.ShouldHaveValidationErrorFor(x => x.Ids);
        }

        [Fact]
        public void Ids_Cannot_Contain_Empty_Guid()
        {
            var model = new BulkUpdateTaskStatusRequest([Guid.Empty], "Pending");

            var result = _validator.TestValidate(model);

            result.ShouldHaveValidationErrorFor("Ids[0]");
        }

        [Fact]
        public void Ids_Cannot_Contain_Empty_Guid_Even_With_Other_Valid_Ids()
        {
            var model = new BulkUpdateTaskStatusRequest([Guid.NewGuid(), Guid.Empty], "Pending");

            var result = _validator.TestValidate(model);

            result.ShouldHaveValidationErrorFor("Ids[1]");
        }

        [Fact]
        public void Status_Is_Required()
        {
            var model = new BulkUpdateTaskStatusRequest([Guid.NewGuid()], "");

            var result = _validator.TestValidate(model);

            result.ShouldHaveValidationErrorFor(x => x.Status);
        }

        [Theory]
        [InlineData("Pending")]
        [InlineData("InProgress")]
        [InlineData("Finished")]
        public void Valid_Status_Is_Accepted(string status)
        {
            var model = new BulkUpdateTaskStatusRequest([Guid.NewGuid()], status);

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
            var model = new BulkUpdateTaskStatusRequest([Guid.NewGuid()], status);

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
            var model = new BulkUpdateTaskStatusRequest([Guid.NewGuid()], status);

            var result = _validator.TestValidate(model);

            result.ShouldHaveValidationErrorFor(x => x.Status);
        }
    }
}
