using FluentAssertions;
using FluentValidation.TestHelper;
using Lateral.Tasks.Application.Requests.Tasks;
using Lateral.Tasks.Application.Validators.Tasks;

namespace Lateral.Tasks.Application.UnitTests.Validators
{
    public class CreateTaskRequestValidatorTests
    {
        private readonly CreateTaskRequestValidator _validator = new();

        [Fact]
        public void Description_Is_Required_When_Empty()
        {
            var model = new CreateTaskRequest("");

            var result = _validator.TestValidate(model);

            result.ShouldHaveValidationErrorFor(x => x.Description);
        }

        [Fact]
        public void Description_Is_Required_When_Whitespace()
        {
            var model = new CreateTaskRequest("   ");

            var result = _validator.TestValidate(model);

            result.ShouldHaveValidationErrorFor(x => x.Description);
        }

        [Fact]
        public void Description_Must_Not_Exceed_30_Chars()
        {
            var model = new CreateTaskRequest(new string('a', 31));

            var result = _validator.TestValidate(model);

            result.ShouldHaveValidationErrorFor(x => x.Description);
        }

        [Fact]
        public void Description_With_30_Chars_Is_Valid()
        {
            var model = new CreateTaskRequest(new string('a', 30));

            var result = _validator.TestValidate(model);

            result.ShouldNotHaveValidationErrorFor(x => x.Description);
        }
    }
}
