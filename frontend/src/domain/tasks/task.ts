export type TaskStatus = "Pending" | "InProgress" | "Finished";

export type Task = {
  id: string;
  description: string;
  status: TaskStatus;
  createdAt?: string;
};