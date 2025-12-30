import { describe, expect, test, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTasksPage } from "./useTasksPage";
import type { ITasksService } from "../../../domain/tasks/ITasksService";
import type { Task } from "../../../domain/tasks/task";
import type { PagedResult } from "../../../domain/common/PagedResult";

function makePaged(items: Task[], page = 1, pageSize = 10): PagedResult<Task> {
  return { items, page, pageSize, total: items.length };
}

function makeTask(id: string, description: string, status: Task["status"]): Task {
  return { id, description, status };
}

function makeService(initial: Task[], failList = false): ITasksService {
  return {
    list: vi.fn(async (page: number, pageSize: number) => {
      if (failList) throw new Error("API unavailable");
      return makePaged(initial, page, pageSize);
    }),
    create: vi.fn(async (description: string) => makeTask("new", description, "Pending")),
    updateStatus: vi.fn(async (id: string, status: Task["status"]) => makeTask(id, "X", status)),
    bulkUpdateStatus: vi.fn(async (ids: string[], _status: Task["status"]) => ({ updated: ids.length })),
  };
}

describe("useTasksPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("loads once on mount and sets tasks", async () => {
    const service = makeService([
      makeTask("1", "A", "Pending"),
      makeTask("2", "B", "Pending"),
    ]);

    const { result } = renderHook(() => useTasksPage(service));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(service.list).toHaveBeenCalledTimes(1);
    expect(result.current.apiUnavailable).toBe(false);
    expect(result.current.tasks).toHaveLength(2);
  });

  test("when API fails, sets apiUnavailable and error", async () => {
    const service: ITasksService = {
      list: vi.fn(async () => { throw new Error("Failed to fetch"); }),
      create: vi.fn(),
      updateStatus: vi.fn(),
      bulkUpdateStatus: vi.fn(),
    };

    const { result } = renderHook(() => useTasksPage(service));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(service.list).toHaveBeenCalledTimes(1);
    expect(result.current.apiUnavailable).toBe(true);
    expect(result.current.error?.toLowerCase()).toContain("failed to fetch");
  });

  test("retry calls list again", async () => {
    const service = makeService([], true);

    const { result } = renderHook(() => useTasksPage(service));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(service.list).toHaveBeenCalledTimes(1);

    // next call succeeds
    (service.list as any).mockImplementationOnce(async (page: number, pageSize: number) =>
      makePaged([makeTask("1", "A", "Pending")], page, pageSize)
    );

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(service.list).toHaveBeenCalledTimes(2);
    expect(result.current.apiUnavailable).toBe(false);
    expect(result.current.tasks).toHaveLength(1);
  });

  test("selection + bulk: enabled only when same status and not Finished", async () => {
    const service = makeService([
      makeTask("1", "A", "Pending"),
      makeTask("2", "B", "Pending"),
    ]);

    const { result } = renderHook(() => useTasksPage(service));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.canBulkUpdate).toBe(false);

    act(() => result.current.toggleSelect("1"));
    expect(result.current.selectedCount).toBe(1);
    expect(result.current.canBulkUpdate).toBe(true);

    act(() => result.current.toggleSelect("2"));
    expect(result.current.selectedCount).toBe(2);
    expect(result.current.canBulkUpdate).toBe(true);
  });

  test("bulk disabled when selecting different statuses", async () => {
    const service = makeService([
      makeTask("1", "A", "Pending"),
      makeTask("2", "B", "InProgress"),
    ]);

    const { result } = renderHook(() => useTasksPage(service));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.toggleSelect("1"));
    act(() => result.current.toggleSelect("2"));

    expect(result.current.canBulkUpdate).toBe(false);
  });

  test("single update does not call service for invalid status string", async () => {
    const service = makeService([makeTask("1", "X", "Pending")]);

    const { result } = renderHook(() => useTasksPage(service));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.openSingle(result.current.tasks[0]));

    await act(async () => {
      await result.current.updateSingleStatus("InvalidStatus" as any);
    });

    expect(service.updateStatus).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/invalid status/i);
  });

  test("Finished task cannot be opened in single dialog (openSingle blocks it)", async () => {
    const service = makeService([makeTask("1", "Done", "Finished")]);

    const { result } = renderHook(() => useTasksPage(service));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.openSingle(result.current.tasks[0]));

    expect(result.current.dialog.kind).toBe("none");
    expect(result.current.singleTask).toBeNull();

    expect(service.updateStatus).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  test("bulk update blocks when canBulkUpdate is false", async () => {
    const service = makeService([
      makeTask("1", "A", "Pending"),
      makeTask("2", "B", "InProgress"),
    ]);

    const { result } = renderHook(() => useTasksPage(service));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.toggleSelect("1"));
    act(() => result.current.toggleSelect("2"));
    expect(result.current.canBulkUpdate).toBe(false);

    await act(async () => {
      await result.current.updateBulkStatus("InProgress");
    });

    expect(service.bulkUpdateStatus).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/bulk update not allowed/i);
  });

  test("bulk update calls service when allowed", async () => {
    const service = makeService([
      makeTask("1", "A", "Pending"),
      makeTask("2", "B", "Pending"),
    ]);

    const { result } = renderHook(() => useTasksPage(service));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.toggleSelect("1"));
    act(() => result.current.toggleSelect("2"));
    expect(result.current.canBulkUpdate).toBe(true);

    await act(async () => {
      await result.current.updateBulkStatus("InProgress");
    });

    expect(service.bulkUpdateStatus).toHaveBeenCalledTimes(1);
    expect(service.bulkUpdateStatus).toHaveBeenCalledWith(["1", "2"], "InProgress");
  });
});
