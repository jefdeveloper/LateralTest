import { useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TablePagination,
  Typography,
} from "@mui/material";

import type { ITasksService } from "../../../domain/tasks/ITasksService";
import { useTasksPage } from "../hooks/useTasksPage";
import { TasksList } from "../components/TasksList";
import { StatusDialog } from "../components/StatusDialog";
import { AddTaskDialog } from "../components/AddTaskDialog";

type Props = {
  service: ITasksService;
};

export function TasksPage({ service }: Props) {
  const vm = useTasksPage(service);

  const onOpenBulk = () => {
    if (!vm.canBulkUpdate) {
      vm.closeDialog();
      
      (vm as any).setError?.(
        "Bulk update is not allowed. Select tasks with the same status that are not finished."
      );
      return;
    }
    vm.openBulk();
  };

  const onOpenSingle = (task: any) => {
    if (task?.status === "Finished") {
      (vm as any).setError?.("Finished tasks are locked and cannot be updated.");
      return;
    }
    vm.openSingle(task);
  };

  const bulkSubtitle = useMemo(() => {
    if (vm.selectedCount === 0) return "Select tasks to update them in bulk.";
    if (!vm.canBulkUpdate)
      return "Bulk update is not allowed for the current selection.";
    return `Updating ${vm.selectedCount} task(s).`;
  }, [vm.selectedCount, vm.canBulkUpdate]);

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Tasks</Typography>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={vm.openAdd} disabled={vm.busy}>
            Add task
          </Button>

          <Button
            variant="outlined"
            onClick={onOpenBulk}
            disabled={!vm.canBulkUpdate || vm.busy}
          >
            Update status (bulk)
          </Button>
        </Stack>
      </Stack>

      {vm.apiUnavailable && (
        <Stack sx={{ mt: 2 }} spacing={1}>
          <Alert severity="error">{vm.error ?? "API unavailable"}</Alert>
          <Button onClick={vm.retry} variant="outlined">
            Retry
          </Button>
        </Stack>
      )}

      {vm.error && !vm.apiUnavailable && (
        <Alert sx={{ mt: 2 }} severity="error">
          {vm.error}
        </Alert>
      )}

      {vm.loading ? (
        <Stack sx={{ mt: 3 }} alignItems="center">
          <CircularProgress />
        </Stack>
      ) : (
        <>
          <TasksList
            tasks={vm.tasks}
            selected={vm.selected}
            onToggleSelect={vm.toggleSelect}
            onOpenSingle={onOpenSingle}
          />

          <Box sx={{ mt: 2 }}>
            <TablePagination
              component="div"
              count={vm.total}
              page={vm.page - 1}
              onPageChange={(_, newPage) => vm.setPage(newPage + 1)}
              rowsPerPage={vm.pageSize}
              onRowsPerPageChange={(e) =>
                vm.setPageSize(parseInt(e.target.value, 10))
              }
              rowsPerPageOptions={[5, 10, 20, 50]}
            />
          </Box>
        </>
      )}

      <AddTaskDialog
        open={vm.dialog.kind === "add"}
        busy={vm.busy}
        onClose={vm.closeDialog}
        onConfirm={vm.addTask}
      />

      <StatusDialog
        open={vm.dialog.kind === "single" && !!vm.singleTask}
        busy={vm.busy}
        title="Update status"
        subtitle={vm.singleTask?.description}
        currentStatus={(vm.singleTask?.status ?? "Pending") as any}
        onClose={vm.closeDialog}
        onConfirm={vm.updateSingleStatus as any}
      />

      <StatusDialog
        open={vm.dialog.kind === "bulk"}
        busy={vm.busy}
        title="Update status in bulk"
        subtitle={bulkSubtitle}
        currentStatus={(vm.bulkStatus ?? "Pending") as any}
        onClose={vm.closeDialog}
        onConfirm={vm.updateBulkStatus as any}
      />
    </Box>
  );
}