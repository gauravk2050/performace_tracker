'use client';

import { useState, useMemo, useEffect } from 'react';
import { Task, ActivityLog } from '@/types';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  subDays,
  startOfWeek,
  endOfWeek,
  getWeek,
  addWeeks,
  getDay,
} from 'date-fns';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

interface TaskTrackerProps {
  tasks: Task[];
  activities: ActivityLog[];
  onUpdate: (tasks: Task[]) => void;
  onActivityUpdate: (activities: ActivityLog[]) => void;
}

interface TaskCompletion {
  taskId: string;
  date: string;
  completed: boolean;
}

interface WeekData {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  days: Date[];
}

export default function TaskTracker({ tasks, activities, onUpdate, onActivityUpdate }: TaskTrackerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>([]);

  // Initialize task completions from activities
  useEffect(() => {
    const completions: TaskCompletion[] = [];
    activities.forEach((activity) => {
      const existing = completions.find(
        (c) => c.taskId === activity.taskId && c.date === activity.date
      );
      if (!existing) {
        completions.push({
          taskId: activity.taskId,
          date: activity.date,
          completed: true,
        });
      }
    });
    setTaskCompletions(completions);
  }, [activities]);

  // Update currentMonth when year/month changes
  useEffect(() => {
    const newDate = new Date(selectedYear, selectedMonth, 1);
    setCurrentMonth(newDate);
  }, [selectedYear, selectedMonth]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Organize days into weeks
  const weeks: WeekData[] = useMemo(() => {
    const weeksArray: WeekData[] = [];
    let currentWeekStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    let weekNumber = 1;

    while (currentWeekStart <= monthEnd) {
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      const weekDays = eachDayOfInterval({
        start: currentWeekStart > monthStart ? currentWeekStart : monthStart,
        end: weekEnd < monthEnd ? weekEnd : monthEnd,
      });

      if (weekDays.length > 0) {
        weeksArray.push({
          weekNumber,
          startDate: currentWeekStart,
          endDate: weekEnd,
          days: weekDays,
        });
        weekNumber++;
      }

      currentWeekStart = addWeeks(currentWeekStart, 1);
      if (weekNumber > 5) break; // Max 5 weeks
    }

    return weeksArray;
  }, [monthStart, monthEnd]);

  const handleToggleCompletion = (taskId: string, date: string) => {
    const existing = taskCompletions.find(
      (c) => c.taskId === taskId && c.date === date
    );

    const isCurrentlyCompleted = existing?.completed || false;
    const willBeCompleted = !isCurrentlyCompleted;

    let updated: TaskCompletion[];
    if (existing) {
      updated = taskCompletions.map((c) =>
        c.taskId === taskId && c.date === date ? { ...c, completed: !c.completed } : c
      );
    } else {
      updated = [...taskCompletions, { taskId, date, completed: true }];
    }

    setTaskCompletions(updated);

    // Sync with activity logs
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      if (willBeCompleted) {
        const existingActivity = activities.find(
          (a) => a.taskId === taskId && a.date === date
        );
        if (!existingActivity) {
          const newActivity: ActivityLog = {
            id: Date.now().toString(),
            taskId: taskId,
            taskName: task.name,
            category: task.category,
            date: date,
            duration: 60,
            notes: 'Completed via tracker',
          };
          onActivityUpdate([...activities, newActivity]);
        }
      } else {
        const updatedActivities = activities.filter(
          (a) => !(a.taskId === taskId && a.date === date)
        );
        onActivityUpdate(updatedActivities);
      }
    }
  };

  const isTaskCompletedOnDate = (taskId: string, date: string): boolean => {
    const completion = taskCompletions.find(
      (c) => c.taskId === taskId && c.date === date && c.completed
    );
    return !!completion;
  };

  // Calculate weekly statistics
  const weeklyStats = weeks.map((week) => {
    const weekCompletions = taskCompletions.filter((c) => {
      const completionDate = parseISO(c.date);
      return (
        c.completed &&
        completionDate >= week.startDate &&
        completionDate <= week.endDate
      );
    });

    const totalPossible = tasks.length * week.days.length;
    const completed = weekCompletions.length;
    const left = totalPossible - completed;
    const percentage = totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0;

    // Daily breakdown
    const dailyStats = week.days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayCompletions = taskCompletions.filter(
        (c) => c.date === dateStr && c.completed
      );
      return {
        date: dateStr,
        completed: dayCompletions.length,
        total: tasks.length,
      };
    });

    return {
      weekNumber: week.weekNumber,
      completed,
      left,
      total: totalPossible,
      percentage,
      dailyStats,
    };
  });

  // Calculate monthly progress
  const monthlyProgress = useMemo(() => {
    const totalPossible = tasks.length * daysInMonth.length;
    const totalCompleted = taskCompletions.filter((c) => c.completed).length;
    const completed = totalCompleted;
    const left = totalPossible - completed;
    const percentage = totalPossible > 0 ? (completed / totalPossible) * 100 : 0;

    return {
      completed,
      left,
      total: totalPossible,
      percentage: Math.round(percentage),
    };
  }, [tasks.length, daysInMonth.length, taskCompletions]);

  // Calculate trend data for line chart (last 30 days)
  const trendData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return format(date, 'yyyy-MM-dd');
    });

    return last30Days.map((date) => {
      const dayCompletions = taskCompletions.filter(
        (c) => c.date === date && c.completed
      );
      const totalTasks = tasks.length;
      const percentage = totalTasks > 0 ? (dayCompletions.length / totalTasks) * 100 : 0;
      return {
        date: format(parseISO(date), 'MMM dd'),
        percentage: Math.round(percentage),
      };
    });
  }, [taskCompletions, tasks.length]);

  // Calculate overall progress for each task
  const taskProgress = tasks.map((task) => {
    const taskCompletionsForTask = taskCompletions.filter(
      (c) => c.taskId === task.id && c.completed
    );
    const completed = taskCompletionsForTask.length;
    const left = daysInMonth.length - completed;
    const percentage = daysInMonth.length > 0
      ? Math.round((completed / daysInMonth.length) * 100)
      : 0;

    return {
      task,
      completed,
      left,
      percentage,
    };
  });

  // Top 10 tasks by completion
  const topTasks = [...taskProgress]
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 10);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="space-y-3 sm:space-y-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen p-2 sm:p-4">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">HABIT TRACKER</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">- {monthNames[selectedMonth]} -</p>
          </div>
          <div className="bg-blue-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg w-full sm:w-auto">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">CALENDAR SETTINGS</h3>
            <div className="flex gap-2 sm:gap-4">
              <div className="flex-1 sm:flex-initial">
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">YEAR</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full sm:w-auto px-2 sm:px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 sm:flex-initial">
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">MONTH</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full sm:w-auto px-2 sm:px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                >
                  {monthNames.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Section: Charts and Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Line Chart - Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Daily Completion Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value: number | undefined) => value !== undefined ? `${value}%` : '0%'} />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Progress and Top Tasks */}
        <div className="space-y-4">
          {/* Monthly Progress Donut */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">OVERVIEW MONTHLY PROGRESS</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'COMPL', value: monthlyProgress.completed, fill: '#3b82f6' },
                      { name: 'LEFT', value: monthlyProgress.left, fill: '#e5e7eb' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                COMPL {monthlyProgress.percentage}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                LEFT {100 - monthlyProgress.percentage}%
              </div>
            </div>
          </div>

          {/* Top 10 Tasks */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">TOP 10 DAILY HABITS</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {topTasks.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No tasks yet</p>
              ) : (
                topTasks.map((item, index) => (
                  <div key={item.task.id} className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-600 dark:text-gray-400 w-6">
                      {index + 1}.
                    </span>
                    <span className="text-gray-900 dark:text-white flex-1">{item.task.name}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {item.completed}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Progress Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">OVERVIEW - WEEKLY PROGRESS</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 overflow-x-auto">
          {weeks.map((week) => {
            const stats = weeklyStats.find((s) => s.weekNumber === week.weekNumber);
            if (!stats) return null;

            return (
              <div key={week.weekNumber} className="min-w-[140px]">
                <div className="text-center font-semibold text-gray-900 dark:text-white mb-2">
                  WEEK {week.weekNumber}
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 mb-2">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {format(week.startDate, 'MMM d')} - {format(week.endDate, 'MMM d')}
                  </div>
                  <div className="space-y-1 text-xs">
                    {week.days.map((day, idx) => {
                      const dayStats = stats.dailyStats[idx];
                      return (
                        <div key={day.toISOString()} className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            {format(day, 'EEE d')}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {dayStats?.completed || 0}/{dayStats?.total || 0}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {stats.completed}/{stats.total}
                  </div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {stats.percentage}%
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Tracker Grid - Spreadsheet Style */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 sm:p-4 overflow-x-auto -mx-2 sm:mx-0">
        <div className="inline-block min-w-full">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-blue-100 dark:bg-blue-900 border border-gray-300 dark:border-gray-600 p-2 sm:p-3 text-left font-bold text-gray-900 dark:text-white min-w-[120px] sm:min-w-[200px]">
                  <span className="hidden sm:inline">DAILY HABITS</span>
                  <span className="sm:hidden">HABITS</span>
                </th>
                <th className="bg-blue-100 dark:bg-blue-900 border border-gray-300 dark:border-gray-600 p-2 sm:p-3 text-center font-bold text-gray-900 dark:text-white min-w-[50px] sm:min-w-[80px]">
                  GOALS
                </th>
                {weeks.map((week) => (
                  <th
                    key={week.weekNumber}
                    colSpan={week.days.length}
                    className="bg-blue-100 dark:bg-blue-900 border border-gray-300 dark:border-gray-600 p-1 sm:p-3 text-center font-bold text-gray-900 dark:text-white text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">WEEK {week.weekNumber}</span>
                    <span className="sm:hidden">W{week.weekNumber}</span>
                  </th>
                ))}
              </tr>
              <tr>
                <th className="sticky left-0 z-10 bg-blue-50 dark:bg-blue-800 border border-gray-300 dark:border-gray-600"></th>
                <th className="bg-blue-50 dark:bg-blue-800 border border-gray-300 dark:border-gray-600"></th>
                {weeks.map((week) =>
                  week.days.map((day) => (
                    <th
                      key={day.toISOString()}
                      className="bg-blue-50 dark:bg-blue-800 border border-gray-300 dark:border-gray-600 p-1 sm:p-2 text-center min-w-[35px] sm:min-w-[50px]"
                    >
                      <div className="text-[10px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {format(day, 'EEE')}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                        {format(day, 'd')}
                      </div>
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={2 + weeks.reduce((sum, w) => sum + w.days.length, 0)}
                    className="text-center py-8 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600"
                  >
                    No tasks yet. Create tasks to start tracking!
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const progress = taskProgress.find((p) => p.task.id === task.id);
                  const goal = task.goal || daysInMonth.length;

                  return (
                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {/* Task Name */}
                      <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-2 sm:p-3 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                        <div className="truncate max-w-[100px] sm:max-w-none">{task.name}</div>
                      </td>
                      {/* Goal */}
                      <td className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-2 sm:p-3 text-center font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                        {goal}
                      </td>
                      {/* Week Checkboxes */}
                      {weeks.map((week) =>
                        week.days.map((day) => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const isCompleted = isTaskCompletedOnDate(task.id, dateStr);
                          const isToday = isSameDay(day, new Date());

                          return (
                            <td
                              key={day.toISOString()}
                              className={`border border-gray-300 dark:border-gray-600 p-1 sm:p-2 text-center ${
                                isToday ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-white dark:bg-gray-800'
                              }`}
                            >
                              <button
                                onClick={() => handleToggleCompletion(task.id, dateStr)}
                                className={`w-6 h-6 sm:w-8 sm:h-8 rounded border-2 flex items-center justify-center mx-auto transition-all touch-manipulation ${
                                  isCompleted
                                    ? 'bg-green-500 border-green-600 dark:bg-green-600 dark:border-green-700'
                                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-green-400 active:border-green-500'
                                } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                                title={`${format(day, 'MMM d, yyyy')} - ${isCompleted ? 'Mark incomplete' : 'Mark complete'}`}
                              >
                                {isCompleted && (
                                  <svg
                                    className="w-3 h-3 sm:w-5 sm:h-5 text-white"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="3"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path d="M5 13l4 4L19 7"></path>
                                  </svg>
                                )}
                              </button>
                            </td>
                          );
                        })
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overall Progress Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">OVERALL PROGRESS</h3>
        <div className="space-y-2 sm:space-y-3">
          {taskProgress.map((item) => (
            <div key={item.task.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="w-full sm:w-48 text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                {item.task.name}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>
                    COMPLETED {item.completed} LEFT {item.left}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {item.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
