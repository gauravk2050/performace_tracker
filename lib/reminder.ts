// Client-side reminder system
// Checks if it's time to send a reminder and shows a notification

import { storage, Settings } from './storage';
import { sendWeeklyReminder, sendWeeklyReport } from './email';

const LAST_REMINDER_KEY = 'performance_tracker_last_reminder';
const LAST_REPORT_KEY = 'performance_tracker_last_report';

export const checkAndSendReminders = async () => {
  if (typeof window === 'undefined') return;

  const settings = storage.getSettings();
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const lastReminder = localStorage.getItem(LAST_REMINDER_KEY);
  const lastReport = localStorage.getItem(LAST_REPORT_KEY);

  // Send weekly reminder on Mondays (or first visit of the week)
  if (settings.weeklyReminderEnabled && settings.email) {
    const lastReminderDate = lastReminder ? new Date(lastReminder) : null;
    const daysSinceReminder = lastReminderDate
      ? Math.floor((now.getTime() - lastReminderDate.getTime()) / (1000 * 60 * 60 * 24))
      : 7;

    if (dayOfWeek === 1 || daysSinceReminder >= 7) {
      // Monday or 7+ days since last reminder
      try {
        await sendWeeklyReminder(settings);
        localStorage.setItem(LAST_REMINDER_KEY, now.toISOString());
        console.log('Weekly reminder sent');
      } catch (error) {
        console.error('Failed to send reminder:', error);
      }
    }
  }

  // Send weekly report on Sundays (or end of week)
  if (settings.weeklyReportEnabled && settings.email) {
    const lastReportDate = lastReport ? new Date(lastReport) : null;
    const daysSinceReport = lastReportDate
      ? Math.floor((now.getTime() - lastReportDate.getTime()) / (1000 * 60 * 60 * 24))
      : 7;

    if (dayOfWeek === 0 || daysSinceReport >= 7) {
      // Sunday or 7+ days since last report
      try {
        const activities = storage.getActivities();
        const tasks = storage.getTasks();
        await sendWeeklyReport(activities, tasks, settings);
        localStorage.setItem(LAST_REPORT_KEY, now.toISOString());
        console.log('Weekly report sent');
      } catch (error) {
        console.error('Failed to send report:', error);
      }
    }
  }
};

// Call this when the app loads
export const initReminders = () => {
  if (typeof window === 'undefined') return;
  
  // Check on load
  checkAndSendReminders();
  
  // Check daily
  setInterval(() => {
    checkAndSendReminders();
  }, 24 * 60 * 60 * 1000); // 24 hours
};

