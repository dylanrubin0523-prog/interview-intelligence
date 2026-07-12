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
