import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

export type TaskStatus = "Pending" | "InProgress" | "Finished";

function statusLabel(s: TaskStatus) {
  if (s === "Pending") return "Pending";
  if (s === "InProgress") return "In progress";
  return "Finished";
}

function getNextStatuses(current: TaskStatus): TaskStatus[] {
  if (current === "Pending") return ["InProgress"];
  if (current === "InProgress") return ["Finished"];
  return []; // Finished -> locked
}

type Props = {
  open: boolean;
  busy: boolean;
  title: string;
  subtitle?: string;
  currentStatus: TaskStatus;

  onClose: () => void;
  onConfirm: (newStatus: TaskStatus) => void;
};

export function StatusDialog({
  open,
  busy,
  title,
  subtitle,
  currentStatus,
  onClose,
  onConfirm,
}: Props) {
  const allowed = getNextStatuses(currentStatus);
  const locked = allowed.length === 0;
  const nextStatus: TaskStatus | undefined = allowed[0];
  const canConfirm = !busy && !locked && !!nextStatus;

  const descId = "status-dialog-desc";
  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="status-dialog-title"
      aria-describedby={descId}
    >
      <DialogTitle id="status-dialog-title">{title}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {subtitle ? <Typography>{subtitle}</Typography> : null}

          {locked ? (
            <Typography color="text.secondary" id={descId}>
              This task is locked (Finished) and cannot be updated.
            </Typography>
          ) : (
            <Typography id={descId}>
              Do you want to move the task(s) to the next status?
              <br />
              <b>{statusLabel(currentStatus)}</b>
              {nextStatus ? (
                <>
                  {" "}
                  → <b>{statusLabel(nextStatus)}</b>
                </>
              ) : null}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={() => nextStatus && onConfirm(nextStatus)}
          disabled={!canConfirm}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}