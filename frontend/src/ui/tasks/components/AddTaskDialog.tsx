import { useEffect, useState } from "react";
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
  const [touched, setTouched] = useState(false);

  const trimmed = desc.trim();
  const isEmpty = trimmed.length === 0;
  const isTooLong = trimmed.length > MAX_DESC;

  useEffect(() => {
    if (open) {
      setDesc("");
      setTouched(false);
    }
  }, [open]);


  function confirm() {
    setTouched(true);
    if (isEmpty || isTooLong) return;
    onConfirm(trimmed);
    onClose();
  }

  // Prevent typing above MAX_DESC
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value.length <= MAX_DESC) {
      setDesc(value);
    } else {
      setDesc(value.slice(0, MAX_DESC));
    }
  }

  // Auto-trim on blur
  function handleBlur() {
    setDesc((d) => d.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Enter") return;
    if (busy) return;

    e.preventDefault();
    confirm();
  }

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="add-task-title"
    >
      <DialogTitle id="add-task-title">Add Task</DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Description"
          value={desc}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          fullWidth
          size="small"
          slotProps={{
            input: { 'aria-describedby': 'desc-helper' },
            formHelperText: { id: 'desc-helper' }
          }}
          error={(touched && isEmpty) || isTooLong}
          helperText={
            ((isTooLong && `Maximum of ${MAX_DESC} characters. `) || (touched && isEmpty && "Description is required. ") || "") + `${trimmed.length}/${MAX_DESC}`
          }
          aria-label="Task description"
          id="desc-input"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
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