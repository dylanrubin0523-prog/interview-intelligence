# Recruiting Intelligence (Future Vision)

**Status: long-term idea. Not scheduled. Nothing in this document is part of the current GitHub milestones.**

This document exists so that ideas beyond Phase 1 are written down and organized instead of scattered across chat history — per `docs/NORTH_STAR.md`, an idea here becomes real work only once it has its own product spec, ADR (if architectural), and GitHub issues.

## The foundation Phase 1 already builds

The current, committed Phase 1 scope (`docs/PRODUCT_SPEC.md`) already establishes the data this vision depends on: a normalized company/position directory, structured and moderated interview reports, a private application tracker, and provenance-labeled prep questions. Recruiting Intelligence is what becomes possible once that structured data exists at scale — it is not a replacement for Phase 1, it's what Phase 1 is a foundation for.

## Future vision pillars

### Personalized morning briefing

A homepage a user can check each morning summarizing: important deadlines and application updates, upcoming interviews and recommended preparation, new interview reports relevant to their target roles, personalized recruiting and industry news, and recommended companies and opportunities. A single entry point into everything else in this document, not a new data source of its own.

### Recruiting news and industry signals

Coverage of job/internship applications opening or closing, hiring expansions, freezes, layoffs, restructuring, compensation changes, recruiting-timeline changes, and relevant regulatory or industry developments. Every story must show its source, publication date, and a short "why this matters to you" explanation. Sourced facts and AI-generated interpretation must always be visibly distinguished from each other — never blended into one undifferentiated block of text.

### Alerts and recruiting calendar

A company follow system; alerts for application openings and deadlines; reminders for interviews, assessments, and events; one calendar combining tracked applications, recruiting events, deadlines, and preparation reminders. Notification categories and frequency are user-controlled, not on-by-default for everything.

### Daily or weekly digest

An optional digest of openings, deadlines, interview reminders, new reports, and relevant industry news. Users choose disabled, daily, or weekly — never a default a user has to discover how to turn off.

### Industry trends

Hiring direction, layoffs and restructuring, compensation changes, and recruiting timing, presented with explicit uncertainty where it exists. Statistics are never invented — a trend without a reliable source is presented as a qualitative signal, not a fabricated number.

### Community activity

Newly approved interview reports, new questions reported for followed companies and positions, and popular companies/roles relevant to the user. All existing moderation and privacy rules (`docs/PRODUCT_PRINCIPLES.md`) continue to apply unchanged — community activity is not a backdoor around moderation gating.

### Recommendations

Recommend companies, roles, reports, and preparation activities, with an explanation for why each one is shown. Recommendations never infer sensitive traits about a user, and are never presented as guarantees of employment.

### Recruiting readiness summary

May summarize transparent, user-controllable activity — profile completion, upcoming deadlines, saved opportunities, completed preparation, application progress. Must never be presented as an employability score, a hiring-probability prediction, or any other opaque judgment of the user.

## Low-cost architecture

Personalization at this scale only works if it's cheap to run. The intended shape: ingest and store each article, job-opening event, or source item once; summarize or classify it once whenever practical; reuse cached summaries across users; personalize primarily through filtering, ranking, and user preferences rather than a fresh AI request per user or per page load. Routine feed rendering must not trigger paid AI generation.

## Data sources and scraping guardrails

Prefer official company career pages, ATS feeds, RSS feeds, press releases, and permitted or licensed APIs. Respect `robots.txt`, terms of service, attribution requirements, rate limits, and deletion requests. This product is not designed around unauthorized scraping of Glassdoor, LinkedIn, Handshake, or other restricted platforms. Stories and job records are deduplicated before being shown to users.

## Privacy and controls

Users choose their followed companies, industries, locations, notification types, and digest frequency. Private application data must never become public or be exposed to another user — this is unchanged from Phase 1 (`docs/PRODUCT_PRINCIPLES.md`). Every personalization input and notification must be editable or disableable by the user it belongs to.

## Guardrails that carry over unchanged

Whatever gets built from this list must still honor `docs/PRODUCT_PRINCIPLES.md` in full: no fabricated provenance, no erosion of the verified/unverified distinction, no weakening of private-data-stays-private, moderation still gates public visibility. Personalization and recommendations are additive; they don't get to bypass the trust model Phase 1 is built on.

## Explicitly not a commitment

No timeline, priority order, or resourcing exists for anything in this document. It is a holding place for ideas, reviewed and updated as the North Star vision evolves — not a backlog.
