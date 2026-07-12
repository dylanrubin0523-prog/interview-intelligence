# Architecture Decision Log

Add new decisions chronologically. Never rewrite an old decision to conceal a change.

## ADR-001: GitHub is the shared memory for AI assistants

**Status:** Accepted

ChatGPT and Claude do not share reliable private conversational state. Repository documentation, issues, commits, pull requests, and test results are therefore the authoritative project memory.

## ADR-002: Phase 1 is a responsive web application

**Status:** Accepted

The team will build a responsive Next.js application rather than separate native mobile applications.

## ADR-003: Database authorization uses row-level security

**Status:** Accepted

Private application records and unapproved reports must be protected at the database layer using Supabase row-level security.

## ADR-004: Authentication uses Google OAuth and email/password only

**Status:** Accepted

Phase 1 supports Google OAuth and email/password sign-in via Supabase Auth. Magic links are excluded from Phase 1 to keep the auth surface and its test matrix small. This can be revisited post-launch based on observed sign-up friction.

## ADR-005: Interview difficulty is a numeric 1–5 field

**Status:** Accepted

`interview_reports.difficulty` is stored as a numeric value from 1 to 5, not a free-text or open enum. The UI maps values to labels (1 = Very Easy, 2 = Easy, 3 = Moderate, 4 = Difficult, 5 = Very Difficult). Storing a number keeps aggregation (e.g., average difficulty per company) simple while the label mapping stays purely presentational and can change without a migration.

## ADR-006: OpenAI is the first AI provider behind the existing adapter interface

**Status:** Accepted

The first implementation of `InterviewQuestionGenerator` (`docs/ARCHITECTURE.md`) calls OpenAI. The adapter interface itself is unchanged by this choice — application code continues to depend only on `InterviewQuestionGenerator`, never on an OpenAI SDK type directly. The specific model is set via the `OPENAI_MODEL` environment variable rather than hardcoded, so the model can be upgraded without a code change. Switching providers later remains a matter of writing a new adapter implementation, not a rewrite of product code.

## ADR-007: Sentry is added in Milestone 0 for error tracking

**Status:** Accepted

Error tracking is a Milestone 0 (foundations) task rather than a later polish item. AGENTS.md's definition of done requires that error states be handled; without error tracking from the start, regressions in error handling would go unnoticed as features are built in Milestones 1–6.

## ADR-008: AI provider selection is deferred until implementation

**Status:** Accepted

The application continues to use a provider-independent `InterviewQuestionGenerator` interface. The concrete provider and model will be selected when Milestone 6 begins, based on cost, quality, latency, privacy, and implementation requirements. No application or domain code may depend directly on a vendor SDK type. AI-generated questions must retain explicit provenance labels and must never be represented as user-reported questions.

This ADR supersedes only the provider-selection portion of ADR-006. The adapter boundary and environment-based model configuration principles remain valid.

## ADR-009: External integrations have independent environment modules

**Status:** Accepted

Each external service owns an independently validated environment module. Importing one integration must never require another integration's variables to exist. Client-safe and server-only values remain separated, and secrets are never imported into browser code.

This applies to Supabase, Sentry, AI providers, email services, and future external integrations.

## ADR-010: Column-limited public reads use restricted views

**Status:** Accepted

PostgreSQL row-level security is row-level, not column-level. A public `SELECT` policy on a base table exposes the entire row, and combining a broad column `GRANT` (needed so an owner can read their own full row) with a permissive public `SELECT` policy would leak private columns to any authenticated user.

Where a table must expose some columns publicly while keeping others owner-only, the public columns are exposed through a dedicated restricted view (e.g., `public.public_profiles`) that physically selects only the public columns, created `with (security_invoker = off)` so it reads across all rows as its owner. The base table carries no public/anon `SELECT` policy. Private columns are then unreachable through the public surface by construction — the view does not contain them — rather than depending on policy correctness.

First applied to `profiles` (issue #8). Applies to any future table with a public/private column split (e.g., `companies`, `interview_reports`).
