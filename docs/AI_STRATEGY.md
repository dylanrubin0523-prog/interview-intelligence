# AI Strategy

## Current: Phase 1

Phase 1's only AI feature is text-based interview prep question generation (`docs/PRODUCT_SPEC.md`). It's built behind a provider-independent interface, not a direct SDK call:

```ts
interface InterviewQuestionGenerator {
  generate(input: QuestionGenerationInput): Promise<GeneratedQuestionSet>;
}
```

(`docs/ARCHITECTURE.md`.) The concrete provider is **not yet chosen**. ADR-006 originally selected OpenAI, but ADR-008 supersedes that provider choice specifically: the decision is deferred until Milestone 6 begins, made then based on cost, quality, latency, privacy, and implementation requirements. What ADR-006 got right and what ADR-008 keeps: the model is set via an environment variable rather than hardcoded, so upgrading it later is a config change, not a code change — that principle survives regardless of which provider is eventually picked.

## Standing principles (govern all AI work, current and future)

1. **Provider-swappable, always.** Product code depends only on the internal interface, never on a vendor SDK type directly. Switching or adding a provider means writing a new adapter, not rewriting product logic.
2. **Each provider's configuration is independently validated and isolated** (ADR-009). Importing one integration's config must never require another integration's variables to exist. This applies directly to AI providers — OpenAI, Anthropic, GitHub Models, or whichever provider is eventually chosen — each get their own validated environment module, never a shared one.
3. **Provenance honesty is non-negotiable.** Per `docs/PRODUCT_PRINCIPLES.md`, AI-generated content is always labeled as such, and the system never claims an inferred question was actually asked in a real interview. Any new AI feature inherits this constraint by default, not as an afterthought.
4. **A human stays in the loop for consequential actions.** AI can assist and suggest; it does not get standing authority to take moderation or trust-affecting actions unsupervised (consistent with `docs/PROJECT_CONSTITUTION.md`'s human-approval principle for the codebase itself).
5. **AI output explains itself, and expensive calls are cached, not repeated.** Per `docs/PROJECT_CONSTITUTION.md`'s cost-awareness and explainability principles: no AI-driven recommendation ships without a stated reason, and no feature is designed around a fresh paid AI call on every routine page load.

## Future vision

- **Multiple providers as genuine alternates**, not just a single hardcoded choice — for cost, quality, or redundancy tuning, using the same adapter interface Phase 1 already established.
- **AI-assisted moderation triage**: flagging likely-low-quality or likely-spam reports for faster human review, without ever auto-publishing or auto-rejecting without a human decision.
- **Recommendations and personalization** (see `docs/RECRUITING_INTELLIGENCE.md`) built on the same provider-independent pattern.

## Explicitly not scheduled

Milestone 6 (provider-independent text prep questions, provider chosen at implementation time per ADR-008) is the only AI work currently committed in the GitHub milestones. Everything in "Future vision" above requires its own product spec and, where it changes architecture, its own ADR before it becomes active work.
