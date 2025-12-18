'use client';

import { useState } from 'react';
import { Task, Category, Priority } from '@/types';
import { getToday } from '@/lib/utils';

interface TaskManagerProps {
  tasks: Task[];
  categories: Category[];
  onUpdate: (tasks: Task[]) => void;
}

export default function TaskManager({ tasks, categories, onUpdate }: TaskManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    category: categories[0]?.name || '',
    priority: 'medium' as Priority,
    goal: 30,
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  const handleAddTask = () => {
    if (!newTask.name.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      name: newTask.name,
      category: newTask.category,
      priority: newTask.priority,
      createdAt: new Date().toISOString(),
      completed: false,
      goal: newTask.goal,
    };

    onUpdate([...tasks, task]);
    setNewTask({ name: '', category: categories[0]?.name || '', priority: 'medium', goal: 30 });
    setShowAddModal(false);
  };

  const handleToggleComplete = (taskId: string) => {
    const updated = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            completed: !task.completed,
            completedAt: task.completed ? undefined : new Date().toISOString(),
          }
        : task
    );
    onUpdate(updated);
  };

  const handleDelete = (taskId: string) => {
    onUpdate(tasks.filter((t) => t.id !== taskId));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task Manager</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add Task
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No tasks found. Create your first task!
          </p>
        ) : (
          sortedTasks.map((task) => {
            const category = categories.find((c) => c.name === task.category);
            return (
              <div
                key={task.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  task.completed
                    ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id)}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <h3
                      className={`font-medium ${
                        task.completed
                          ? 'line-through text-gray-500 dark:text-gray-400'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {task.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: category?.color + '20',
                          color: category?.color,
                        }}
                      >
                        {task.category}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(task.id)}
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
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add New Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Task Name
                </label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter task name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monthly Goal (days)
                </label>
                <input
                  type="number"
                  value={newTask.goal}
                  onChange={(e) => setNewTask({ ...newTask, goal: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  min="1"
                  max="31"
                  placeholder="30"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Target number of days to complete this task per month
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddTask}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Add Task
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

