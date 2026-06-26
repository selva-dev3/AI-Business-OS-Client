export type Project = {
  id: string;
  name: string;
  description?: string;
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled";
  startDate?: string;
  endDate?: string;
  budget?: number;
  spent?: number;
  managerId?: string;
  manager?: { id: string; name: string };
  teamIds?: string[];
  clientId?: string;
  clientName?: string;
  progress: number;
  createdAt: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  projectName?: string;
  status: "todo" | "in_progress" | "review" | "done" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  estimatedHours?: number;
  loggedHours?: number;
  parentTaskId?: string;
  createdAt: string;
};

export type Milestone = {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  dueDate: string;
  completedAt?: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
};

export type TimesheetEntry = {
  id: string;
  taskId: string;
  taskName?: string;
  projectId: string;
  projectName?: string;
  userId: string;
  userName?: string;
  date: string;
  hours: number;
  description?: string;
};
