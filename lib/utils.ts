import { ActivityLog, Task } from '@/types';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, subDays, isSameDay, parseISO } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  return format(typeof date === 'string' ? parseISO(date) : date, 'yyyy-MM-dd');
};

export const formatDateTime = (date: string | Date): string => {
  return format(typeof date === 'string' ? parseISO(date) : date, 'MMM dd, yyyy HH:mm');
};

export const getToday = (): string => {
  return formatDate(new Date());
};

export const getWeekRange = (date: Date = new Date()) => {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
};

export const getMonthRange = (date: Date = new Date()) => {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
};

export const getQuarterRange = (date: Date = new Date()) => {
  return {
    start: startOfQuarter(date),
    end: endOfQuarter(date),
  };
};

export const getActivitiesByDateRange = (
  activities: ActivityLog[],
  startDate: Date,
  endDate: Date
): ActivityLog[] => {
  return activities.filter((activity) => {
    const activityDate = parseISO(activity.date);
    return activityDate >= startDate && activityDate <= endDate;
  });
};

export const getDailyStats = (activities: ActivityLog[], date: Date = new Date()) => {
  const dayActivities = activities.filter((activity) =>
    isSameDay(parseISO(activity.date), date)
  );

  const totalMinutes = dayActivities.reduce((sum, activity) => sum + activity.duration, 0);
  const categoryStats = dayActivities.reduce((acc, activity) => {
    acc[activity.category] = (acc[activity.category] || 0) + activity.duration;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalMinutes,
    totalHours: totalMinutes / 60,
    activityCount: dayActivities.length,
    categoryStats,
  };
};

export const getWeeklyStats = (activities: ActivityLog[], date: Date = new Date()) => {
  const { start, end } = getWeekRange(date);
  const weekActivities = getActivitiesByDateRange(activities, start, end);

  const dailyStats = [];
  for (let i = 0; i < 7; i++) {
    const day = subDays(end, 6 - i);
    dailyStats.push({
      date: formatDate(day),
      ...getDailyStats(activities, day),
    });
  }

  const totalMinutes = weekActivities.reduce((sum, activity) => sum + activity.duration, 0);
  const categoryStats = weekActivities.reduce((acc, activity) => {
    acc[activity.category] = (acc[activity.category] || 0) + activity.duration;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalMinutes,
    totalHours: totalMinutes / 60,
    activityCount: weekActivities.length,
    categoryStats,
    dailyStats,
  };
};

export const getMonthlyStats = (activities: ActivityLog[], date: Date = new Date()) => {
  const { start, end } = getMonthRange(date);
  const monthActivities = getActivitiesByDateRange(activities, start, end);

  const totalMinutes = monthActivities.reduce((sum, activity) => sum + activity.duration, 0);
  const categoryStats = monthActivities.reduce((acc, activity) => {
    acc[activity.category] = (acc[activity.category] || 0) + activity.duration;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalMinutes,
    totalHours: totalMinutes / 60,
    activityCount: monthActivities.length,
    categoryStats,
  };
};

export const getQuarterlyStats = (activities: ActivityLog[], date: Date = new Date()) => {
  const { start, end } = getQuarterRange(date);
  const quarterActivities = getActivitiesByDateRange(activities, start, end);

  const totalMinutes = quarterActivities.reduce((sum, activity) => sum + activity.duration, 0);
  const categoryStats = quarterActivities.reduce((acc, activity) => {
    acc[activity.category] = (acc[activity.category] || 0) + activity.duration;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalMinutes,
    totalHours: totalMinutes / 60,
    activityCount: quarterActivities.length,
    categoryStats,
  };
};

export const getTaskCompletionRate = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.completed).length;
  return Math.round((completed / tasks.length) * 100);
};

