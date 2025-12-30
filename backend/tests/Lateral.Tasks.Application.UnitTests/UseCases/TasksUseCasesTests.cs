using Lateral.Tasks.Application.Common;
using Lateral.Tasks.Application.Interfaces.Repositories;
using Lateral.Tasks.Application.Interfaces.UseCases;
using Lateral.Tasks.Application.Requests.Tasks;
using Lateral.Tasks.Application.UseCases;
using Lateral.Tasks.Domain.Entities;
using Lateral.Tasks.Domain.Enums;
using NSubstitute;

namespace Lateral.Tasks.Application.UnitTests.UseCases
{
    public sealed class TasksUseCasesTests
    {
        private static CancellationToken Ct => new CancellationTokenSource().Token;

        private static TaskItem MakeTask(Guid id, string desc, TaskItemStatus status)
            => new()
            { Id = id, Description = desc, Status = status };

        [Fact]
        public async Task ListPagedAsync_Returns_Ok_With_PagedResult()
        {
            var taskRepository = Substitute.For<ITasksRepository>();
            ITasksUseCases taskUseCase = new TasksUseCases(taskRepository);

            var paged = new PagedResult<TaskItem>(
                Items: [MakeTask(Guid.NewGuid(), "A", TaskItemStatus.Pending)],
                Page: 1,
                PageSize: 10,
                Total: 1
            );

            taskRepository.ListPagedAsync(1, 10, Arg.Any<CancellationToken>())
                .Returns(paged);

            var result = await taskUseCase
                .ListPagedAsync(1, 10, Ct);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Value);
            Assert.Equal(1, result.Value!.Total);

            await taskRepository.Received(1).ListPagedAsync(1, 10, Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task CreateAsync_Creates_Task_As_Pending_And_Saves()
        {
            var taskRepository = Substitute.For<ITasksRepository>();
            ITasksUseCases taskUseCase = new TasksUseCases(taskRepository);

            var request = new CreateTaskRequest("New task");

            var result = await taskUseCase
                .CreateAsync(request, Ct);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Value);
            Assert.Equal("New task", result.Value!.Description);
            Assert.Equal(TaskItemStatus.Pending.ToString(), result.Value.Status);

            await taskRepository.Received(1).AddAsync(Arg.Any<TaskItem>(), Arg.Any<CancellationToken>());
            await taskRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task UpdateStatusAsync_Returns_NotFound_When_Task_Does_Not_Exist()
        {
            var taskRepository = Substitute.For<ITasksRepository>();
            ITasksUseCases taskUseCase = new TasksUseCases(taskRepository);

            var id = Guid.NewGuid();

            taskRepository.GetAsync(id, Arg.Any<CancellationToken>())
                .Returns((TaskItem?)null);

            var result = await taskUseCase
                .UpdateStatusAsync(new UpdateTaskStatusRequest(id, "InProgress"), Ct);

            Assert.False(result.IsSuccess);
            Assert.NotEmpty(result.Errors);

            var err = result.Errors[0];
            Assert.Equal("Task.NotFound", err.Code);
            Assert.Equal(ErrorType.NotFound, err.Type);

            await taskRepository.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task UpdateStatusAsync_Returns_Forbidden_When_Task_Is_Finished()
        {
            var taskRepository = Substitute.For<ITasksRepository>();
            ITasksUseCases taskUseCase = new TasksUseCases(taskRepository);

            var id = Guid.NewGuid();
            var task = MakeTask(id, "Done", TaskItemStatus.Finished);

            taskRepository.GetAsync(id, Arg.Any<CancellationToken>())
                .Returns(task);

            var result = await taskUseCase
                .UpdateStatusAsync(new UpdateTaskStatusRequest(id, "InProgress"), Ct);

            Assert.False(result.IsSuccess);

            var err = result.Errors[0];
            Assert.Equal("Task.Locked", err.Code);
            Assert.Equal(ErrorType.Forbidden, err.Type);

            await taskRepository.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task UpdateStatusAsync_Returns_Conflict_When_Transition_Is_Invalid_Pending_To_Finished()
        {
            var taskRepository = Substitute.For<ITasksRepository>();
            ITasksUseCases taskUseCase = new TasksUseCases(taskRepository);

            var id = Guid.NewGuid();
            var task = MakeTask(id, "X", TaskItemStatus.Pending);

            taskRepository.GetAsync(id, Arg.Any<CancellationToken>())
                .Returns(task);

            var result = await taskUseCase
                .UpdateStatusAsync(new UpdateTaskStatusRequest(id, "Finished"), Ct);

            Assert.False(result.IsSuccess);

            var err = result.Errors[0];
            Assert.Equal("Task.InvalidTransition", err.Code);
            Assert.Equal(ErrorType.Conflict, err.Type);

            Assert.Equal(TaskItemStatus.Pending, task.Status);

            await taskRepository.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task UpdateStatusAsync_Returns_Conflict_When_Transition_Is_Invalid_InProgress_To_Pending()
        {
            var taskRepository = Substitute.For<ITasksRepository>();
            ITasksUseCases taskUseCase = new TasksUseCases(taskRepository);

            var id = Guid.NewGuid();
            var task = MakeTask(id, "X", TaskItemStatus.InProgress);

            taskRepository.GetAsync(id, Arg.Any<CancellationToken>())
                .Returns(task);

            var result = await taskUseCase
                .UpdateStatusAsync(new UpdateTaskStatusRequest(id, "Pending"), Ct);

            Assert.False(result.IsSuccess);

            var err = result.Errors[0];
            Assert.Equal("Task.InvalidTransition", err.Code);
            Assert.Equal(ErrorType.Conflict, err.Type);

            Assert.Equal(TaskItemStatus.InProgress, task.Status);

            await taskRepository.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task UpdateStatusAsync_Updates_Status_When_Transition_Is_Valid_Pending_To_InProgress()
        {
            var taskRepository = Substitute.For<ITasksRepository>();
            ITasksUseCases taskUseCase = new TasksUseCases(taskRepository);

            var id = Guid.NewGuid();
            var task = MakeTask(id, "X", TaskItemStatus.Pending);

            taskRepository.GetAsync(id, Arg.Any<CancellationToken>())
                .Returns(task);

            var result = await taskUseCase
                .UpdateStatusAsync(new UpdateTaskStatusRequest(id, "InProgress"), Ct);

            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Value);
            Assert.Equal(TaskItemStatus.InProgress, task.Status);

            await taskRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task UpdateStatusAsync_Updates_Status_When_Transition_Is_Valid_InProgress_To_Finished()
        {
            var taskRepository = Substitute.For<ITasksRepository>();
            ITasksUseCases taskUseCase = new TasksUseCases(taskRepository);

            var id = Guid.NewGuid();
            var task = MakeTask(id, "X", TaskItemStatus.InProgress);

            taskRepository.GetAsync(id, Arg.Any<CancellationToken>())
                .Returns(task);

            var result = await taskUseCase
                .UpdateStatusAsync(new UpdateTaskStatusRequest(id, "Finished"), Ct);

            Assert.True(result.IsSuccess);
            Assert.Equal(TaskItemStatus.Finished, task.Status);

            await taskRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task BulkUpdateStatusAsync_Returns_NotFound_When_Any_Task_Is_Missing()
        {
            var taskRepository = Substitute.For<ITasksRepository>();
            ITasksUseCases taskUseCase = new TasksUseCases(taskRepository);

            var ids = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() };
            var onlyOne = new List<TaskItem> { MakeTask(ids[0], "A", TaskItemStatus.Pending) };

            taskRepository.GetManyAsync(ids, Arg.Any<CancellationToken>())
                .Returns(onlyOne);

            var result = await taskUseCase
                .BulkUpdateStatusAsync(new BulkUpdateTaskStatusRequest(ids, "InProgress"), Ct);

            Assert.False(result.IsSuccess);

            var err = result.Errors[0];
            Assert.Equal("Task.NotFound", err.Code);
            Assert.Equal(ErrorType.NotFound, err.Type);

            await taskRepository.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task BulkUpdateStatusAsync_Returns_Forbidden_When_Any_Task_Is_Finished()
        {
            var taskRepository = Substitute.For<ITasksRepository>();
            ITasksUseCases taskUseCase = new TasksUseCases(taskRepository);

            var ids = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() };
            var tasks = new List<TaskItem>
            {
                MakeTask(ids[0], "A", TaskItemStatus.Pending),
                MakeTask(ids[1], "B", TaskItemStatus.Finished),
            };

            taskRepository.GetManyAsync(ids, Arg.Any<CancellationToken>())
                .Returns(tasks);

            var result = await taskUseCase
                .BulkUpdateStatusAsync(new BulkUpdateTaskStatusRequest(ids, "InProgress"), Ct);

            Assert.False(result.IsSuccess);

            var err = result.Errors[0];
            Assert.Equal("Task.Locked", err.Code);
            Assert.Equal(ErrorType.Forbidden, err.Type);

            await taskRepository.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task BulkUpdateStatusAsync_Returns_Conflict_When_Selected_Statuses_Differ()
        {
            var taskRepository = Substitute.For<ITasksRepository>();
            ITasksUseCases taskUseCase = new TasksUseCases(taskRepository);

            var ids = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() };
            var tasks = new List<TaskItem>
            {
                MakeTask(ids[0], "A", TaskItemStatus.Pending),
                MakeTask(ids[1], "B", TaskItemStatus.InProgress),
            };

            taskRepository.GetManyAsync(ids, Arg.Any<CancellationToken>())
                .Returns(tasks);

            var result = await taskUseCase
                .BulkUpdateStatusAsync(new BulkUpdateTaskStatusRequest(ids, "Finished"), Ct);

            Assert.False(result.IsSuccess);

            var err = result.Errors[0];
            Assert.Equal("Task.BulkStatusMismatch", err.Code);
            Assert.Equal(ErrorType.Conflict, err.Type);

            await taskRepository.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task BulkUpdateStatusAsync_Returns_Conflict_When_Transition_Is_Invalid_Pending_To_Finished()
        {
            var taskRepository = Substitute.For<ITasksRepository>();
            ITasksUseCases taskUseCase = new TasksUseCases(taskRepository);

            var ids = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() };
            var tasks = new List<TaskItem>
            {
                MakeTask(ids[0], "A", TaskItemStatus.Pending),
                MakeTask(ids[1], "B", TaskItemStatus.Pending),
            };

            taskRepository.GetManyAsync(ids, Arg.Any<CancellationToken>())
                .Returns(tasks);

            var result = await taskUseCase
                .BulkUpdateStatusAsync(new BulkUpdateTaskStatusRequest(ids, "Finished"), Ct);

            Assert.False(result.IsSuccess);

            var err = result.Errors[0];
            Assert.Equal("Task.InvalidTransition", err.Code);
            Assert.Equal(ErrorType.Conflict, err.Type);

            Assert.All(tasks, t => Assert.Equal(TaskItemStatus.Pending, t.Status));

            await taskRepository.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task BulkUpdateStatusAsync_Updates_All_When_Transition_Is_Valid_Pending_To_InProgress()
        {
            var taskRepository = Substitute.For<ITasksRepository>();
            ITasksUseCases taskUseCase = new TasksUseCases(taskRepository);

            var ids = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() };
            var tasks = new List<TaskItem>
            {
                MakeTask(ids[0], "A", TaskItemStatus.Pending),
                MakeTask(ids[1], "B", TaskItemStatus.Pending),
            };

            taskRepository.GetManyAsync(ids, Arg.Any<CancellationToken>())
                .Returns(tasks);

            var result = await taskUseCase
                .BulkUpdateStatusAsync(new BulkUpdateTaskStatusRequest(ids, "InProgress"), Ct);

            Assert.True(result.IsSuccess);
            Assert.Equal(2, result.Value);

            Assert.All(tasks, t => Assert.Equal(TaskItemStatus.InProgress, t.Status));

            await taskRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task BulkUpdateStatusAsync_Updates_All_When_Transition_Is_Valid_InProgress_To_Finished()
        {
            var taskRepository = Substitute.For<ITasksRepository>();
            ITasksUseCases taskUseCase = new TasksUseCases(taskRepository);

            var ids = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() };
            var tasks = new List<TaskItem>
            {
                MakeTask(ids[0], "A", TaskItemStatus.InProgress),
                MakeTask(ids[1], "B", TaskItemStatus.InProgress),
            };

            taskRepository.GetManyAsync(ids, Arg.Any<CancellationToken>())
                .Returns(tasks);

            var result = await taskUseCase
                .BulkUpdateStatusAsync(new BulkUpdateTaskStatusRequest(ids, "Finished"), Ct);

            Assert.True(result.IsSuccess);
            Assert.Equal(2, result.Value);

            Assert.All(tasks, t => Assert.Equal(TaskItemStatus.Finished, t.Status));

            await taskRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }
    }
}