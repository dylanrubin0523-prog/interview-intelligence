# Monetization (Future Vision)

**Status: long-term idea, purely speculative. No monetization work is scheduled or in progress.**

## Current: Phase 1

Phase 1 has no monetization. Subscription billing is explicitly out of scope (`docs/PRODUCT_SPEC.md`) — there is no payment collection, no paid tier, and no ad revenue anywhere in the current implementation.

## Why monetization is deliberately deferred

This product's core asset is trust: students need to believe the reports, difficulty ratings, and company verification they're reading are unbiased and not shaped by who paid for what. Introducing revenue mechanisms before that trust is established — or in a way that blurs the verified/unverified distinction in `docs/PRODUCT_PRINCIPLES.md` — would undermine the thing the product is for. Monetization is deferred by design, not by oversight.

## Directions to evaluate later (not committed)

- **Freemium features** — e.g., deeper analytics, expanded AI prep generation, personalized dashboard features from `docs/RECRUITING_INTELLIGENCE.md` — kept behind a free core so the trust-critical parts of the product (reports, tracker, verification) never require payment.
- **Institutional partnerships** — university career centers as a customer, rather than individual students.
- **Aggregate, anonymized market insights** — sold to employers or career services, only if genuinely anonymized and only with the explicit, informed consent required by `docs/PRODUCT_PRINCIPLES.md` — never at the cost of an individual contributor's privacy.
- **Verified/sponsored employer profiles** — must remain clearly and honestly labeled as such; sponsorship can never be allowed to affect a company's verification status or report visibility.

## Guardrails any future monetization must respect

Whatever direction is eventually chosen must be evaluated against `docs/PRODUCT_PRINCIPLES.md` before implementation: it cannot compromise privacy-by-default, cannot let payment influence the verified/unverified distinction, and — per `docs/PRODUCT_PRINCIPLES.md`'s explicit-consent principle — user data and user-submitted content can never be sold or shared without the affected user's explicit, informed, opt-in consent. None of these guardrails are up for renegotiation just because a monetization idea is otherwise appealing.

## Explicitly not a commitment

No direction above has been chosen, prioritized, or scheduled. Turning any of them into real work requires its own product spec and ADR, exactly like every other future-vision item in this repository's documentation.
