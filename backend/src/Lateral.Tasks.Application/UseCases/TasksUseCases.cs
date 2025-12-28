using Lateral.Tasks.Application.Common;
using Lateral.Tasks.Application.Interfaces.Repositories;
using Lateral.Tasks.Application.Interfaces.UseCases;
using Lateral.Tasks.Application.Requests.Tasks;
using Lateral.Tasks.Application.Validators.Tasks;
using Lateral.Tasks.Domain.Entities;
using Lateral.Tasks.Domain.Enums;

namespace Lateral.Tasks.Application.UseCases
{
    public sealed class TasksUseCases(ITasksRepository _tasksRepository) : ITasksUseCases
    {
        async Task<Result<PagedResult<TaskItem>>> ITasksUseCases.ListPagedAsync(int page, int pageSize, CancellationToken ct)
        {
            var paged = await _tasksRepository.ListPagedAsync(page, pageSize, ct);
            return Result<PagedResult<TaskItem>>.Ok(paged);
        }

        async Task<Result<TaskItem>> ITasksUseCases.CreateAsync(CreateTaskRequest request, CancellationToken ct)
        {
            var task = new TaskItem { Description = request.Description, Status = TaskItemStatus.Pending };
            await _tasksRepository.AddAsync(task, ct);
            await _tasksRepository.SaveChangesAsync(ct);
            return Result<TaskItem>.Ok(task);
        }

        async Task<Result<TaskItem>> ITasksUseCases.UpdateStatusAsync(UpdateTaskStatusRequest request, CancellationToken ct)
        {
            var task = await _tasksRepository.GetAsync(request.Id, ct);
            if (task is null)
                return Result<TaskItem>.Fail([new ResultError("Task.NotFound", "Task not found.", ErrorType.NotFound)]);

            if (task.Status == TaskItemStatus.Finished)
                return Result<TaskItem>.Fail([new ResultError("Task.Locked", "Finished tasks cannot be updated.", ErrorType.Forbidden)]);

            var newStatus = StatusRules.Parse(request.Status);

            if (!StatusRules.CanTransition(task.Status, newStatus))
                return Result<TaskItem>.Fail([
                    new ResultError("Task.InvalidTransition",
                                    $"Status cannot transition from {task.Status} to {newStatus}.",
                                    ErrorType.Conflict)
                ]);

            task.Status = newStatus;

            await _tasksRepository.SaveChangesAsync(ct);
            return Result<TaskItem>.Ok(task);
        }

        async Task<Result<int>> ITasksUseCases.BulkUpdateStatusAsync(BulkUpdateTaskStatusRequest request, CancellationToken ct)
        {
            var tasks = await _tasksRepository.GetManyAsync(request.Ids, ct);

            if (tasks.Count != request.Ids.Count)
                return Result<int>.Fail([new ResultError("Task.NotFound", "One or more tasks were not found.", ErrorType.NotFound)]);

            if (tasks.Any(t => t.Status == TaskItemStatus.Finished))
                return Result<int>.Fail([new ResultError("Task.Locked", "Finished tasks cannot be updated.", ErrorType.Forbidden)]);

            if (tasks.Select(t => t.Status).Distinct().Count() != 1)
                return Result<int>.Fail([new ResultError("Task.BulkStatusMismatch", "All selected tasks must have the same current status.", ErrorType.Conflict)]);

            var newStatus = StatusRules.Parse(request.Status);

            var current = tasks[0].Status;
            if (!StatusRules.CanTransition(current, newStatus))
                return Result<int>.Fail([
                    new ResultError("Task.InvalidTransition",
                                    $"Status cannot transition from {current} to {newStatus}.",
                                    ErrorType.Conflict)
                ]);

            foreach (var t in tasks) t.Status = newStatus;

            await _tasksRepository.SaveChangesAsync(ct);
            return Result<int>.Ok(tasks.Count);
        }
    }
}
