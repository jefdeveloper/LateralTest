import { describe, it, expect, vi } from "vitest";
import { renderWithMui } from "../../../test/TestUtils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TasksToolbar } from "./TasksToolbar";

describe("TasksToolbar", () => {
  it("renders chips and buttons", () => {
    renderWithMui(
      <TasksToolbar
        total={5}
        selected={2}
        onAdd={vi.fn()}
        onBulkStatus={vi.fn()}
        disabled={false}
        bulkEnabled={true}
      />
    );
    expect(screen.getByText("5 tasks")).toBeInTheDocument();
    expect(screen.getByText("2 selected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add task/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /update status/i })).toBeInTheDocument();
  });

  it("disables buttons as expected", () => {
    renderWithMui(
      <TasksToolbar
        total={1}
        selected={0}
        onAdd={vi.fn()}
        onBulkStatus={vi.fn()}
        disabled={true}
        bulkEnabled={false}
      />
    );
    expect(screen.getByRole("button", { name: /add task/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /update status/i })).toBeDisabled();
  });

  it("calls handlers on click", async () => {
    const onAdd = vi.fn();
    const onBulkStatus = vi.fn();
    renderWithMui(
      <TasksToolbar
        total={3}
        selected={1}
        onAdd={onAdd}
        onBulkStatus={onBulkStatus}
        disabled={false}
        bulkEnabled={true}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /add task/i }));
    await userEvent.click(screen.getByRole("button", { name: /update status/i }));
    expect(onAdd).toHaveBeenCalled();
    expect(onBulkStatus).toHaveBeenCalled();
  });

  it("shows bulkHint when provided", () => {
    renderWithMui(
      <TasksToolbar
        total={2}
        selected={1}
        onAdd={vi.fn()}
        onBulkStatus={vi.fn()}
        disabled={false}
        bulkEnabled={true}
        bulkHint="Some hint here"
      />
    );
    expect(screen.getByText(/some hint here/i)).toBeInTheDocument();
  });
});
