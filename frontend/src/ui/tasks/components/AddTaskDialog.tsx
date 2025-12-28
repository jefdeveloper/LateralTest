import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

type Props = {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onConfirm: (description: string) => void;
};

const MAX_DESC = 30;

export function AddTaskDialog({ open, busy, onClose, onConfirm }: Props) {
  const [desc, setDesc] = useState("");

  const trimmed = useMemo(() => desc.trim(), [desc]);
  const isEmpty = trimmed.length === 0;
  const isTooLong = trimmed.length > MAX_DESC;

  useEffect(() => {
    if (open) setDesc("");
  }, [open]);

  function confirm() {
    onConfirm(trimmed);
    onClose();
  }

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Add Task</DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          fullWidth
          size="small"
          inputProps={{ maxLength: MAX_DESC }}
          error={isEmpty || isTooLong}
          helperText={
            isEmpty
              ? "Description is required."
              : isTooLong
              ? "Maximum of 30 characters."
              : `${trimmed.length}/${MAX_DESC}`
          }
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={confirm}
          disabled={busy || isEmpty || isTooLong}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}