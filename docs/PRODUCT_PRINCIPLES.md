# Product Principles

These are the product-level rules that hold regardless of which feature is being built. They're distilled from `docs/PRODUCT_SPEC.md` and the security principles in `docs/ARCHITECTURE.md`; when a new feature's design is ambiguous, these principles — not personal preference — should settle it.

## Current: Phase 1 principles

1. **Never fabricate provenance.** A question or claim is always labeled by where it actually came from: user-reported (someone said this was asked in a real interview), job-description-derived (inferred from a posting), or general practice (neither). The system must never present an inferred question as if it were previously and actually asked.
2. **Verified and unverified are always visually distinct.** Company/position records start unverified when user-proposed; search results must let a user tell the difference at a glance, not require them to dig.
3. **Private data stays private, enforced at the database, not the UI.** Application tracker records are owner-only. This is a database-layer (RLS) guarantee (ADR-003), not a client-side check that a determined user could bypass.
4. **Public visibility is earned through moderation, not automatic.** Interview reports enter a pending state and only become publicly visible after moderation. Authors can always see their own pending work; nobody else can.
5. **AI-generated content is always labeled as such.** A user should never have to guess whether text came from another student or from a model.
6. **Speed is a feature, measured concretely.** Adding or updating an application: under 2 minutes. Submitting a full interview report: under 7 minutes. These aren't aspirational — they're acceptance criteria (`docs/PRODUCT_SPEC.md`).
7. **Scope discipline protects trust.** Phase 1 explicitly excludes live voice interviews, native mobile apps, subscription billing, broad scraping, employer reviews, news aggregation, salary data, and employer accounts. Excluding these isn't an oversight — each one either isn't validated yet or would complicate the trust story this product depends on.
8. **User data and user-submitted content are never sold or shared without explicit, informed consent.** This holds regardless of business model. Aggregating, anonymizing, or monetizing anything a user contributed or any data about them requires their explicit opt-in — it is never a default, and it is never buried in broad terms-of-service language.

## Future vision

As the product grows toward the broader vision in `docs/NORTH_STAR.md`, new principles will be needed for personalization, recommendations, and any eventual monetization (see `docs/RECRUITING_INTELLIGENCE.md`, `docs/AI_STRATEGY.md`, `docs/MONETIZATION.md`). Whatever gets added there must not contradict the principles above — in particular, provenance honesty, privacy-by-default, and the verified/unverified distinction are treated as durable, not up for renegotiation as the product expands.

## Long-term

No long-term product principles are finalized beyond the above. This section stays empty until a future vision item is actually scoped for implementation.
