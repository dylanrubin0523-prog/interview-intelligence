# Instructions for All AI Coding Agents

This file governs every AI assistant working in this repository.

## Source of truth

Use repository files and the current GitHub issue as the source of truth. Do not assume that information remembered from a separate chat is current.

Read before editing:

1. `docs/PRODUCT_SPEC.md`
2. `docs/ARCHITECTURE.md`
3. `docs/DATABASE.md`
4. `docs/DECISIONS.md`
5. The active GitHub issue

## Required working method

- Work on one issue at a time.
- Do not modify unrelated files.
- Do not silently change the product scope.
- State assumptions in the pull request.
- Prefer small, reviewable commits.
- Never push directly to `main`. All changes land via a pull request with a passing `quality` CI check; paths under `docs/`, `supabase/migrations/`, and `.github/` additionally require the repo owner's review per `.github/CODEOWNERS`.
- Never commit secrets, API keys, `.env.local`, private user data, or production exports.
- Use migrations for database changes.
- Add or update tests for changed behavior.
- Run the required checks before declaring work complete.
- Stop and document blockers rather than inventing credentials or external services.

## Definition of done

A task is complete only when:

- Every acceptance criterion is met.
- Type checking passes.
- Linting passes.
- Relevant automated tests pass.
- Loading, empty, success, and error states are handled.
- Authorization and data ownership were considered.
- The pull request explains what changed and how to test it.
- Documentation is updated when behavior or architecture changes.

## Review standard

Review for:

- Incorrect behavior
- Security and privacy problems
- Missing authorization checks
- Database integrity problems
- Broken edge cases
- Accessibility
- Performance regressions
- Tests that do not meaningfully verify behavior
- Changes outside the issue's scope

Classify findings:

- BLOCKER: security, data loss, broken core behavior
- HIGH: likely user-facing defect or authorization issue
- MEDIUM: important edge case or maintainability problem
- LOW: polish or optional improvement

Do not approve a pull request with unresolved BLOCKER or HIGH findings.
