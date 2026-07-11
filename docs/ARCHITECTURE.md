# Architecture

## Application

A single Next.js TypeScript application deployed to Vercel.

## Data and authentication

Supabase provides PostgreSQL, authentication, storage, and row-level security.

## Main boundaries

- UI components: rendering and user interaction
- Server actions/API routes: validation and orchestration
- Domain services: application logic
- Repositories/data access: database queries
- AI provider adapter: model-independent generation interface

## Security principles

- Enforce ownership in PostgreSQL row-level security, not only in the UI.
- Validate all external input on the server.
- Use service-role credentials only in trusted server environments.
- Do not expose moderation or administrative actions to normal users.
- Avoid storing unnecessary sensitive information.
- Keep AI-generated content clearly labeled.

## AI abstraction

Application code should call an internal interface rather than a provider SDK directly:

```ts
interface InterviewQuestionGenerator {
  generate(input: QuestionGenerationInput): Promise<GeneratedQuestionSet>;
}
```

This allows the provider or model to change without rewriting product logic.

## Testing

- Unit tests for validation and domain logic
- Integration tests for database authorization
- End-to-end tests for authentication, report submission, and application tracking
