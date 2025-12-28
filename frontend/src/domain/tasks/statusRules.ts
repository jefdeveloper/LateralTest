import type { TaskStatus } from "./task";

export function getNextStatuses(current: TaskStatus): TaskStatus[] {
  if (current === "Pending") return ["InProgress"];
  if (current === "InProgress") return ["Finished"];
  return [];
}

export function canTransition(current: TaskStatus, next: TaskStatus): boolean {
  return getNextStatuses(current).includes(next);
}