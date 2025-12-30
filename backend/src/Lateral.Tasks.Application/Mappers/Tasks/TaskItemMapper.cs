using Lateral.Tasks.Application.Responses.Tasks;
using Lateral.Tasks.Domain.Entities;

namespace Lateral.Tasks.Application.Mappers.Tasks
{
    public static class TaskItemMapper
    {
        public static TaskItemDto ToDto(this TaskItem e) =>
            new(e.Id, e.Description, e.Status.ToString());
    }
}
