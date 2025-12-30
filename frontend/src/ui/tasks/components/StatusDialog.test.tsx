
import { describe, expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusDialog } from "./StatusDialog";

const user = userEvent.setup();

function getConfirm(dialog: HTMLElement) {
  return within(dialog).getByRole("button", { name: /confirm/i });
}
function getCancel(dialog: HTMLElement) {
  return within(dialog).getByRole("button", { name: /cancel/i });
}

function renderDialog(
  override?: Partial<React.ComponentProps<typeof StatusDialog>>
) {
  const props: React.ComponentProps<typeof StatusDialog> = {
    open: true,
    busy: false,
    title: "Update status",
    subtitle: "My task",
    currentStatus: "Pending",
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    ...override,
  };

  render(<StatusDialog {...props} />);
  return props;
}

describe("StatusDialog", () => {
  test("renders title and subtitle", async () => {
    renderDialog({ title: "Update status", subtitle: "Hello" });

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Update status")).toBeInTheDocument();
    expect(within(dialog).getByText("Hello")).toBeInTheDocument();
  });

  test("Pending: shows next status message and confirm calls onConfirm(InProgress)", async () => {
    const props = renderDialog({ currentStatus: "Pending" });
    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText(/Do you want to move the task\(s\) to the next status\?/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Pending/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/In progress/i)).toBeInTheDocument();

    const confirm = getConfirm(dialog);
    expect(confirm).toBeEnabled();
    await user.click(confirm);

    expect(props.onConfirm).toHaveBeenCalledTimes(1);
    expect(props.onConfirm).toHaveBeenCalledWith("InProgress");
  });

  test("InProgress: shows next status message and confirm calls onConfirm(Finished)", async () => {
    const props = renderDialog({ currentStatus: "InProgress" });
    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText(/Do you want to move the task\(s\) to the next status\?/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/In progress/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Finished/i)).toBeInTheDocument();

    const confirm = getConfirm(dialog);
    expect(confirm).toBeEnabled();
    await user.click(confirm);

    expect(props.onConfirm).toHaveBeenCalledTimes(1);
    expect(props.onConfirm).toHaveBeenCalledWith("Finished");
  });

  test("Finished: locked state shows locked message, confirm disabled", async () => {
    renderDialog({ currentStatus: "Finished" });
    const dialog = await screen.findByRole("dialog");

    expect(
      within(dialog).getByText(/This task is locked \(Finished\) and cannot be updated\./i)
    ).toBeInTheDocument();

    const confirm = getConfirm(dialog);
    expect(confirm).toBeDisabled();
  });

  test("busy: Cancel disabled, Confirm disabled", async () => {
    const props = renderDialog({ busy: true, currentStatus: "Pending" });
    const dialog = await screen.findByRole("dialog");

    const cancel = getCancel(dialog);
    const confirm = getConfirm(dialog);
    expect(cancel).toBeDisabled();
    expect(confirm).toBeDisabled();

    expect(props.onClose).not.toHaveBeenCalled();
    expect(props.onConfirm).not.toHaveBeenCalled();
  });

  test("updates default value when currentStatus changes", async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    const { rerender } = render(
      <StatusDialog
        open={true}
        busy={false}
        title="Update status"
        subtitle="Task"
        currentStatus="Pending"
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    let dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/In progress/i)).toBeInTheDocument();

    rerender(
      <StatusDialog
        open={true}
        busy={false}
        title="Update status"
        subtitle="Task"
        currentStatus="InProgress"
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/^Finished$/i)).toBeInTheDocument();

    const confirm = getConfirm(dialog);
    expect(confirm).toBeEnabled();
    await user.click(confirm);

    expect(onConfirm).toHaveBeenCalledWith("Finished");
  });

  test("does not render subtitle when not provided", async () => {
    renderDialog({ subtitle: undefined });

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/Update status/i)).toBeInTheDocument();
    expect(within(dialog).queryByText("My task")).not.toBeInTheDocument();
  });
});