
import type { ITasksService } from "../domain/tasks/ITasksService";
import type { Task } from "../domain/tasks/task";
import type { PagedResult } from "../domain/common/PagedResult";
import { toUserFriendlyError } from "./httpError";


type BulkUpdateResponse = { updated: number };

const JSON_HEADERS = { "Content-Type": "application/json", Accept: "application/json" };

export class TasksService implements ITasksService {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = (baseUrl ?? import.meta.env.VITE_API_BASE_URL ?? "https://localhost:5001").replace(/\/$/, "");
  }


  private url(path: string): string {
    return `${this.baseUrl}${path}`;
  }


  private async ensureOk(res: Response): Promise<Response> {
    if (res.ok) return res;
    throw await toUserFriendlyError(res);
  }


  private async getJson<T>(res: Response): Promise<T> {
    return res.json() as Promise<T>;
  }


  async list(page: number, pageSize: number): Promise<PagedResult<Task>> {
    const res = await fetch(this.url(`/tasks?page=${page}&pageSize=${pageSize}`), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    return this.getJson<PagedResult<Task>>(await this.ensureOk(res));
  }


  async create(description: string): Promise<Task> {
    const res = await fetch(this.url(`/tasks`), {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ description }),
    });
    return this.getJson<Task>(await this.ensureOk(res));
  }


  async updateStatus(id: string, status: Task["status"]): Promise<Task> {
    const res = await fetch(this.url(`/tasks/${id}/status`), {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify({ status }),
    });
    return this.getJson<Task>(await this.ensureOk(res));
  }

  async bulkUpdateStatus(ids: string[], status: Task["status"]): Promise<BulkUpdateResponse> {
    const res = await fetch(this.url(`/tasks/status/bulk`), {
      method: "PUT",
      headers: JSON_HEADERS,
      body: JSON.stringify({ ids, status }),
    });
    return this.getJson<BulkUpdateResponse>(await this.ensureOk(res));
  }
}