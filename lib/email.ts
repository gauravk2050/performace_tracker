import emailjs from '@emailjs/browser';
import { ActivityLog, Task } from '@/types';
import { getWeeklyStats, getTaskCompletionRate, formatDate } from './utils';
import { storage, Settings } from './storage';

export const sendWeeklyReport = async (
  activities: ActivityLog[],
  tasks: Task[],
  settings: Settings
): Promise<boolean> => {
  if (!settings.email || !settings.emailServiceId || !settings.emailTemplateId || !settings.emailPublicKey) {
    console.warn('Email settings not configured');
    return false;
  }

  try {
    const weeklyStats = getWeeklyStats(activities);
    const completionRate = getTaskCompletionRate(tasks);
    const completedTasks = tasks.filter((t) => t.completed).length;
    const pendingTasks = tasks.filter((t) => !t.completed).length;

    const templateParams = {
      to_email: settings.email,
      week_start: formatDate(weeklyStats.dailyStats[0]?.date || new Date()),
      week_end: formatDate(weeklyStats.dailyStats[6]?.date || new Date()),
      total_hours: weeklyStats.totalHours.toFixed(1),
      total_activities: weeklyStats.activityCount,
      completed_tasks: completedTasks,
      pending_tasks: pendingTasks,
      completion_rate: completionRate,
      category_breakdown: Object.entries(weeklyStats.categoryStats)
        .map(([category, minutes]) => `${category}: ${(minutes / 60).toFixed(1)}h`)
        .join(', '),
    };

    await emailjs.send(
      settings.emailServiceId,
      settings.emailTemplateId,
      templateParams,
      settings.emailPublicKey
    );

    return true;
  } catch (error) {
    console.error('Failed to send weekly report:', error);
    return false;
  }
};

export const sendWeeklyReminder = async (settings: Settings): Promise<boolean> => {
  if (!settings.email || !settings.emailServiceId || !settings.emailTemplateId || !settings.emailPublicKey) {
    console.warn('Email settings not configured');
    return false;
  }

  try {
    const tasks = storage.getTasks();
    const pendingTasks = tasks.filter((t) => !t.completed);
    const activities = storage.getActivities();
    const today = formatDate(new Date());
    const todayActivities = activities.filter((a) => a.date === today);

    const templateParams = {
      to_email: settings.email,
      pending_tasks_count: pendingTasks.length,
      pending_tasks: pendingTasks.slice(0, 5).map((t) => t.name).join(', '),
      logged_today: todayActivities.length > 0 ? 'Yes' : 'No',
      reminder_message: todayActivities.length === 0
        ? "Don't forget to log your activities today!"
        : 'Great job logging today! Keep it up!',
    };

    await emailjs.send(
      settings.emailServiceId,
      settings.emailTemplateId,
      templateParams,
      settings.emailPublicKey
    );

    return true;
  } catch (error) {
    console.error('Failed to send weekly reminder:', error);
    return false;
  }
};

