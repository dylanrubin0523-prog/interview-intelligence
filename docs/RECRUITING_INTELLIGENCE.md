# Recruiting Intelligence (Future Vision)

**Status: long-term idea. Not scheduled. Nothing in this document is part of the current GitHub milestones.**

This document exists so that ideas beyond Phase 1 are written down and organized instead of scattered across chat history — per `docs/NORTH_STAR.md`, an idea here becomes real work only once it has its own product spec, ADR (if architectural), and GitHub issues.

## The foundation Phase 1 already builds

The current, committed Phase 1 scope (`docs/PRODUCT_SPEC.md`) already establishes the data this vision depends on: a normalized company/position directory, structured and moderated interview reports, a private application tracker, and provenance-labeled prep questions. Recruiting Intelligence is what becomes possible once that structured data exists at scale — it is not a replacement for Phase 1, it's what Phase 1 is a foundation for.

## Future vision pillars

- **Personalized dashboards.** Surface reports, deadlines, and prep material relevant to a student's actual target companies and positions, instead of requiring them to search for everything manually.
- **Recruiting news / signal aggregation.** Phase 1 explicitly excludes news aggregation (`docs/PRODUCT_SPEC.md`). A future version could aggregate recruiting-relevant signal (application windows opening, info sessions, hiring freezes) — but only from sources and in a form that doesn't compromise the trust principles in `docs/PRODUCT_PRINCIPLES.md`.
- **Application/company alerts.** Notify a user when a company they're tracking gets a new report, opens a new position, or approaches a deadline in their tracker.
- **Recruiting calendar.** Aggregate application deadlines and known recruiting events across a student's tracked companies into one calendar view.
- **Recommendations.** Suggest companies, positions, or reports based on a student's profile, application history, and career interests — see `docs/AI_STRATEGY.md` for how this would relate to AI capability growth.

## Guardrails that carry over unchanged

Whatever gets built from this list must still honor `docs/PRODUCT_PRINCIPLES.md` in full: no fabricated provenance, no erosion of the verified/unverified distinction, no weakening of private-data-stays-private, moderation still gates public visibility. Personalization and recommendations are additive; they don't get to bypass the trust model Phase 1 is built on.

## Explicitly not a commitment

No timeline, priority order, or resourcing exists for anything in this document. It is a holding place for ideas, reviewed and updated as the North Star vision evolves — not a backlog.
