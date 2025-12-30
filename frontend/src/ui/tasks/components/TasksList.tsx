import {
  Box,
  Checkbox,
  Chip,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from "@mui/material";

import type { Task } from "../../../domain/tasks/task";

type Props = {
  tasks: Task[];
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onOpenSingle: (task: Task) => void;
};


const statusChipMap: Record<Task["status"], { color: "error" | "info" | "success"; label: string }> = {
  Pending: { color: "error", label: "Pending" },
  InProgress: { color: "info", label: "In progress" },
  Finished: { color: "success", label: "Finished" },
};

export function TasksList({ tasks, selected, onToggleSelect, onOpenSingle }: Props) {
  if (!tasks || tasks.length === 0) {
    return (
      <Typography sx={{ mt: 3 }} color="text.secondary">
        No tasks found.
      </Typography>
    );
  }

  const enabledTasks = tasks.filter(t => t.status !== "Finished");
  const allEnabledSelected = enabledTasks.length > 0 && enabledTasks.every(t => selected.has(t.id));
  const someEnabledSelected = enabledTasks.some(t => selected.has(t.id));

  const handleHeaderCheckbox = (checked: boolean) => {
    enabledTasks.forEach(t => {
      if (checked && !selected.has(t.id)) onToggleSelect(t.id);
      if (!checked && selected.has(t.id)) onToggleSelect(t.id);
    });
  };

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, overflow: "hidden" }}>
      <Table size="small" aria-label="Tasks list" role="table">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" sx={{ width: 48 }}>
              <Checkbox
                indeterminate={someEnabledSelected && !allEnabledSelected}
                checked={allEnabledSelected}
                onChange={e => handleHeaderCheckbox(e.target.checked)}
                slotProps={{ input: { 'aria-label': 'select all enabled tasks' } }}
              />
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Task</TableCell>
            <TableCell sx={{ fontWeight: 600, width: 160 }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task) => {
            const locked = task.status === "Finished";
            const chip = statusChipMap[task.status];
            return (
              <TableRow
                key={task.id}
                hover
                role="row"
                aria-label={`task-row-${task.id}`}
                sx={{ "&:last-child td, &:last-child th": { borderBottom: 0 } }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.has(task.id)}
                    onChange={() => onToggleSelect(task.id)}
                    disabled={locked}
                    slotProps={{ input: { 'aria-label': `select ${task.description}` } }}
                  />
                </TableCell>

                <TableCell sx={{ verticalAlign: 'middle' }}>
                  {locked ? (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        lineHeight: '32px',
                        textDecoration: 'line-through',
                        color: 'text.disabled',
                        cursor: 'not-allowed',
                        opacity: 0.7,
                      }}
                    >
                      {task.description}
                    </Typography>
                  ) : (
                    <Link
                      component="button"
                      underline="hover"
                      onClick={() => onOpenSingle(task)}
                      sx={{ fontWeight: 500, fontSize: 14, textAlign: "left", lineHeight: '32px' }}
                    >
                      {task.description}
                    </Link>
                  )}
                </TableCell>

                <TableCell sx={{ verticalAlign: 'middle' }}>
                  <Chip size="small" color={chip.color} label={chip.label} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />
    </TableContainer>
  );
}