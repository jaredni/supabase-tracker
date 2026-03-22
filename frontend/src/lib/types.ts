export type TaskStatus = "new" | "ongoing" | "on_hold" | "completed";

export interface Fte {
  id: number;
  created_at: string;
  name: string;
}

export interface Task {
  id: number;
  created_at: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  requestor: number | null;
  assignee: number | null;
}

export interface TaskWithFtes extends Task {
  requestor_fte: Fte | null;
  assignee_fte: Fte | null;
}

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "ongoing", label: "Ongoing" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
];

export const STATUS_COLORS: Record<TaskStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  ongoing: "bg-yellow-100 text-yellow-800",
  on_hold: "bg-gray-100 text-gray-800",
  completed: "bg-green-100 text-green-800",
};
