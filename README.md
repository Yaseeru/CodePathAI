# CodePath AI - Personal AI Coding Mentor

CodePath AI is a free, AI-powered coding education platform that acts as a personal AI mentor. The system learns user goals, builds dynamic coding roadmaps tailored to individual needs, and guides users through learning in focused 15-minute sessions.

## Features

- **Goal-First Learning**: Start by describing what you want to build, not by choosing a programming language
- **AI Personalization**: Every interaction is context-aware, incorporating user history, progress, and goals
- **Micro-Sessions**: 15-minute focused lessons designed for busy learners
- **Build-as-You-Learn**: Real projects aligned with user goals, not abstract exercises
- **Free Core Tier**: Accessible to everyone with premium features for advanced users

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19, Tailwind CSS
- **Backend**: Supabase (PostgreSQL with Row Level Security)
- **AI/LLM**: Claude API (claude-sonnet-4-20250514)
- **Code Editor**: Monaco Editor (VS Code's editor component)
- **Code Execution**: Piston API (sandboxed multi-language execution)
- **Email**: Resend (transactional emails, re-engagement)
- **Analytics**: PostHog (product analytics, feature flags)
- **Monitoring**: Sentry (error tracking)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- A Supabase account
- A Claude API key (Anthropic)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd codepath-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your configuration:
- Supabase URL and keys
- Claude API key
- Other service credentials

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles with custom theme
├── components/            # React components
│   └── layout/           # Layout components
│       ├── Navigation.tsx
│       └── MainLayout.tsx
├── lib/                   # Utilities and configurations
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
└── .env.local.example    # Environment variables template
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript with strict mode enabled
- ESLint for code quality
- Tailwind CSS for styling
- Custom design system with CSS variables

## Responsive Design

The platform is fully responsive and supports:
- Desktop screens (1920x1080 and above)
- Tablet screens (768x1024)
- Mobile screens (375x667 and above)

## Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- 4.5:1 color contrast ratio minimum
- Focus indicators on all interactive elements

## Contributing

This is an MVP project. Contributions are welcome! Please follow the existing code style and ensure all tests pass.

## License

[Add your license here]

## Support

For questions or issues, please [open an issue](link-to-issues) or contact support.
