import type { PagedResult } from "../common/PagedResult";
import type { Task } from "./task";

export interface ITasksService {
  list(page: number, pageSize: number): Promise<PagedResult<Task>>;
  create(description: string): Promise<Task>;
  updateStatus(id: string, status: Task["status"]): Promise<Task>;
  bulkUpdateStatus(ids: string[], status: Task["status"]): Promise<{ updated: number }>;
}
