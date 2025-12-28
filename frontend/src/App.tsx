import { TasksPage } from "./ui/tasks/pages/TasksPage";
import { TasksService } from "./services/TaskService";

export default function App() {
  const service = new TasksService();

  return <TasksPage service={service} />;
}
