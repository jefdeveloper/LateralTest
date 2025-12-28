import { describe, expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusDialog } from "./StatusDialog";

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

  test("Pending: shows only next status (InProgress) and confirm calls onConfirm(InProgress)", async () => {
    const props = renderDialog({ currentStatus: "Pending" });
    const dialog = await screen.findByRole("dialog");

    const combo = within(dialog).getByRole("combobox", { name: /status/i });
    expect(combo).toBeInTheDocument();

    const confirm = within(dialog).getByRole("button", { name: /confirm/i });
    expect(confirm).toBeEnabled();

    expect(within(dialog).getByText(/Allowed transition:/i)).toBeInTheDocument();

    expect(within(dialog).getByText(/Pending/i)).toBeInTheDocument();
    expect(within(dialog).getAllByText(/In progress/i).length).toBeGreaterThanOrEqual(1);

    const user = userEvent.setup();
    await user.click(combo);

    expect(await screen.findByRole("option", { name: /In progress/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /^Pending$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /^Finished$/i })).not.toBeInTheDocument();

    await user.click(confirm);

    expect(props.onConfirm).toHaveBeenCalledTimes(1);
    expect(props.onConfirm).toHaveBeenCalledWith("InProgress");
  });

  test("InProgress: shows only next status (Finished) and confirm calls onConfirm(Finished)", async () => {
    const props = renderDialog({ currentStatus: "InProgress" });
    const dialog = await screen.findByRole("dialog");

    const combo = within(dialog).getByRole("combobox", { name: /status/i });
    expect(combo).toBeInTheDocument();

    const confirm = within(dialog).getByRole("button", { name: /confirm/i });
    expect(confirm).toBeEnabled();

    expect(within(dialog).getByText(/Allowed transition:/i)).toBeInTheDocument();
    expect(within(dialog).getAllByText(/Finished/i).length).toBeGreaterThanOrEqual(1);

    const user = userEvent.setup();
    await user.click(combo);

    expect(await screen.findByRole("option", { name: /^Finished$/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /In progress/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Pending/i })).not.toBeInTheDocument();

    await user.click(confirm);

    expect(props.onConfirm).toHaveBeenCalledTimes(1);
    expect(props.onConfirm).toHaveBeenCalledWith("Finished");
  });

  test("Finished: locked state hides Select, shows locked message, confirm disabled", async () => {
    renderDialog({ currentStatus: "Finished" });
    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).queryByRole("combobox", { name: /status/i })).not.toBeInTheDocument();

    expect(
      within(dialog).getByText(/This task is locked \(Finished\) and cannot be updated\./i)
    ).toBeInTheDocument();

    const confirm = within(dialog).getByRole("button", { name: /confirm/i });
    expect(confirm).toBeDisabled();

    expect(within(dialog).queryByText(/Allowed transition:/i)).not.toBeInTheDocument();
  });

  test("busy: Cancel disabled, Confirm disabled, Select disabled", async () => {
    const props = renderDialog({ busy: true, currentStatus: "Pending" });
    const dialog = await screen.findByRole("dialog");

    const cancel = within(dialog).getByRole("button", { name: /cancel/i });
    const confirm = within(dialog).getByRole("button", { name: /confirm/i });

    expect(cancel).toBeDisabled();
    expect(confirm).toBeDisabled();

    const combo = within(dialog).getByRole("combobox", { name: /status/i });

    expect(combo).toHaveAttribute("aria-disabled", "true");

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
    let combo = within(dialog).getByRole("combobox", { name: /status/i });

    expect(combo).toHaveTextContent(/In progress/i);

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
    combo = within(dialog).getByRole("combobox", { name: /status/i });

    expect(combo).toHaveTextContent(/^Finished$/i);

    const confirm = within(dialog).getByRole("button", { name: /confirm/i });
    expect(confirm).toBeEnabled();

    const user = userEvent.setup();
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