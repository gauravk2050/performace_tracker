'use client';

import { useState, useEffect } from 'react';
import { Task, ActivityLog, Category, Priority } from '@/types';
import { storage } from '@/lib/storage';
import { getToday, getDailyStats, getWeeklyStats, getMonthlyStats, getQuarterlyStats } from '@/lib/utils';
import { initReminders } from '@/lib/reminder';
import TaskManager from '@/components/TaskManager';
import ActivityLogger from '@/components/ActivityLogger';
import PerformanceDashboard from '@/components/PerformanceDashboard';
import CategoryManager from '@/components/CategoryManager';
import SettingsPanel from '@/components/SettingsPanel';
import TaskTracker from '@/components/TaskTracker';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'activities' | 'tracker' | 'categories' | 'settings'>('dashboard');

  useEffect(() => {
    setTasks(storage.getTasks());
    setActivities(storage.getActivities());
    setCategories(storage.getCategories());
    initReminders();
  }, []);

  const handleTaskUpdate = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    storage.saveTasks(updatedTasks);
  };

  const handleActivityUpdate = (updatedActivities: ActivityLog[]) => {
    setActivities(updatedActivities);
    storage.saveActivities(updatedActivities);
  };

  const handleCategoryUpdate = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
    storage.saveCategories(updatedCategories);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  Performance Tracker
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {(['dashboard', 'tasks', 'activities', 'tracker', 'categories', 'settings'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`${
                      activeTab === tab
                        ? 'border-indigo-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium capitalize`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'dashboard' && (
            <PerformanceDashboard
              tasks={tasks}
              activities={activities}
              categories={categories}
            />
          )}
          {activeTab === 'tasks' && (
            <TaskManager
              tasks={tasks}
              categories={categories}
              onUpdate={handleTaskUpdate}
            />
          )}
          {activeTab === 'activities' && (
            <ActivityLogger
              activities={activities}
              tasks={tasks}
              categories={categories}
              onUpdate={handleActivityUpdate}
            />
          )}
          {activeTab === 'tracker' && (
            <TaskTracker
              tasks={tasks}
              activities={activities}
              onUpdate={handleTaskUpdate}
              onActivityUpdate={handleActivityUpdate}
            />
          )}
          {activeTab === 'categories' && (
            <CategoryManager
              categories={categories}
              onUpdate={handleCategoryUpdate}
            />
          )}
          {activeTab === 'settings' && <SettingsPanel />}
        </div>
      </main>
    </div>
  );
}

