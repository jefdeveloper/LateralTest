import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddTaskDialog } from "./AddTaskDialog";

describe("AddTaskDialog", () => {
  const onClose = vi.fn();
  const onConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderDialog(
    props?: Partial<React.ComponentProps<typeof AddTaskDialog>>
  ) {
    render(
      <AddTaskDialog
        open={true}
        busy={false}
        onClose={onClose}
        onConfirm={onConfirm}
        {...props}
      />
    );
  }

  function getInput() {
    return screen.getByLabelText("Description");
  }

  function getHelper() {
    return document.getElementById("desc-helper");
  }

  it("renders dialog with input and buttons", () => {
    renderDialog();

    expect(screen.getByRole("dialog", { name: /add task/i })).toBeInTheDocument();

    const input = getInput();
    expect(input).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe("");

    expect(screen.getByRole("button", { name: /cancel/i })).toBeEnabled();

    const confirmBtn = screen.getByRole("button", { name: /confirm/i });
    expect(confirmBtn).toBeDisabled();

    expect(getHelper()).toHaveTextContent("0/30");
  });

  it("resets input and touched state when dialog opens", () => {
    const { rerender } = render(
      <AddTaskDialog open={false} busy={false} onClose={onClose} onConfirm={onConfirm} />
    );

    rerender(
      <AddTaskDialog open={true} busy={false} onClose={onClose} onConfirm={onConfirm} />
    );

    const input = getInput();
    expect((input as HTMLInputElement).value).toBe("");
    expect(getHelper()).toHaveTextContent("0/30");

    // confirm ainda desabilitado => touched resetado também (sem erro de required)
    expect(screen.queryByText(/description is required/i)).not.toBeInTheDocument();
  });

  it("shows validation error when confirming empty description (via Enter)", async () => {
    renderDialog();
    const user = userEvent.setup();

    const input = getInput();
    await user.click(input);
    await user.keyboard("{Enter}");

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    await waitFor(() => {
      const helper = getHelper();
      expect(helper).not.toBeNull();
      expect(helper!.textContent).toContain("Description is required.");
      expect(helper!.textContent).toContain("0/30");
    });
  });

  it("prevents typing more than 30 characters", async () => {
    renderDialog();
    const user = userEvent.setup();

    const input = getInput();
    await user.type(input, "a".repeat(60));

    expect((input as HTMLInputElement).value.length).toBe(30);
    expect(getHelper()).toHaveTextContent("30/30");
  });

  it("trims description on blur", async () => {
    renderDialog();
    const user = userEvent.setup();

    const input = getInput();
    await user.type(input, "   hello world   ");

    // blur
    await user.tab();

    expect((input as HTMLInputElement).value).toBe("hello world");
  });

  it("calls onConfirm with trimmed value and closes dialog on confirm", async () => {
    renderDialog();
    const user = userEvent.setup();

    const input = getInput();
    await user.type(input, "  My task  ");

    const confirmBtn = screen.getByRole("button", { name: /confirm/i });
    expect(confirmBtn).toBeEnabled();

    await user.click(confirmBtn);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith("My task");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("submits on Enter key when valid", async () => {
    renderDialog();
    const user = userEvent.setup();

    const input = getInput();
    await user.type(input, "Task");
    await user.keyboard("{Enter}");

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith("Task");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not submit on Enter when busy", async () => {
    renderDialog({ busy: true });
    const user = userEvent.setup();

    const input = getInput();
    await user.type(input, "Task");
    await user.keyboard("{Enter}");

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("disables actions when busy", () => {
    renderDialog({ busy: true });

    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /confirm/i })).toBeDisabled();
  });

  it("does not call onConfirm when empty or invalid", async () => {
    renderDialog();
    const user = userEvent.setup();

    // vazio -> confirm disabled, então valida via Enter
    const input = getInput();
    await user.click(input);
    await user.keyboard("{Enter}");

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("accepts exactly 30 chars and submits", async () => {
    renderDialog();
    const user = userEvent.setup();

    const input = getInput();
    await user.type(input, "a".repeat(30));

    expect(getHelper()).toHaveTextContent("30/30");

    const confirmBtn = screen.getByRole("button", { name: /confirm/i });
    expect(confirmBtn).toBeEnabled();

    await user.click(confirmBtn);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith("a".repeat(30));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
