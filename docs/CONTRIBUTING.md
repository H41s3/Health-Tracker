# Contributing to Health Tracker

Thank you for your interest in contributing to Health Tracker! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots (if applicable)
- Your environment (browser, OS)

### Suggesting Features

Feature requests are welcome! Please provide:
- Clear use case and benefits
- Detailed description
- Any relevant examples or mockups

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update tests if needed

4. **Test your changes**
   ```bash
   npm run dev      # Test locally
   npm run build    # Ensure build works
   ```

5. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature description"
   ```
   
   Commit message format:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting)
   - `refactor:` Code refactoring
   - `test:` Test updates
   - `chore:` Build/tooling changes

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Provide a clear description
   - Reference any related issues
   - Add screenshots for UI changes

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Setup Steps

1. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Health-Tracker.git
   cd Health-Tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your Supabase credentials to `.env`

4. Run development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── cycle/      # Cycle tracker components
│   ├── dashboard/  # Dashboard components
│   ├── Layout/     # Layout components
│   └── reminders/  # Reminder components
├── pages/          # Page components
├── stores/         # Zustand state stores
├── contexts/       # React contexts
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── types/          # TypeScript types
└── lib/            # External service configs
```

## Code Style

- **TypeScript**: Use TypeScript for all new files
- **Components**: Use functional components with hooks
- **Naming**: 
  - Components: PascalCase (`MyComponent.tsx`)
  - Files: camelCase for utilities, PascalCase for components
  - Variables: camelCase
- **Imports**: Order imports (React, external libs, internal modules)
- **Formatting**: Use Prettier (will auto-format on save)

## State Management

- Use Zustand stores for global state
- Keep component state local when possible
- Follow existing store patterns

## Styling

- Use Tailwind CSS utility classes
- Keep custom CSS minimal
- Follow mobile-first responsive design
- Maintain color scheme consistency

## Testing

Before submitting:
- ✅ Test on desktop browsers (Chrome, Firefox, Safari)
- ✅ Test on mobile devices (iOS Safari, Chrome)
- ✅ Verify responsive design at different screen sizes
- ✅ Check for console errors
- ✅ Ensure accessibility (keyboard navigation, screen readers)

## Database Changes

If adding new features requiring database changes:
1. Create a new migration file in `supabase/migrations/`
2. Use timestamp naming: `YYYYMMDDHHMMSS_description.sql`
3. Include Row Level Security (RLS) policies
4. Document the schema changes

## Pull Request Process

1. Update documentation if needed
2. Add yourself to contributors list (if first contribution)
3. Ensure CI checks pass
4. Wait for code review
5. Address feedback
6. Maintainer will merge when approved

## Questions?

Feel free to open an issue for questions or join discussions in the Issues tab.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making Health Tracker better! 🎉

