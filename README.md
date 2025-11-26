# Health Tracker 🏥

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://he3lthflow.netlify.app/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)

A comprehensive health tracking web application designed for everyone - gym enthusiasts, women, men, and older adults. Track your daily health metrics, menstrual cycles, custom metrics, and more with a beautiful, intuitive interface.

---

## 🎯 Live Preview

**Try it now:** [https://he3lthflow.netlify.app/](https://he3lthflow.netlify.app/)

<div align="center">
  <a href="https://he3lthflow.netlify.app/" target="_blank">
    <img src="https://he3lthflow.netlify.app/og-image.png" alt="Health Tracker Preview" width="100%">
  </a>
  <p><em>Click the image above to visit the live application</em></p>
</div>

> 📱 **Social Media Ready!** When you share your site URL, it displays a beautiful preview with your custom image on Facebook, Twitter, Discord, LinkedIn, and more!

---

## 📚 Table of Contents

- [Live Preview](#-live-preview)
- [Features](#features)
- [Screenshots](#-screenshots)
- [Tech Stack](#key-technologies)
- [Getting Started](#getting-started)
- [Deployment](#-deploy-to-netlify)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

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

---

## 📸 Screenshots

### Main Dashboard
<div align="center">
  <img src="https://he3lthflow.netlify.app/og-image.png" alt="Health Tracker Dashboard" width="800">
  <p><em>Track your daily health metrics with beautiful visualizations</em></p>
</div>

**Key Features Shown:**
- 📊 **Today's Summary**: Real-time goal progress with completion tracking
- 📈 **Metric Cards**: Steps, water, sleep, weight, calories, and mood with trend indicators
- 🎯 **Quick Log**: Fast input with preset buttons for common values
- 🔥 **Streak Widget**: Daily logging consistency with milestone badges
- 💡 **Insights Banner**: Personalized health recommendations
- 📉 **Weekly Charts**: 7-day trends for all your metrics

### Want to See More?
Visit the live app to explore:
- 🩸 **Cycle Tracker** with calendar and predictions
- 📝 **Custom Metrics** for personalized tracking
- 📔 **Health Journal** with tags and search
- ⏰ **Smart Reminders** with quick templates
- ⚙️ **Settings** and profile management

👉 **[Try the Live Demo](https://he3lthflow.netlify.app/)**

---

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

---

## Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Features Guide](docs/FEATURES.md)**: Detailed feature documentation
- **[Architecture](docs/ARCHITECTURE.md)**: Technical architecture and design decisions
- **[Contributing Guide](docs/CONTRIBUTING.md)**: How to contribute to the project
- **[Deployment Guide](DEPLOYMENT.md)**: Deploy to Netlify instructions

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with ❤️ using React, TypeScript, and Supabase
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Made with 💜 by the Health Tracker Team**
