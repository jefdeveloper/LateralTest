using Lateral.Tasks.Domain.Enums;

namespace Lateral.Tasks.Application.Validators.Tasks
{
    public static class StatusRules
    {
        public static bool IsValid(string status) =>
            Enum.TryParse<TaskItemStatus>(status, true, out _);

        public static TaskItemStatus Parse(string status) =>
            Enum.Parse<TaskItemStatus>(status, true);

        public static bool CanTransition(TaskItemStatus current, TaskItemStatus next)
        {
            if (current == TaskItemStatus.Finished) return false;

            return (current, next) switch
            {
                (TaskItemStatus.Pending, TaskItemStatus.InProgress) => true,
                (TaskItemStatus.InProgress, TaskItemStatus.Finished) => true,
                _ => false
            };
        }
    }
}
