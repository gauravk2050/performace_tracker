'use client';

import { useState } from 'react';
import { ActivityLog, Task, Category } from '@/types';
import { getToday, formatDate } from '@/lib/utils';

interface ActivityLoggerProps {
  activities: ActivityLog[];
  tasks: Task[];
  categories: Category[];
  onUpdate: (activities: ActivityLog[]) => void;
}

export default function ActivityLogger({
  activities,
  tasks,
  categories,
  onUpdate,
}: ActivityLoggerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [newActivity, setNewActivity] = useState({
    taskId: tasks[0]?.id || '',
    date: getToday(),
    duration: 60,
    notes: '',
  });

  const handleAddActivity = () => {
    if (!newActivity.taskId) return;

    const task = tasks.find((t) => t.id === newActivity.taskId);
    if (!task) return;

    const activity: ActivityLog = {
      id: Date.now().toString(),
      taskId: newActivity.taskId,
      taskName: task.name,
      category: task.category,
      date: newActivity.date,
      duration: newActivity.duration,
      notes: newActivity.notes,
    };

    onUpdate([...activities, activity]);
    setNewActivity({
      taskId: tasks[0]?.id || '',
      date: getToday(),
      duration: 60,
      notes: '',
    });
    setShowAddModal(false);
  };

  const handleDelete = (activityId: string) => {
    onUpdate(activities.filter((a) => a.id !== activityId));
  };

  const filteredActivities = activities.filter((a) => a.date === selectedDate);
  const filteredActivitiesSorted = [...filteredActivities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalMinutes = filteredActivities.reduce((sum, a) => sum + a.duration, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logger</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Log Activity
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 dark:text-gray-300 font-medium">Total Time Logged:</span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {(totalMinutes / 60).toFixed(1)} hours
          </span>
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {filteredActivities.length} activities logged
        </div>
      </div>

      <div className="space-y-3">
        {filteredActivitiesSorted.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No activities logged for this date. Start logging your activities!
          </p>
        ) : (
          filteredActivitiesSorted.map((activity) => {
            const category = categories.find((c) => c.name === activity.category);
            return (
              <div
                key={activity.id}
                className="flex items-start justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {activity.taskName}
                    </h3>
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: category?.color + '20',
                        color: category?.color,
                      }}
                    >
                      {activity.category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Duration: {activity.duration} minutes ({(activity.duration / 60).toFixed(1)} hours)
                  </div>
                  {activity.notes && (
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      Notes: {activity.notes}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(activity.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-4"
                >
                  Delete
                </button>
              </div>
            );
          })
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Log Activity</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Task
                </label>
                <select
                  value={newActivity.taskId}
                  onChange={(e) => setNewActivity({ ...newActivity, taskId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.name} ({task.category})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newActivity.date}
                  onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={newActivity.duration}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, duration: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={newActivity.notes}
                  onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Add any notes about this activity..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddActivity}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Log Activity
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

