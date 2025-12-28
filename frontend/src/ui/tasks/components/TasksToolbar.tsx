import { Box, Button, Chip, Stack, Typography } from "@mui/material";

type Props = {
  total: number;
  selected: number;

  onAdd: () => void;
  onBulkStatus: () => void;

  disabled: boolean;
  bulkEnabled: boolean;

  bulkHint?: string | null;
};

export function TasksToolbar({
  total,
  selected,
  onAdd,
  onBulkStatus,
  disabled,
  bulkEnabled,
  bulkHint,
}: Props) {
  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Chip label={`${total} tasks`} />
          <Chip variant="outlined" label={`${selected} selected`} />
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={onBulkStatus}
            disabled={disabled || !bulkEnabled}
          >
            Update status (bulk)
          </Button>

          <Button
            variant="contained"
            onClick={onAdd}
            disabled={disabled}
          >
            Add task
          </Button>
        </Stack>
      </Box>

      {bulkHint ? (
        <Typography variant="caption" sx={{ display: "block", mt: 1 }} color="text.secondary">
          {bulkHint}
        </Typography>
      ) : null}
    </Box>
  );
}