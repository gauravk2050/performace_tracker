'use client';

import { useState, useEffect } from 'react';
import { storage, Settings } from '@/lib/storage';
import { sendWeeklyReport, sendWeeklyReminder } from '@/lib/email';

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({
    email: '',
    weeklyReminderEnabled: false,
    weeklyReportEnabled: false,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setSettings(storage.getSettings());
  }, []);

  const handleSave = () => {
    storage.saveSettings(settings);
    setMessage({ type: 'success', text: 'Settings saved successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleTestReport = async () => {
    if (!settings.email) {
      setMessage({ type: 'error', text: 'Please enter your email address first' });
      return;
    }

    try {
      const activities = storage.getActivities();
      const tasks = storage.getTasks();
      const success = await sendWeeklyReport(activities, tasks, settings);
      if (success) {
        setMessage({ type: 'success', text: 'Test report sent successfully!' });
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to send test report. Please check your EmailJS configuration.',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error sending test report. Please check your configuration.' });
    }
    setTimeout(() => setMessage(null), 5000);
  };

  const handleTestReminder = async () => {
    if (!settings.email) {
      setMessage({ type: 'error', text: 'Please enter your email address first' });
      return;
    }

    try {
      const success = await sendWeeklyReminder(settings);
      if (success) {
        setMessage({ type: 'success', text: 'Test reminder sent successfully!' });
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to send test reminder. Please check your EmailJS configuration.',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error sending test reminder. Please check your configuration.' });
    }
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Email Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                EmailJS Service ID
              </label>
              <input
                type="text"
                value={settings.emailServiceId || ''}
                onChange={(e) => setSettings({ ...settings, emailServiceId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="service_xxxxx"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Get this from your EmailJS dashboard
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                EmailJS Template ID
              </label>
              <input
                type="text"
                value={settings.emailTemplateId || ''}
                onChange={(e) => setSettings({ ...settings, emailTemplateId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="template_xxxxx"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Get this from your EmailJS dashboard
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                EmailJS Public Key
              </label>
              <input
                type="text"
                value={settings.emailPublicKey || ''}
                onChange={(e) => setSettings({ ...settings, emailPublicKey: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="xxxxx"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Get this from your EmailJS dashboard
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Email Preferences
          </h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.weeklyReportEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, weeklyReportEnabled: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                Enable weekly progress report emails
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.weeklyReminderEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, weeklyReminderEnabled: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                Enable weekly reminder emails
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Save Settings
          </button>
          <button
            onClick={handleTestReport}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Test Weekly Report
          </button>
          <button
            onClick={handleTestReminder}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Test Reminder
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            How to set up EmailJS:
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-400">
            <li>Sign up for a free account at emailjs.com</li>
            <li>Create an email service (Gmail, Outlook, etc.)</li>
            <li>Create email templates for weekly report and reminder</li>
            <li>Copy your Service ID, Template ID, and Public Key</li>
            <li>Paste them in the fields above</li>
            <li>Save settings and test the emails</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

