# Interview Intelligence

A focused Phase 1 web application for business students to:

- Search companies and positions
- Read and submit structured interview reports
- Track job applications and hiring stages
- Prepare with text-based AI-generated interview questions

## Getting started

Requires Node.js 22+.

```bash
npm install
npm run dev        # start the dev server on http://localhost:3000
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # vitest
```

## Deployment

The repo is connected to Vercel:

- Pushing to `main` deploys to production.
- Every pull request gets its own preview deployment automatically (Vercel comments the preview URL on the PR).
- Environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, see `.env.example`) are configured per-environment (Production/Preview) in the Vercel project dashboard under Settings → Environment Variables — never committed to this repo.
- Vercel auto-detects the Next.js framework; build and output settings are left on their defaults.

## Error tracking

Sentry (`@sentry/nextjs`) is wired up but **inactive by default** — with no `NEXT_PUBLIC_SENTRY_DSN` set, the SDK no-ops and the app builds/runs normally. To enable it, see the instructions in `.env.example`. Once a DSN is set, visit `/sentry-example-page` to trigger a client + server test error and confirm both reach the Sentry project.

## Phase 1 scope

Phase 1 intentionally excludes live voice interviews, subscriptions, large-scale scraping, workplace reviews, and personalized news.

## Proposed stack

- Next.js + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase/PostgreSQL
- Vercel
- Vitest and Playwright

## AI collaboration workflow

GitHub is the source of truth. ChatGPT and Claude should never rely on their private chat history for project facts.

1. Select one GitHub issue.
2. Read `AGENTS.md`, `docs/PRODUCT_SPEC.md`, `docs/ARCHITECTURE.md`, and `docs/DECISIONS.md`.
3. Create a feature branch.
4. Implement only the issue's acceptance criteria.
5. Run linting, type checking, and tests.
6. Open a pull request using the repository template.
7. Have the second AI review the diff.
8. Resolve findings and merge only after the checks pass.
9. Record architecture-changing decisions in `docs/DECISIONS.md`.

## Branch naming

- `feat/issue-number-short-name`
- `fix/issue-number-short-name`
- `docs/issue-number-short-name`
- `chore/issue-number-short-name`

Example: `feat/12-interview-report-form`

## Suggested first issues

1. Initialize Next.js project and CI
2. Configure Supabase and environment validation
3. Implement authentication
4. Create company and position schema
5. Build company search
6. Create interview-report schema
7. Build interview-report submission form
8. Build application tracker schema
9. Build application Kanban board
10. Add admin moderation queue
