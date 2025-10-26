# Health Tracking Dashboard - Setup Guide

## 🚀 Quick Start

This health tracking dashboard is a comprehensive React application built with TypeScript, Tailwind CSS, and Supabase. It provides features for tracking health metrics, menstrual cycles, custom metrics, health journaling, and reminders.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase account (free tier available)

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase Backend

#### Option A: Using Supabase CLI (Recommended)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize Supabase in your project
supabase init

# Start local Supabase (for development)
supabase start

# Apply migrations
supabase db push
```

#### Option B: Using Supabase Dashboard
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key
3. Update the `.env` file with your credentials

### 3. Configure Environment Variables

Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Database Migrations

The project includes a comprehensive database schema in `supabase/migrations/20251022002610_create_health_tracking_schema.sql`. This creates:

- **profiles**: User profile information
- **health_metrics**: Daily health tracking data
- **cycle_tracking**: Menstrual cycle tracking
- **custom_metrics**: User-defined custom metrics
- **custom_metric_logs**: Logs for custom metrics
- **health_notes**: Journal entries and health notes
- **reminders**: User reminders and notifications

### 5. Start the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📱 Features

### ✅ Responsive Design
- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Hamburger menu with overlay sidebar
- **Touch-friendly**: Optimized for touch interactions

### 🏥 Health Tracking
- **Daily Metrics**: Steps, water intake, sleep, weight, mood
- **Visual Charts**: Weekly overview with Recharts
- **Quick Logging**: Fast data entry interface
- **Progress Tracking**: Goal-based progress indicators

### 🔄 Cycle Tracking
- **Period Tracking**: Start/end dates, flow intensity
- **Symptom Logging**: Customizable symptom tracking
- **Cycle Predictions**: Based on historical data
- **Privacy-First**: Secure, encrypted data storage

### 📊 Custom Metrics
- **Flexible Tracking**: Number, boolean, text, or scale metrics
- **Custom Icons**: Visual representation of metrics
- **Color Coding**: Easy identification of different metrics
- **Historical Data**: Track trends over time

### 📝 Health Journal
- **Daily Notes**: Rich text journaling
- **Tag System**: Organize entries by categories
- **Search & Filter**: Find specific entries quickly
- **Date-based Organization**: Chronological health history

### 🔔 Smart Reminders
- **Multiple Types**: Hydration, medication, workout, sleep, custom
- **Flexible Scheduling**: Daily, weekly, or custom frequencies
- **Smart Notifications**: Context-aware reminders
- **Easy Management**: Enable/disable reminders

## 🎨 Design System

### Color Palette
- **Primary**: Emerald (Health & Wellness)
- **Secondary**: Sky Blue (Water & Hydration)
- **Accent**: Violet (Sleep & Rest)
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Headings**: Bold, clear hierarchy
- **Body**: Readable, accessible font sizes
- **Interactive**: Clear button and link states

### Layout
- **Grid System**: Responsive grid layouts
- **Spacing**: Consistent padding and margins
- **Components**: Reusable, accessible components

## 🔒 Security & Privacy

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Secure authentication with Supabase Auth
- Encrypted data transmission

### Data Protection
- **No Data Sharing**: Your data stays private
- **Secure Storage**: Encrypted at rest
- **Access Control**: User-based permissions
- **GDPR Compliant**: Right to deletion and data portability

## 🗄️ Database Setup (IMPORTANT!)

### Apply Database Migration
1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: tgbpyvohlwkddkborzvp
3. **Go to SQL Editor** → **New query**
4. **Copy the entire content** from `supabase/migrations/20251022002610_create_health_tracking_schema.sql`
5. **Paste and click "Run"**
6. **Verify tables created** in Table Editor

### Quick Database Fix
If signup fails with "Database tables not created yet":
1. Apply the migration above
2. Check that all 7 tables exist: profiles, health_metrics, cycle_tracking, custom_metrics, custom_metric_logs, health_notes, reminders

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

### Manual Deployment
```bash
npm run build
# Upload the 'dist' folder to your hosting provider
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Dashboard metrics display
- [ ] Data entry and updates
- [ ] Responsive design on different screen sizes
- [ ] Navigation between pages
- [ ] Form validation
- [ ] Error handling

### Device Testing
- [ ] Desktop (1920x1080, 1366x768)
- [ ] Tablet (768x1024, 1024x768)
- [ ] Mobile (375x667, 414x896)
- [ ] Touch interactions
- [ ] Keyboard navigation

## 🐛 Troubleshooting

### Common Issues

#### 1. Supabase Connection Errors
```bash
# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

#### 2. Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. Database Migration Issues
```bash
# Reset database (development only)
supabase db reset
```

#### 4. Responsive Design Issues
- Check Tailwind CSS classes
- Verify viewport meta tag
- Test on actual devices

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Need Help?** Check the troubleshooting section or open an issue on GitHub.
