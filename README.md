# PM Practice Lab

Interactive challenge platform where aspiring Product Managers practice real PM work and get structured AI feedback.

Live: https://pm-practice-lab-6i6v.vercel.app

## Features

**Challenges** -- Structured PM exercises (PRDs, prioritization, metrics) with scenario briefs, context materials, and multi-step submission forms. AI-powered review via Google Gemini scores each submission on multiple dimensions with growth-framed feedback.

**Interview Prep** -- Flashcards, multiple-choice quizzes, and a searchable question bank across 5 PM interview categories (Product Design, Analytical, Behavioral, Strategy, Technical). Progress tracked locally.

**Dashboard** -- Tracks challenge submissions, review scores, and interview prep progress in one place.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** Supabase (PostgreSQL + Auth + Realtime)
- **AI Review:** Google Gemini API (structured JSON output)
- **Styling:** Tailwind CSS with custom design tokens (see DESIGN.md)
- **Testing:** Vitest (293 tests) + React Testing Library

## Getting Started

```bash
npm install
cp .env.example .env.local  # Add your Supabase + Gemini keys
npm run dev
```

Open http://localhost:3000

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `GEMINI_API_KEY` | Google Gemini API key |

### Seed Challenges

With the dev server running:

```bash
curl -X POST http://localhost:3000/api/seed
```

## Project Structure

```
src/
  app/                  # Next.js App Router pages
    challenges/         # Challenge list, detail, submit, review
    dashboard/          # User progress dashboard
    interviews/         # Flashcards, quiz, question bank
    auth/               # Login, OAuth callback
    api/                # Route handlers (submit, review, seed)
  components/
    ui/                 # Reusable primitives (Button, Card, Input, Badge, Skeleton)
    nav/                # TopNav, MobileBottomNav
    theme/              # ThemeProvider, ThemeToggle
  features/
    submit/             # WizardForm, AutoSave, MaterialsPanel
    interviews/         # Flashcard/quiz hooks
  lib/
    supabase/           # Client, server, admin, cached queries
    gemini/             # AI review client, prompt builder, schema
    interviews/         # Question content, localStorage storage
  types/                # TypeScript interfaces
  content/
    challenges/         # Challenge JSON configs
    interviews/         # Interview question JSON
```

## Testing

```bash
npm test              # Run all 293 tests
npm run test:watch    # Watch mode
```

## Documentation

- [DESIGN.md](./DESIGN.md) -- Design system tokens, colors, typography, spacing
- [CLAUDE.md](./CLAUDE.md) -- AI agent instructions and project conventions
- [TODOS.md](./TODOS.md) -- Deferred work items
