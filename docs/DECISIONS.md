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
