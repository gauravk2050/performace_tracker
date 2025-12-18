import { Task, ActivityLog, Category } from '@/types';

const STORAGE_KEYS = {
  TASKS: 'performance_tracker_tasks',
  ACTIVITIES: 'performance_tracker_activities',
  CATEGORIES: 'performance_tracker_categories',
  SETTINGS: 'performance_tracker_settings',
};

export interface Settings {
  email: string;
  emailServiceId?: string;
  emailTemplateId?: string;
  emailPublicKey?: string;
  weeklyReminderEnabled: boolean;
  weeklyReportEnabled: boolean;
}

export const storage = {
  // Tasks
  getTasks: (): Task[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  },

  saveTasks: (tasks: Task[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  // Activities
  getActivities: (): ActivityLog[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return data ? JSON.parse(data) : [];
  },

  saveActivities: (activities: ActivityLog[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  },

  // Categories
  getCategories: (): Category[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (data) return JSON.parse(data);
    // Default categories
    const defaultCategories: Category[] = [
      { id: '1', name: 'Gym', color: '#ef4444', createdAt: new Date().toISOString() },
      { id: '2', name: 'Office Task', color: '#3b82f6', createdAt: new Date().toISOString() },
      { id: '3', name: 'Personal Task', color: '#10b981', createdAt: new Date().toISOString() },
      { id: '4', name: 'Learning', color: '#f59e0b', createdAt: new Date().toISOString() },
      { id: '5', name: 'Reading Book', color: '#8b5cf6', createdAt: new Date().toISOString() },
    ];
    storage.saveCategories(defaultCategories);
    return defaultCategories;
  },

  saveCategories: (categories: Category[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  // Settings
  getSettings: (): Settings => {
    if (typeof window === 'undefined') {
      return {
        email: '',
        weeklyReminderEnabled: false,
        weeklyReportEnabled: false,
      };
    }
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data
      ? JSON.parse(data)
      : {
          email: '',
          weeklyReminderEnabled: false,
          weeklyReportEnabled: false,
        };
  },

  saveSettings: (settings: Settings): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
};

