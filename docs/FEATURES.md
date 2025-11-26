# Features Documentation

This document provides detailed information about Health Tracker's features.

## 📊 Dashboard

### Overview
The main dashboard provides a comprehensive view of your daily health metrics at a glance.

### Features
- **Today's Summary**: Real-time overview of your health goals and progress
- **Quick Metrics**: Track steps, water intake, sleep, weight, calories, and mood
- **Trend Indicators**: Day-over-day changes with visual arrows
- **Weekly Charts**: Visualize 7-day trends for any metric
- **Streak Tracking**: Monitor your daily logging consistency with milestone badges
- **Insights Banner**: Personalized health insights with carousel navigation
- **Quick Log**: Fast input for common metrics with preset buttons

### Quick Actions
- Log metrics with one click using preset values
- Emoji-based mood selection
- Date selector for historical entries

---

## 🩸 Cycle Tracker

### Overview
Comprehensive menstrual cycle tracking with predictions and detailed logging.

### Features

#### Cycle Overview
- Current cycle day display
- Days until next period prediction
- Current phase indicator (Menstrual, Follicular, Ovulation, Luteal)
- Quick stats: Cycle length, period length, regularity score

#### Calendar View
- Interactive month view
- Color-coded days (period, ovulation, fertile window)
- Hover tooltips with detailed information
- Click to log or view day details

#### Daily Logging
- **Flow Intensity**: Light, Medium, Heavy, Spotting
- **Symptoms**: Multi-select from comprehensive list
  - Physical: Cramps, headache, bloating, fatigue, etc.
  - Emotional: Mood swings, anxiety, irritability, etc.
- **Notes**: Free-form text for additional details

#### Birth Control Tracking
- **Pill Pack Visualization**: 28-day grid with daily status
- **Adherence Statistics**: Taken, missed, on-time percentages
- **Daily Pill Logger**: Mark pills as taken with timestamps
- **Week View & Pack View**: Toggle between viewing modes

#### Quick Features
- **Symptom Presets**: One-click common combinations
  - PMS Combo, Period Day 1, Ovulation, Light Period
- **Mobile FAB**: Speed-dial for quick logging
- **Mood Logger**: Track emotional well-being

#### Predictions
- AI-powered period predictions
- Fertile window calculations
- Ovulation estimates
- Cycle irregularity detection

---

## 📝 Custom Metrics

### Overview
Create unlimited custom trackers for any health metric you want to monitor.

### Features
- **Custom Tracker Creation**: Define your own metrics
- **Flexible Units**: Numbers, text, yes/no, scale (1-10)
- **Goal Setting**: Set targets for each metric
- **Charts & Trends**: Visualize progress over time
- **Categories**: Organize metrics (fitness, nutrition, mental health, etc.)

### Use Cases
- Blood pressure tracking
- Supplement logs
- Gym workout tracking
- Meditation duration
- Custom symptoms
- Blood sugar levels
- And anything else!

---

## 📔 Health Journal

### Overview
Document your health journey with searchable notes and tags.

### Features
- **Rich Text Notes**: Write detailed entries
- **Tags**: Organize with custom tags
- **Search**: Find entries by keyword or tag
- **Date Filtering**: Browse by date range
- **Mood Association**: Link entries to daily mood
- **Photo Attachments**: (Coming soon)

### Use Cases
- Doctor visit notes
- Symptom journals
- Food diaries
- Exercise logs
- Mental health reflections

---

## ⏰ Reminders

### Overview
Never miss important health activities with customizable reminders.

### Features

#### Reminders Overview
- Today's completion stats
- Next reminder countdown
- Upcoming reminders
- Streak tracking

#### Quick Templates
One-click reminder creation:
- Hydration (every 2 hours)
- Morning Vitamins (9 AM daily)
- Gym Time (6 PM weekdays)
- Sleep Schedule (10 PM daily)
- Meal Prep (Sundays)
- Morning Routine (8 AM daily)
- Stretch Break (every 3 hours)

#### Custom Reminders
- **Flexible Scheduling**: Daily, weekly, monthly, custom intervals
- **Time Selection**: Set specific times or intervals
- **Emoji Icons**: Visual identification
- **Notifications**: (Coming soon - requires browser permissions)
- **Snooze Options**: 15m, 30m, 1h, 2h

#### Reminder Management
- Complete/incomplete tracking
- Snooze functionality
- Edit or delete reminders
- Time-based grouping (Now, Coming Soon, Later Today, Inactive)

---

## 👤 User Profile & Settings

### Overview
Manage your account and preferences.

### Features
- **Profile Information**: Name, email, date of birth
- **Health Goals**: Set and update targets
- **Cycle Settings**: Average cycle length, period length
- **Data Export**: Download your data (Coming soon)
- **Account Management**: Change password, delete account

---

## 🔐 Authentication

### Features
- **Email/Password**: Secure authentication via Supabase
- **Email Confirmation**: Verify email on signup
- **Password Reset**: Recover access via email
- **Session Management**: Automatic session handling
- **Secure**: Row Level Security (RLS) for data protection

---

## 📱 Mobile Experience

### Optimizations
- **Responsive Design**: Works beautifully on all screen sizes
- **Touch-Friendly**: Large tap targets, swipe gestures
- **Mobile FAB**: Quick access to common actions
- **Optimized Charts**: Touch-responsive visualizations
- **Fast Loading**: Optimized bundle size and lazy loading

---

## 🎨 UI/UX Highlights

### Design Features
- **Glassmorphism**: Modern frosted-glass effects
- **Gradient Accents**: Beautiful color transitions
- **Smooth Animations**: Framer Motion for fluid interactions
- **Accessibility**: WCAG compliant, keyboard navigation
- **Dark Theme**: Easy on the eyes (Coming soon)
- **Ambient Art**: Decorative background elements

### User Experience
- **Optimistic Updates**: Instant feedback on actions
- **Toast Notifications**: Success/error messages
- **Loading States**: Clear feedback during data fetching
- **Error Boundaries**: Graceful error handling
- **Validation**: Real-time form validation

---

## 🚀 Performance

### Optimizations
- **Code Splitting**: Load only what's needed
- **Lazy Loading**: Components load on demand
- **Memoization**: Prevent unnecessary re-renders
- **Debouncing**: Optimize frequent operations
- **Asset Compression**: Fast load times
- **CDN Distribution**: Served via Netlify's global CDN

---

## 🔜 Coming Soon

- Browser notifications for reminders
- Data export (CSV, JSON, PDF)
- Dark mode theme
- Wearable device integration
- AI-powered health insights
- Photo attachments in journal
- Social features and challenges
- Multi-language support
- Offline mode with sync

---

For technical documentation, see [ARCHITECTURE.md](ARCHITECTURE.md).

For contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

