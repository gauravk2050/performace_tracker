# Performance Tracker

A comprehensive performance tracking application to monitor your daily activities, tasks, and progress metrics. Track your gym sessions, office tasks, personal tasks, learning activities, reading, and more!

## Features

- ✅ **Task Management**: Create tasks with custom categories and priorities (low, medium, high, critical)
- 📊 **Activity Logging**: Log daily activities with duration tracking
- 📈 **Performance Graphs**: Visualize your progress with daily, weekly, monthly, and quarterly analysis
- 🎨 **Custom Categories**: Create and manage your own activity categories with custom colors
- 📧 **Email Reports**: Weekly progress reports and reminders via EmailJS
- 💾 **Local Storage**: All data is stored locally in your browser
- 🌙 **Dark Mode**: Automatic dark mode support
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gauravk2050/performace_tracker.git
cd performace_tracker
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

The static files will be generated in the `out` directory, ready for deployment.

## Deployment to GitHub Pages

This project is configured to automatically deploy to GitHub Pages when you push to the `main` branch.

1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Source", select "GitHub Actions"
4. Push to the `main` branch to trigger deployment

The workflow will automatically build and deploy your site to GitHub Pages.

## Email Setup (Optional)

To enable email reports and reminders:

1. Sign up for a free account at [EmailJS](https://www.emailjs.com/)
2. Create an email service (Gmail, Outlook, etc.)
3. Create two email templates:
   - **Weekly Report Template**: For progress reports
   - **Weekly Reminder Template**: For task reminders
4. Copy your Service ID, Template IDs, and Public Key
5. Go to Settings in the app and enter your EmailJS credentials
6. Enable weekly reports and/or reminders
7. Test the email functionality

### Email Template Variables

**Weekly Report Template:**
- `to_email`: Recipient email
- `week_start`: Start date of the week
- `week_end`: End date of the week
- `total_hours`: Total hours logged
- `total_activities`: Number of activities
- `completed_tasks`: Number of completed tasks
- `pending_tasks`: Number of pending tasks
- `completion_rate`: Task completion percentage
- `category_breakdown`: Breakdown by category

**Weekly Reminder Template:**
- `to_email`: Recipient email
- `pending_tasks_count`: Number of pending tasks
- `pending_tasks`: List of pending tasks (first 5)
- `logged_today`: Whether activities were logged today
- `reminder_message`: Reminder message

## Usage

### Creating Tasks

1. Navigate to the "Tasks" tab
2. Click "+ Add Task"
3. Enter task name, select category, and set priority
4. Tasks can be marked as completed or deleted

### Logging Activities

1. Navigate to the "Activities" tab
2. Select a date
3. Click "+ Log Activity"
4. Choose a task, set duration, and add optional notes
5. View your daily activity summary

### Viewing Performance

1. Navigate to the "Dashboard" tab
2. Switch between daily, weekly, monthly, and quarterly views
3. View statistics, charts, and graphs
4. Analyze category breakdowns and trends

### Managing Categories

1. Navigate to the "Categories" tab
2. View default categories (Gym, Office Task, Personal Task, Learning, Reading Book)
3. Create custom categories with custom colors
4. Delete categories you no longer need

## Data Storage

All data is stored locally in your browser's localStorage. This means:
- ✅ No server required
- ✅ Your data stays private
- ⚠️ Data is browser-specific (won't sync across devices)
- ⚠️ Clearing browser data will delete your data

## Technologies Used

- **Next.js 16**: React framework with static export
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Charting library for data visualization
- **date-fns**: Date utility library
- **EmailJS**: Email service integration

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Built with ❤️ for tracking your performance and achieving your goals!
