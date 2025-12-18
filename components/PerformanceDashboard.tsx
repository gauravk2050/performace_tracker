'use client';

import { useState } from 'react';
import { Task, ActivityLog, Category } from '@/types';
import {
  getDailyStats,
  getWeeklyStats,
  getMonthlyStats,
  getQuarterlyStats,
  getTaskCompletionRate,
  formatDate,
} from '@/lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PerformanceDashboardProps {
  tasks: Task[];
  activities: ActivityLog[];
  categories: Category[];
}

export default function PerformanceDashboard({
  tasks,
  activities,
  categories,
}: PerformanceDashboardProps) {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('weekly');

  const dailyStats = getDailyStats(activities);
  const weeklyStats = getWeeklyStats(activities);
  const monthlyStats = getMonthlyStats(activities);
  const quarterlyStats = getQuarterlyStats(activities);
  const completionRate = getTaskCompletionRate(tasks);

  const getCurrentStats = () => {
    switch (timeRange) {
      case 'daily':
        return dailyStats;
      case 'weekly':
        return weeklyStats;
      case 'monthly':
        return monthlyStats;
      case 'quarterly':
        return quarterlyStats;
    }
  };

  const currentStats = getCurrentStats();

  // Prepare chart data
  const weeklyChartData = weeklyStats.dailyStats?.map((day) => ({
    date: formatDate(day.date),
    hours: day.totalHours,
    activities: day.activityCount,
  })) || [];

  const categoryChartData = Object.entries(currentStats.categoryStats || {}).map(([name, minutes]) => {
    const category = categories.find((c) => c.name === name);
    return {
      name,
      value: minutes / 60,
      color: category?.color || '#6b7280',
    };
  });

  const COLORS = categoryChartData.map((item) => item.color);

  const taskPriorityData = tasks.reduce(
    (acc, task) => {
      if (!task.completed) {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const priorityChartData = Object.entries(taskPriorityData).map(([priority, count]) => ({
    priority: priority.charAt(0).toUpperCase() + priority.slice(1),
    count,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Dashboard</h2>
          <div className="flex gap-2">
            {(['daily', 'weekly', 'monthly', 'quarterly'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Hours</div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {currentStats.totalHours.toFixed(1)}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Activities</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {currentStats.activityCount}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Task Completion</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {completionRate}%
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Tasks</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {tasks.filter((t) => !t.completed).length}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {timeRange === 'weekly' && weeklyChartData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Weekly Activity Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="hours" stroke="#6366f1" name="Hours" />
                <Line type="monotone" dataKey="activities" stroke="#10b981" name="Activities" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {categoryChartData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Category Breakdown ({timeRange})
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {priorityChartData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Pending Tasks by Priority
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {categoryChartData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Category Hours ({timeRange})
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

