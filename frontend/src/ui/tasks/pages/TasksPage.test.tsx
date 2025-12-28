import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TasksPage } from "./TasksPage";
import type { ITasksService } from "../../../domain/tasks/ITasksService";
import type { Task } from "../../../domain/tasks/task";
import type { PagedResult } from "../../../domain/common/PagedResult";

function makePaged(items: Task[], page = 1, pageSize = 10): PagedResult<Task> {
  return {
    items,
    page,
    pageSize,
    total: items.length,
  };
}

function makeTask(id: string, description: string, status: Task["status"]): Task {
  return { id, description, status };
}

function makeService(initial: Task[]): ITasksService {
  return {
    list: vi.fn(async (page: number, pageSize: number) => {
      return makePaged(initial, page, pageSize);
    }),
    create: vi.fn(async (description: string) => makeTask("new", description, "Pending")),
    updateStatus: vi.fn(async (id: string, status: Task["status"]) => makeTask(id, "X", status)),
    bulkUpdateStatus: vi.fn(async (ids: string[], _status: Task["status"]) => ({ updated: ids.length })),
  };
}

async function waitInitialLoad() {
  await screen.findByRole("button", { name: /Add task/i });
}

function getTitleHeading() {
  return screen.getByRole("heading", { level: 4, name: /^Tasks$/i });
}

describe("TasksPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("bulk button starts disabled and becomes enabled after selecting tasks with same status (not Finished)", async () => {
    const tasks: Task[] = [
      makeTask("1", "Pay bills", "Pending"),
      makeTask("2", "Read docs", "Pending"),
    ];

    const service = makeService(tasks);

    render(<TasksPage service={service} />);

    expect(getTitleHeading()).toBeInTheDocument();

    await waitInitialLoad();
    await screen.findByRole("button", { name: "Pay bills" });

    const bulkBtn = screen.getByRole("button", { name: /Update status \(bulk\)/i });
    expect(bulkBtn).toBeDisabled();

    const checkboxes = screen.getAllByRole("checkbox");
    const user = userEvent.setup();

    await user.click(checkboxes[0]);
    expect(bulkBtn).toBeEnabled();
  });

  test("bulk button stays disabled when selecting tasks with different statuses", async () => {
    const tasks: Task[] = [
      makeTask("1", "A", "Pending"),
      makeTask("2", "B", "InProgress"),
    ];

    const service = makeService(tasks);

    render(<TasksPage service={service} />);
    await waitInitialLoad();
    await screen.findByRole("button", { name: "A" });

    const bulkBtn = screen.getByRole("button", { name: /Update status \(bulk\)/i });
    expect(bulkBtn).toBeDisabled();

    const checkboxes = screen.getAllByRole("checkbox");
    const user = userEvent.setup();

    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    expect(bulkBtn).toBeDisabled();
  });

  test("clicking Finished task does NOT open single dialog (blocked by hook)", async () => {
    const tasks: Task[] = [makeTask("1", "Done", "Finished")];
    const service = makeService(tasks);

    render(<TasksPage service={service} />);
    await waitInitialLoad();

    const linkButton = await screen.findByRole("button", { name: "Done" });

    fireEvent.click(linkButton);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("single update calls updateStatus when task is not Finished (Pending -> InProgress)", async () => {
    const tasks: Task[] = [makeTask("1", "X", "Pending")];
    const service = makeService(tasks);

    render(<TasksPage service={service} />);
    await waitInitialLoad();

    const user = userEvent.setup();
    const linkButton = await screen.findByRole("button", { name: "X" });
    await user.click(linkButton);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/^Update status$/i)).toBeInTheDocument();

    const statusSelect = within(dialog).getByLabelText(/Status/i);
    await user.click(statusSelect);

    const option = await screen.findByRole("option", { name: /In progress|InProgress/i });
    await user.click(option);

    const confirmBtn = within(dialog).getByRole("button", { name: /Confirm/i });
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
    await screen.findByRole("button", { name: "A" });

    const user = userEvent.setup();

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    const bulkBtn = screen.getByRole("button", { name: /Update status \(bulk\)/i });
    expect(bulkBtn).toBeEnabled();

    await user.click(bulkBtn);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/Update status in bulk/i)).toBeInTheDocument();

    const statusSelect = within(dialog).getByLabelText(/Status/i);
    await user.click(statusSelect);

    const option = await screen.findByRole("option", { name: /In progress|InProgress/i });
    await user.click(option);

    const confirmBtn = within(dialog).getByRole("button", { name: /Confirm/i });
    await user.click(confirmBtn);

    expect(service.bulkUpdateStatus).toHaveBeenCalledTimes(1);
    expect(service.bulkUpdateStatus).toHaveBeenCalledWith(["1", "2"], "InProgress");
  });
});