import { describe, it, expect, vi } from "vitest";
import { renderWithMui } from "../../../test/TestUtils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TasksList } from "./TasksList";
import type { Task } from "../../../domain/tasks/task";

const baseTasks: Task[] = [
  { id: "1", description: "Task 1", status: "Pending" },
  { id: "2", description: "Task 2", status: "InProgress" },
  { id: "3", description: "Task 3", status: "Finished" },
];

describe("TasksList", () => {
  it("renders empty state", () => {
    renderWithMui(
      <TasksList tasks={[]} selected={new Set()} onToggleSelect={vi.fn()} onOpenSingle={vi.fn()} />
    );
    expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
  });

  it("renders all tasks and status chips", () => {
    renderWithMui(
      <TasksList tasks={baseTasks} selected={new Set()} onToggleSelect={vi.fn()} onOpenSingle={vi.fn()} />
    );
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Finished")).toBeInTheDocument();
  });

  it("checkboxes reflect selection and lock finished", async () => {
    const selected = new Set(["1"]);
    const onToggleSelect = vi.fn();
    renderWithMui(
      <TasksList tasks={baseTasks} selected={selected} onToggleSelect={onToggleSelect} onOpenSingle={vi.fn()} />
    );
    // Pending is checked
    expect(screen.getAllByRole("checkbox")[1]).toBeChecked();
    // Finished is disabled
    expect(screen.getAllByRole("checkbox")[3]).toBeDisabled();
    // Click on InProgress
    await userEvent.click(screen.getAllByRole("checkbox")[2]);
    expect(onToggleSelect).toHaveBeenCalledWith("2");
  });

  it("calls onOpenSingle when clicking task name (not locked)", async () => {
    const onOpenSingle = vi.fn();
    renderWithMui(
      <TasksList tasks={baseTasks} selected={new Set()} onToggleSelect={vi.fn()} onOpenSingle={onOpenSingle} />
    );
    await userEvent.click(screen.getByText("Task 1"));
    expect(onOpenSingle).toHaveBeenCalledWith(baseTasks[0]);
  });

  it("header checkbox selects/deselects all enabled", async () => {
    const selected = new Set<string>();
    const onToggleSelect = vi.fn();
    renderWithMui(
      <TasksList tasks={baseTasks} selected={selected} onToggleSelect={onToggleSelect} onOpenSingle={vi.fn()} />
    );
    // Click header checkbox
    await userEvent.click(screen.getAllByRole("checkbox")[0]);
    // Should call for Pending and InProgress (not Finished)
    expect(onToggleSelect).toHaveBeenCalledWith("1");
    expect(onToggleSelect).toHaveBeenCalledWith("2");
    expect(onToggleSelect).not.toHaveBeenCalledWith("3");
  });
});
