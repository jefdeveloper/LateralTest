import { useCallback, useEffect, useMemo, useState } from "react";
import type { ITasksService } from "../../../domain/tasks/ITasksService";
import type { Task } from "../../../domain/tasks/task";
import type { PagedResult } from "../../../domain/common/PagedResult";

type DialogState =
  | { kind: "none" }
  | { kind: "add" }
  | { kind: "single"; task: Task }
  | { kind: "bulk" };

type Status = Task["status"];

function canUpdateStatus(task: Task) {
  return task.status !== "Finished";
}

function isValidStatus(status: string): status is Status {
  return status === "Pending" || status === "InProgress" || status === "Finished";
}

function statusLabel(s: Status) {
  if (s === "Pending") return "Pending";
  if (s === "InProgress") return "In progress";
  return "Finished";
}

function canTransition(current: Status, next: Status) {
  if (current === "Finished") return false;

  if (current === "Pending") return next === "InProgress";
  if (current === "InProgress") return next === "Finished";

  return false;
}

function transitionErrorMessage(current: Status, next: Status) {
  return `Invalid status transition: ${statusLabel(current)} → ${statusLabel(next)}.`;
}

function isNetworkError(e: unknown) {
  const msg = String((e as any)?.message ?? e ?? "").toLowerCase();

  return (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("load failed") ||
    msg.includes("err_network") ||
    msg.includes("network request failed") ||
    msg.includes("econnrefused") ||
    msg.includes("ecconnrefused") ||
    msg.includes("connect") && msg.includes("refused") ||
    msg.includes("fetch") && msg.includes("failed")
  );
}

export function useTasksPage(service: ITasksService) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [apiUnavailable, setApiUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paged, setPaged] = useState<PagedResult<Task>>({
    items: [],
    page: 1,
    pageSize: 10,
    total: 0,
  });

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<DialogState>({ kind: "none" });

  const tasks = paged.items;

  const load = useCallback(
    async (page: number, pageSize: number) => {
      setLoading(true);
      setApiUnavailable(false);
      setError(null);

      try {
        const data = await service.list(page, pageSize);
        setPaged(data);
        setSelected(new Set());
      } catch (e: any) {
        const message = e?.message ?? "API unavailable";

        if (isNetworkError(e)) setApiUnavailable(true);

        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  useEffect(() => {
    void load(paged.page, paged.pageSize);
  }, []);

  const retry = useCallback(() => {
    void load(paged.page, paged.pageSize);
  }, [load, paged.page, paged.pageSize]);

  const refresh = useCallback(() => {
    void load(paged.page, paged.pageSize);
  }, [load, paged.page, paged.pageSize]);

  const setPage = useCallback(
    (page: number) => {
      void load(page, paged.pageSize);
    },
    [load, paged.pageSize]
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      void load(1, pageSize);
    },
    [load]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const openAdd = useCallback(() => setDialog({ kind: "add" }), []);

  const openSingle = useCallback((task: Task) => {
    if (task.status === "Finished") return;
    setDialog({ kind: "single", task });
  }, []);

  const openBulk = useCallback(() => setDialog({ kind: "bulk" }), []);
  const closeDialog = useCallback(() => setDialog({ kind: "none" }), []);

  const selectedCount = selected.size;

  const selectedTasks = useMemo(() => {
    if (selectedCount === 0) return [];
    const map = new Map(tasks.map((t) => [t.id, t]));
    return Array.from(selected).map((id) => map.get(id)).filter(Boolean) as Task[];
  }, [tasks, selected, selectedCount]);

  const bulkStatus = useMemo<Status | null>(() => {
    if (selectedTasks.length === 0) return null;
    const first = selectedTasks[0].status;
    return selectedTasks.every((t) => t.status === first) ? first : null;
  }, [selectedTasks]);

  const canBulkUpdate = useMemo(() => {
    if (selectedCount === 0) return false;
    if (bulkStatus === null) return false;
    if (bulkStatus === "Finished") return false;
    if (selectedTasks.some((t) => t.status === "Finished")) return false;
    return true;
  }, [selectedCount, bulkStatus, selectedTasks]);

  const bulkStatusLabel = bulkStatus ? statusLabel(bulkStatus) : "";

  const singleTask = dialog.kind === "single" ? dialog.task : null;

  const addTask = useCallback(
    async (description: string) => {
      setBusy(true);
      try {
        await service.create(description);
        refresh();
      } catch (e: any) {
        setError(e?.message ?? "Failed to create task");
      } finally {
        closeDialog();
        setBusy(false);
      }
    },
    [service, closeDialog, refresh]
  );

  const updateSingleStatus = useCallback(
    async (status: string) => {
      if (!singleTask) return;

      if (!isValidStatus(status)) {
        setError("Invalid status.");
        return;
      }

      if (!canUpdateStatus(singleTask)) {
        setError("Finished tasks cannot be updated.");
        return;
      }

      if (!canTransition(singleTask.status, status)) {
        setError(transitionErrorMessage(singleTask.status, status));
        return;
      }

      setBusy(true);
      try {
        await service.updateStatus(singleTask.id, status);
        refresh();
      } catch (e: any) {
        setError(e?.message ?? "Failed to update status");
      } finally {
        closeDialog();
        setBusy(false);
      }
    },
    [service, singleTask, closeDialog, refresh]
  );

  const updateBulkStatus = useCallback(
    async (status: string) => {
      if (!isValidStatus(status)) {
        setError("Invalid status.");
        return;
      }

      if (!canBulkUpdate || !bulkStatus) {
        setError("Bulk update not allowed for current selection.");
        return;
      }

      if (!canTransition(bulkStatus, status)) {
        setError(transitionErrorMessage(bulkStatus, status));
        return;
      }

      const ids = Array.from(selected);

      setBusy(true);
      try {
        await service.bulkUpdateStatus(ids, status);
        closeDialog();
        refresh();
      } catch (e: any) {
        setError(e?.message ?? "Failed to bulk update status");
        closeDialog();
      } finally {
        setBusy(false);
      }
    },
    [service, selected, canBulkUpdate, bulkStatus, closeDialog, refresh]
  );

  return useMemo(
    () => ({
      loading,
      busy,
      apiUnavailable,
      error,

      tasks,
      total: paged.total,
      page: paged.page,
      pageSize: paged.pageSize,

      selected,
      selectedCount,

      dialog,
      singleTask,
      bulkStatus,
      canBulkUpdate,
      bulkStatusLabel,

      setPage,
      setPageSize,

      retry,
      toggleSelect,
      openAdd,
      openSingle,
      openBulk,
      closeDialog,

      addTask,
      updateSingleStatus,
      updateBulkStatus,
    }),
    [
      loading,
      busy,
      apiUnavailable,
      error,
      tasks,
      paged.total,
      paged.page,
      paged.pageSize,
      selected,
      selectedCount,
      dialog,
      singleTask,
      bulkStatus,
      canBulkUpdate,
      bulkStatusLabel,
      setPage,
      setPageSize,
      retry,
      toggleSelect,
      openAdd,
      openSingle,
      openBulk,
      closeDialog,
      addTask,
      updateSingleStatus,
      updateBulkStatus,
    ]
  );
}