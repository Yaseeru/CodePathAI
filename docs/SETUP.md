# CodePath AI - Setup Guide

This guide will help you set up the CodePath AI development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 or higher ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js
- **Git**: For version control ([Download](https://git-scm.com/))

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd codepath-ai
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Next.js 15+
- React 19
- TypeScript
- Tailwind CSS
- Supabase client
- Zod (validation)
- SWR (data fetching)

## Step 3: Environment Configuration

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and configure the following:

### Required Configuration

#### Supabase (Database & Auth)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**How to get Supabase credentials:**
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > API
4. Copy the Project URL and anon/public key

#### Claude AI (AI Mentor)
```env
CLAUDE_API_KEY=your_claude_api_key
```

**How to get Claude API key:**
1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Go to API Keys section
3. Create a new API key

### Optional Configuration

#### Piston API (Code Execution)
```env
PISTON_API_URL=https://emkc.org/api/v2/piston
```
The default public Piston API is pre-configured. For production, consider hosting your own instance.

#### Resend (Email Service)
```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

#### PostHog (Analytics)
```env
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

#### Sentry (Error Tracking)
```env
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

## Step 4: Database Setup

The database schema will be set up in Task 3 of the implementation plan. For now, ensure your Supabase project is created and credentials are configured.

## Step 5: Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Step 6: Verify Installation

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. You should see the CodePath AI landing page
3. Navigation should be responsive (try resizing the browser)
4. Check the browser console for any errors

## Project Structure

```
codepath-ai/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles & theme
├── components/            # React components
│   └── layout/           # Layout components
│       ├── Navigation.tsx # Main navigation
│       └── MainLayout.tsx # Page wrapper
├── lib/                   # Utilities & configurations
│   └── types/            # TypeScript type definitions
├── docs/                  # Documentation
│   ├── SETUP.md          # This file
│   └── THEME.md          # Design system guide
├── public/               # Static assets
├── .env.local.example    # Environment template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config (strict mode)
└── README.md             # Project overview
```

## Available Scripts

- `npm run dev` - Start development server (with Turbopack)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## TypeScript Configuration

TypeScript is configured with **strict mode** enabled for maximum type safety:
- Strict null checks
- No implicit any
- Strict function types
- All strict options enabled

## Tailwind CSS Configuration

The project uses Tailwind CSS v4 with a custom design system:
- Custom color palette (primary, secondary, accent)
- Responsive breakpoints (mobile, tablet, desktop)
- Custom spacing scale
- Typography system
- Dark mode support

See [THEME.md](./THEME.md) for complete design system documentation.

## Next Steps

After completing the setup:

1. **Task 2**: Set up Supabase authentication
2. **Task 3**: Implement database schema
3. **Task 4**: Configure external service integrations

Refer to `.kiro/specs/codepath-ai-mvp/tasks.md` for the complete implementation plan.

## Troubleshooting

### Port 3000 already in use
```bash
# Kill the process using port 3000
npx kill-port 3000
# Or use a different port
PORT=3001 npm run dev
```

### Module not found errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
# Rebuild TypeScript
npm run build
```

### Tailwind styles not applying
1. Ensure `globals.css` is imported in `app/layout.tsx`
2. Check that Tailwind directives are present in `globals.css`
3. Restart the development server

## Support

For issues or questions:
1. Check the [README.md](../README.md)
2. Review the [tasks.md](.kiro/specs/codepath-ai-mvp/tasks.md)
3. Open an issue in the repository

## Security Notes

- Never commit `.env.local` to version control
- Keep API keys secure and rotate them regularly
- Use environment variables for all sensitive data
- Enable Row Level Security (RLS) in Supabase before production
