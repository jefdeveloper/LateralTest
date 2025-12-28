import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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
  const allowed = useMemo(() => getNextStatuses(currentStatus), [currentStatus]);
  const locked = allowed.length === 0;

  const [value, setValue] = useState<TaskStatus>(currentStatus);

  useEffect(() => {
    setValue(allowed[0] ?? currentStatus);
  }, [open, currentStatus, allowed]);

  const canConfirm = !busy && !locked && value === allowed[0];

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {subtitle ? <Typography>{subtitle}</Typography> : null}

          {locked ? (
            <Typography color="text.secondary">
              This task is locked (Finished) and cannot be updated.
            </Typography>
          ) : (
            <FormControl fullWidth size="small">
              <InputLabel id="status-label">Status</InputLabel>

              <Select
                labelId="status-label"
                id="status-select"
                label="Status"
                value={value}
                onChange={(e) => setValue(e.target.value as TaskStatus)}
                disabled={busy}
              >
                {allowed.map((s) => (
                  <MenuItem key={s} value={s}>
                    {statusLabel(s)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {!locked ? (
            <Typography variant="caption" color="text.secondary">
              Allowed transition: <b>{statusLabel(currentStatus)}</b> →{" "}
              <b>{statusLabel(allowed[0])}</b>
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={() => onConfirm(value)}
          disabled={!canConfirm}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}