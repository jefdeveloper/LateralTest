import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { TasksService } from "./TaskService";
import type { Task } from "../domain/tasks/task";
import type { PagedResult } from "../domain/common/PagedResult";

function makeJsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function makeTextResponse(status: number, text: string) {
  return new Response(text, { status, headers: { "content-type": "text/plain; charset=utf-8" } });
}

describe("TasksService", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock as any);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("list calls GET /tasks with paging and returns paged result", async () => {
    const svc = new TasksService("https://localhost:5001");

    const data: PagedResult<Task> = {
      items: [{ id: "1", description: "A", status: "Pending" }],
      page: 1,
      pageSize: 10,
      total: 1,
    };

    fetchMock.mockResolvedValueOnce(makeJsonResponse(200, data));

    const result = await svc.list(1, 10);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://localhost:5001/tasks?page=1&pageSize=10");
    expect(init.method).toBe("GET");
    expect(result.total).toBe(1);
    expect(result.items[0].description).toBe("A");
  });

  test("create POSTs and returns Task", async () => {
    const svc = new TasksService("https://localhost:5001");

    const created: Task = { id: "1", description: "X", status: "Pending" };
    fetchMock.mockResolvedValueOnce(makeJsonResponse(200, created));

    const result = await svc.create("X");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://localhost:5001/tasks");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ description: "X" });
    expect(result.id).toBe("1");
  });

  test("updateStatus PUTs and returns Task", async () => {
    const svc = new TasksService("https://localhost:5001");

    const updated: Task = { id: "1", description: "X", status: "InProgress" };
    fetchMock.mockResolvedValueOnce(makeJsonResponse(200, updated));

    const result = await svc.updateStatus("1", "InProgress");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://localhost:5001/tasks/1/status");
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body)).toEqual({ status: "InProgress" });
    expect(result.status).toBe("InProgress");
  });

  test("bulkUpdateStatus PUTs and returns updated count", async () => {
    const svc = new TasksService("https://localhost:5001");

    fetchMock.mockResolvedValueOnce(makeJsonResponse(200, { updated: 2 }));

    const result = await svc.bulkUpdateStatus(["1", "2"], "InProgress");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://localhost:5001/tasks/status/bulk");
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body)).toEqual({ ids: ["1", "2"], status: "InProgress" });
    expect(result.updated).toBe(2);
  });

  test("throws user friendly error on ProblemDetails json", async () => {
    const svc = new TasksService("https://localhost:5001");

    fetchMock.mockResolvedValueOnce(
      makeJsonResponse(409, { title: "Task.InvalidTransition", detail: "Status cannot transition." })
    );

    await expect(svc.updateStatus("1", "Finished")).rejects.toThrow(/Status cannot transition/i);
  });

  test("throws user friendly error on ValidationProblemDetails json", async () => {
    const svc = new TasksService("https://localhost:5001");

    fetchMock.mockResolvedValueOnce(
      makeJsonResponse(400, {
        title: "Validation Failed",
        errors: { Status: ["Invalid status value."] },
      })
    );

    await expect(svc.updateStatus("1", "X" as any)).rejects.toThrow(/Invalid status value/i);
  });

  test("throws error on plain text body", async () => {
    const svc = new TasksService("https://localhost:5001");

    fetchMock.mockResolvedValueOnce(makeTextResponse(500, "boom"));

    await expect(svc.list(1, 10)).rejects.toThrow(/boom/i);
  });
});