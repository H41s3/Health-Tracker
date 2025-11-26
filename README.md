# Health Tracking Dashboard

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-SITE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE-NAME/deploys)

A comprehensive health tracking web application designed for everyone - gym enthusiasts, women, men, and older adults. Track your daily health metrics, menstrual cycles, custom metrics, and more with a beautiful, intuitive interface.

## 🚀 Live Demo

**Production:** [Your Netlify Site URL]

> 📱 **Social Media Ready!** When you share your site URL, it displays a beautiful preview with your custom image on Facebook, Twitter, Discord, LinkedIn, and more!

## Features

### Core Features

- **Health Dashboard**: Track daily stats including activity, sleep, hydration, weight, mood, and calories with beautiful charts and trends
- **Period & Cycle Tracker**: Track menstrual cycles with flow intensity, symptoms, and AI-powered predictions for upcoming periods
- **Custom Metrics**: Create unlimited custom trackers for any health metric (blood pressure, supplements, gym logs, etc.)
- **Health Journal**: Document your health journey with searchable notes and tags
- **Smart Reminders**: Set up customizable reminders for hydration, medication, workouts, sleep, and more
- **User Profiles**: Manage personal information and preferences

### Technical Highlights

- **Modern Stack**: Built with React 18, TypeScript, Vite, and Tailwind CSS
- **Backend**: Supabase (PostgreSQL) with Row Level Security
- **State Management**: Zustand for efficient state handling
- **Data Visualization**: Recharts for beautiful, responsive charts
- **Authentication**: Secure email/password authentication via Supabase
- **Type-Safe**: Full TypeScript coverage for maintainability
- **Responsive Design**: Mobile-first, fully responsive UI

## Project Structure

```
src/
├── components/
│   └── Layout/
│       ├── DashboardLayout.tsx
│       └── Sidebar.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   └── supabase.ts
├── pages/
│   ├── Dashboard.tsx
│   ├── CycleTracker.tsx
│   ├── CustomMetrics.tsx
│   ├── HealthJournal.tsx
│   ├── Reminders.tsx
│   ├── Settings.tsx
│   └── Login.tsx
├── stores/
│   ├── useHealthStore.ts
│   ├── useCycleStore.ts
│   ├── useCustomMetricsStore.ts
│   ├── useNotesStore.ts
│   └── useRemindersStore.ts
├── types/
│   └── database.ts
└── App.tsx
```

## Database Schema

The application uses a comprehensive PostgreSQL schema with the following tables:

- **profiles**: User profile information
- **health_metrics**: Daily health tracking data
- **cycle_tracking**: Menstrual cycle data with predictions
- **custom_metrics**: User-defined metric definitions
- **custom_metric_logs**: Logs for custom metrics
- **health_notes**: Journal entries and notes
- **reminders**: User reminders and notifications

All tables have Row Level Security (RLS) enabled for data protection.

## Getting Started

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/H41s3/Health-Tracker.git
cd Health-Tracker
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Copy `.env.example` to `.env` and fill in your Supabase credentials:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Build for production:**
```bash
npm run build
```

### 🚀 Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/H41s3/Health-Tracker)

**Quick Deploy:**
1. Click the deploy button above
2. Connect your GitHub account
3. Add environment variables (Supabase URL & Key)
4. Deploy! 🎉

**Detailed instructions:** See [DEPLOYMENT.md](DEPLOYMENT.md)

**Automatic Deployments:**
Once connected to Netlify, every push to `main` branch automatically deploys your updates!

### 📱 Social Media Preview

Your site is configured with Open Graph and Twitter Card meta tags for beautiful link previews!

**To add your custom preview image:**
1. Create an image (1200x630px recommended)
2. Save it as `public/og-image.png`
3. Commit and push to GitHub
4. See the guide: `public/OG-IMAGE-GUIDE.md`

**Test your preview:**
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

## Key Technologies

- **React 18.3**: Modern React with hooks
- **TypeScript 5.5**: Type-safe development
- **Vite 5.4**: Fast build tool and dev server
- **Tailwind CSS 3.4**: Utility-first styling
- **Supabase**: Backend as a service
- **Zustand**: Lightweight state management
- **Recharts**: Data visualization
- **date-fns**: Date manipulation
- **Lucide React**: Beautiful icons

## Future Enhancements

- Wearable device integration (Fitbit, Apple Health, Google Fit)
- AI-powered health insights and correlations
- Export data to various formats (PDF, CSV)
- Social features and health challenges
- Mobile app (React Native)
- Multi-language support
- Dark mode
- Meal planning and nutrition tracking

## Design Philosophy

- **Clean & Modern**: Professional UI with attention to detail
- **Accessible**: WCAG compliant with proper contrast and keyboard navigation
- **Performant**: Optimized bundle size and lazy loading
- **Scalable**: Modular architecture for easy feature additions
- **Maintainable**: Well-documented, type-safe code

## License

Private project. All rights reserved.
