# Project Constitution

This document is the permanent anchor for how this project is governed and built. `AGENTS.md` is the operational manual that implements these principles day to day; if the two ever conflict, this document wins and `AGENTS.md` should be corrected.

## Core principles

1. **GitHub is the single source of truth** (ADR-001). Chat history with any AI assistant is not authoritative. Issues, PRs, commits, and `docs/DECISIONS.md` are what future contributors — human or AI — must be able to reconstruct the project from.
2. **A human approves every merge.** Implementation approval is not merge approval. An AI assistant opening a PR, even a fully passing one, never merges it unilaterally. This is enforced explicitly in `AGENTS.md`.
3. **Two independent reviews before code lands.** One AI implements, a second AI (or the repo owner) reviews the diff, per the AI collaboration workflow in `README.md`. Findings are classified by severity (`AGENTS.md`'s review standard); BLOCKER/HIGH findings block merge.
4. **Small, scoped, reversible changes.** One GitHub issue at a time. No silent scope changes. Bugs directly caused by the current change get fixed in place; unrelated bugs get filed as new issues, not folded in.
5. **Security and privacy are non-negotiable, not a phase.** Authorization is enforced at the database layer (Postgres RLS), not just the UI (ADR-003). Secrets are never committed (`SECURITY.md`). Every environment-dependent integration fails loudly and clearly rather than silently misbehaving when misconfigured.
6. **Decisions are recorded, not remembered.** Any choice that changes architecture, scope, or a standing pattern is written to `docs/DECISIONS.md` as a new, chronological ADR. Old decisions are never edited to conceal a change — a reversal is a new entry.
7. **Documentation describes reality, not aspiration.** Current Phase 1 scope, future vision, and long-term speculative ideas are always kept in clearly separate sections or documents, never blended. See `NORTH_STAR.md` for how that separation is organized across this repo's documentation.

## Roles

- **Repo owner (human):** final authority on scope, merges, and architecture. Reviews or delegates review of every PR.
- **AI assistants:** implement issues, review each other's diffs, document assumptions and tradeoffs, and stop for explicit approval before merging. Neither Claude nor ChatGPT has standing authority to change scope or merge without the repo owner's approval.

## How this document changes

Like everything else here, changes to this constitution go through a pull request and, if the change is architectural, a new ADR in `docs/DECISIONS.md` explaining why.

## Related documents

| Document | Purpose |
|---|---|
| `AGENTS.md` | Operational instructions for AI assistants working in this repo |
| `SECURITY.md` | Vulnerability reporting and secret-handling policy |
| `docs/ARCHITECTURE.md` | Technical boundaries and security principles |
| `docs/DECISIONS.md` | Chronological log of architecture-affecting decisions |
| `docs/NORTH_STAR.md` | Long-term mission and how vision documents relate to the active roadmap |
