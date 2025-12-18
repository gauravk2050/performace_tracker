export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  name: string;
  category: string;
  priority: Priority;
  createdAt: string;
  completed: boolean;
  completedAt?: string;
  goal?: number; // Monthly goal (e.g., 30 days)
}

export interface ActivityLog {
  id: string;
  taskId: string;
  taskName: string;
  category: string;
  date: string;
  duration: number; // in minutes
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

