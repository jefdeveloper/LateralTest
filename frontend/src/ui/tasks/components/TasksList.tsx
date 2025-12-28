import {
  Checkbox,
  Chip,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import type { Task } from "../../../domain/tasks/task";

type Props = {
  tasks: Task[];
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onOpenSingle: (task: Task) => void;
};

export function TasksList({ tasks, selected, onToggleSelect, onOpenSingle }: Props) {
  const safeTasks = tasks ?? [];

  if (safeTasks.length === 0) {
    return (
      <Typography sx={{ mt: 3 }} color="text.secondary">
        No tasks found.
      </Typography>
    );
  }

  return (
    <List sx={{ mt: 2 }}>
      {safeTasks.map((task) => {
        const locked = task.status === "Finished";

        return (
          <ListItem key={task.id} divider>
            <ListItemIcon sx={{ minWidth: 42 }} onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={selected.has(task.id)}
                onChange={() => onToggleSelect(task.id)}
                disabled={locked}
              />
            </ListItemIcon>

            <ListItemText
              primary={
                <Link
                  component="button"
                  underline="hover"
                  onClick={() => {
                    if (locked) return;
                    onOpenSingle(task);
                  }}
                  sx={{
                    textAlign: "left",
                    cursor: locked ? "not-allowed" : "pointer",
                    opacity: locked ? 0.6 : 1,
                    pointerEvents: locked ? "none" : "auto",
                  }}
                  aria-disabled={locked}
                >
                  {task.description}
                </Link>
              }
              secondary={
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  <Chip size="small" label={task.status} />
                  {locked && <Chip size="small" variant="outlined" label="Locked" />}
                </Stack>
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
}