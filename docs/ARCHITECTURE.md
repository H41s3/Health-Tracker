# Technical Architecture

This document describes the technical architecture and design decisions for Health Tracker.

## Tech Stack

### Frontend
- **React 18.3**: UI library with concurrent features
- **TypeScript 5.5**: Type-safe JavaScript
- **Vite 5.4**: Fast build tool and dev server
- **Tailwind CSS 3.4**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Recharts**: Data visualization
- **date-fns**: Date manipulation
- **Lucide React**: Icon library

### Backend
- **Supabase**: Backend-as-a-Service (BaaS)
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Real-time subscriptions (future)

### State Management
- **Zustand**: Lightweight state management
- **React Context**: Authentication state

### Deployment
- **Netlify**: Continuous deployment, CDN, serverless functions
- **GitHub**: Version control and CI/CD trigger

---

## Project Structure

```
health_tracking_dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── cycle/           # Cycle tracker components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── reminders/       # Reminder components
│   │   ├── Layout/          # Layout components
│   │   ├── optimized/       # Performance-optimized components
│   │   ├── ErrorBoundary.tsx
│   │   └── Toast.tsx
│   │
│   ├── pages/               # Page-level components
│   │   ├── Dashboard.tsx
│   │   ├── CycleTracker.tsx
│   │   ├── CustomMetrics.tsx
│   │   ├── HealthJournal.tsx
│   │   ├── Reminders.tsx
│   │   ├── Settings.tsx
│   │   ├── Login.tsx
│   │   └── EmailConfirmation.tsx
│   │
│   ├── stores/              # Zustand state stores
│   │   ├── useHealthStore.ts
│   │   ├── useCycleStore.ts
│   │   ├── useBirthControlStore.ts
│   │   ├── useMedicationStore.ts
│   │   ├── useCustomMetricsStore.ts
│   │   ├── useRemindersStore.ts
│   │   ├── useDailyLogStore.ts
│   │   ├── useNotesStore.ts
│   │   └── useToastStore.ts
│   │
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   │
│   ├── hooks/               # Custom React hooks
│   │   └── usePillReminder.ts
│   │
│   ├── utils/               # Utility functions
│   │   ├── cyclePrediction.ts
│   │   ├── errorHandler.ts
│   │   ├── optimization.ts
│   │   ├── validation.ts
│   │   └── Profiler.tsx
│   │
│   ├── types/               # TypeScript type definitions
│   │   └── database.ts      # Database types
│   │
│   ├── data/                # Static data
│   │   └── symptoms.ts      # Symptom definitions
│   │
│   ├── lib/                 # External service configs
│   │   └── supabase.ts      # Supabase client
│   │
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
│
├── public/                  # Static assets
│   ├── og-image.png         # Social media preview
│   └── _redirects           # Netlify redirects for SPA
│
├── supabase/                # Database migrations
│   └── migrations/
│       ├── 20251022002610_create_health_tracking_schema.sql
│       └── 20251022002611_add_cycle_tracker_tables.sql
│
├── docs/                    # Documentation
│   ├── CONTRIBUTING.md
│   ├── FEATURES.md
│   └── ARCHITECTURE.md (this file)
│
├── .github/                 # GitHub templates
│
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
├── netlify.toml             # Netlify deployment config
└── README.md                # Project overview
```

---

## Architecture Patterns

### Component Architecture

#### Component Types
1. **Page Components** (`src/pages/`): Top-level route components
2. **Feature Components** (`src/components/`): Reusable feature-specific components
3. **Layout Components** (`src/components/Layout/`): Shared layout elements
4. **Optimized Components** (`src/components/optimized/`): Performance-critical components

#### Component Guidelines
- Functional components with hooks
- Single responsibility principle
- Props typed with TypeScript interfaces
- Memoization for expensive operations
- Error boundaries for fault tolerance

### State Management

#### Zustand Stores
Each feature has its own store for:
- Local state management
- Data fetching logic
- Optimistic updates
- Persistence (via localStorage)

**Store Pattern:**
```typescript
interface StoreState {
  data: Data[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  create: (item: Data) => Promise<void>;
  update: (id: string, item: Partial<Data>) => Promise<void>;
  delete: (id: string) => Promise<void>;
}
```

#### Context Usage
- **AuthContext**: Global authentication state
- Minimal use of context to avoid prop drilling
- Zustand preferred for most state

### Data Flow

```
User Interaction
    ↓
Component Event Handler
    ↓
Zustand Store Action
    ↓
Optimistic UI Update (immediate)
    ↓
Supabase API Call
    ↓
Success: Confirm Update | Error: Rollback
    ↓
Update Store State
    ↓
React Re-render
```

---

## Database Architecture

### Tables

#### `profiles`
- User profile information
- One-to-one with auth.users

#### `health_metrics`
- Daily health data (steps, water, sleep, etc.)
- User-specific with RLS

#### `cycle_tracking`
- Menstrual cycle logs
- Flow intensity, symptoms, notes

#### `cycle_predictions`
- AI-predicted cycle data
- Generated predictions

#### `birth_control_pills`
- Daily pill intake logs
- Timestamps and adherence tracking

#### `medications`
- Medication definitions
- Dosage and frequency

#### `custom_metrics`
- User-defined metric definitions
- Types: number, text, boolean, scale

#### `custom_metric_logs`
- Logs for custom metrics
- Linked to metric definitions

#### `health_notes`
- Journal entries
- Tags and searchable content

#### `reminders`
- User reminders
- Frequency and scheduling

### Row Level Security (RLS)

All tables have RLS policies:
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own data"
  ON table_name FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
  ON table_name FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON table_name FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data"
  ON table_name FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Performance Optimizations

### Code Splitting
- Route-based code splitting with React.lazy()
- Separate bundles for each page
- Reduced initial bundle size

### Memoization
- `useMemo` for expensive calculations
- `useCallback` for stable function references
- `React.memo` for pure components

### Lazy Loading
- Components loaded on demand
- Images with lazy loading attribute
- Chart libraries loaded when needed

### Debouncing
- Input fields debounced (300ms)
- API calls throttled
- Prevents excessive re-renders

### Asset Optimization
- SVG icons (Lucide)
- Compressed images
- CSS purging with Tailwind
- Gzip compression via Netlify

---

## Security

### Authentication
- Supabase Auth with JWT tokens
- Secure password hashing (bcrypt)
- Email confirmation required
- Session management

### Data Protection
- Row Level Security (RLS) on all tables
- HTTPS enforced via Netlify
- Environment variables for secrets
- No sensitive data in client code

### CORS & CSP
- CORS configured in Supabase
- Content Security Policy headers
- XSS protection headers

---

## API Integration

### Supabase Client
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### API Patterns
- Async/await for all operations
- Error handling with try/catch
- Toast notifications for user feedback
- Optimistic updates for better UX

---

## Deployment Pipeline

### CI/CD Flow
```
Local Development
    ↓
git commit
    ↓
git push to GitHub
    ↓
GitHub Webhook → Netlify
    ↓
Netlify Build:
  - npm install
  - npm run build
  - Deploy to CDN
    ↓
Production Site Live
```

### Build Process
1. Install dependencies
2. Type checking (TypeScript)
3. Build with Vite
4. Generate optimized bundles
5. Deploy to Netlify CDN

### Environment Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- Configured in Netlify dashboard

---

## Error Handling

### Strategies
1. **Error Boundaries**: Catch React errors
2. **Try/Catch**: Handle async errors
3. **Toast Notifications**: User-friendly error messages
4. **Fallback UI**: Graceful degradation
5. **Logging**: Console errors in development

### Error Types
- Network errors → Retry or offline message
- Validation errors → Form feedback
- Authentication errors → Redirect to login
- Database errors → Toast notification

---

## Testing Strategy (Future)

### Unit Tests
- Utility functions
- State management logic
- Custom hooks

### Integration Tests
- Component interactions
- API calls
- Store operations

### E2E Tests
- User flows
- Critical paths
- Cross-browser testing

---

## Future Enhancements

### Technical Debt
- Add comprehensive testing
- Implement real-time subscriptions
- Add service workers for offline support
- Implement push notifications

### Features
- Wearable device integrations
- AI-powered insights
- Data export functionality
- Dark mode theme

### Performance
- Server-side rendering (SSR)
- Progressive Web App (PWA)
- Advanced caching strategies
- Image optimization service

---

For feature documentation, see [FEATURES.md](FEATURES.md).

For contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

