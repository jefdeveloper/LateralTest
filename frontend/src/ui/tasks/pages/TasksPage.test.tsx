import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TasksPage } from "./TasksPage";
import type { ITasksService } from "../../../domain/tasks/ITasksService";
import type { Task } from "../../../domain/tasks/task";
import type { PagedResult } from "../../../domain/common/PagedResult";

function makePaged(items: Task[], page = 1, pageSize = 10): PagedResult<Task> {
  return { items, page, pageSize, total: items.length };
}

function makeTask(id: string, description: string, status: Task["status"]): Task {
  return { id, description, status };
}

function makeService(initial: Task[]): ITasksService {
  return {
    list: vi.fn(async (page: number, pageSize: number) => makePaged(initial, page, pageSize)),
    create: vi.fn(async (description: string) => makeTask("new", description, "Pending")),
    updateStatus: vi.fn(async (id: string, status: Task["status"]) => makeTask(id, "X", status)),
    bulkUpdateStatus: vi.fn(async (ids: string[], _status: Task["status"]) => ({ updated: ids.length })),
  };
}

async function waitInitialLoad() {
  await screen.findByRole("button", { name: /Add task/i });
}

function getBulkButton() {
  return (
    screen.queryByRole("button", { name: /Update status \(bulk\)/i }) ||
    screen.getByRole("button", { name: /Update status in bulk/i })
  );
}

function getTasksTable() {
  return (
    screen.queryByRole("table", { name: /tasks (table|list)/i }) ||
    screen.getByRole("table")
  );
}

async function clickCheckboxByLabel(user: ReturnType<typeof userEvent.setup>, label: string) {
  const cb = await screen.findByRole("checkbox", { name: label });
  await user.click(cb);
  return cb;
}

describe("TasksPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("bulk button is initially disabled and enables after selecting tasks with same status (not Finished)", async () => {
    const tasks: Task[] = [
      makeTask("1", "Pay bills", "Pending"),
      makeTask("2", "Read docs", "Pending"),
    ];
    const service = makeService(tasks);

    render(<TasksPage service={service} />);
    await waitInitialLoad();

    expect(getTasksTable()).toBeInTheDocument();

    const bulkBtn = getBulkButton();
    expect(bulkBtn).toBeDisabled();

    const user = userEvent.setup();

    await clickCheckboxByLabel(user, "select Pay bills");

    await waitFor(() => expect(bulkBtn).toBeEnabled());
  });

  test("bulk button enables with selection, but shows error alert if selecting different statuses and clicking bulk", async () => {
    const tasks: Task[] = [
      makeTask("1", "A", "Pending"),
      makeTask("2", "B", "InProgress"),
    ];
    const service = makeService(tasks);

    render(<TasksPage service={service} />);
    await waitInitialLoad();

    const user = userEvent.setup();

    const cbA = await screen.findByRole("checkbox", { name: "select A" });
    const cbB = await screen.findByRole("checkbox", { name: "select B" });

    await user.click(cbA);
    await user.click(cbB);

    const bulkBtn = getBulkButton();
    await waitFor(() => expect(bulkBtn).toBeEnabled());

    await user.click(bulkBtn);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/bulk update is not allowed/i);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(service.bulkUpdateStatus).not.toHaveBeenCalled();
  });

  test("shows ApiUnavailable when API/network is unavailable", async () => {
    const service: ITasksService = {
      list: vi.fn(async () => { throw new Error("Failed to fetch"); }),
      create: vi.fn(),
      updateStatus: vi.fn(),
      bulkUpdateStatus: vi.fn(),
      baseUrl: "http://localhost:3000/api"
    } as any;
    render(<TasksPage service={service} />);

    expect(await screen.findByText(/could not connect to the tasks api/i)).toBeInTheDocument();
    expect(screen.getByText(/please check your connection/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  test("Finished row: checkbox is disabled and bulk remains disabled when only finished is present", async () => {
    const tasks: Task[] = [makeTask("1", "Done", "Finished")];
    const service = makeService(tasks);

    render(<TasksPage service={service} />);
    await waitInitialLoad();

    const cb = await screen.findByRole("checkbox", { name: "select Done" });
    expect(cb).toBeDisabled();

    const bulkBtn = getBulkButton();
    expect(bulkBtn).toBeDisabled();

    expect(screen.queryByRole("button", { name: "Done" })).not.toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  test("single update calls updateStatus when task is not Finished (Pending -> InProgress)", async () => {
    const tasks: Task[] = [makeTask("1", "X", "Pending")];
    const service = makeService(tasks);

    render(<TasksPage service={service} />);
    await waitInitialLoad();

    const user = userEvent.setup();

    const table = getTasksTable();
    const cell = within(table).getByText("X");
    await user.click(cell);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/Update status/i)).toBeInTheDocument();

    const confirmBtn = within(dialog).getByRole("button", { name: /Confirm/i });
    expect(confirmBtn).toBeEnabled();

    await user.click(confirmBtn);

    expect(service.updateStatus).toHaveBeenCalledTimes(1);
    expect(service.updateStatus).toHaveBeenCalledWith("1", "InProgress");
  });

  test("bulk update calls bulkUpdateStatus with selected ids when allowed (Pending -> InProgress)", async () => {
    const tasks: Task[] = [
      makeTask("1", "A", "Pending"),
      makeTask("2", "B", "Pending"),
    ];
    const service = makeService(tasks);

    render(<TasksPage service={service} />);
    await waitInitialLoad();

    const user = userEvent.setup();

    const cbA = await clickCheckboxByLabel(user, "select A");
    const cbB = await clickCheckboxByLabel(user, "select B");

    expect(cbA).toBeChecked();
    expect(cbB).toBeChecked();

    const bulkBtn = getBulkButton();
    await waitFor(() => expect(bulkBtn).toBeEnabled());

    await user.click(bulkBtn);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/Update status in bulk/i)).toBeInTheDocument();

    expect(within(dialog).getByText((t) => t.includes("Updating 2 task(s)."))).toBeInTheDocument();

    const confirmBtn = within(dialog).getByRole("button", { name: /Confirm/i });
    expect(confirmBtn).toBeEnabled();

    await user.click(confirmBtn);

    await waitFor(() => expect(service.bulkUpdateStatus).toHaveBeenCalledTimes(1));

    const [ids, status] = (service.bulkUpdateStatus as any).mock.calls[0] as [string[], string];
    expect(ids.slice().sort()).toEqual(["1", "2"]);
    expect(status).toBe("InProgress");
  });
});
