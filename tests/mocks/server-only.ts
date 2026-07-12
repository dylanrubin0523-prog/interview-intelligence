// Vitest runs outside Next.js's bundler, which is what actually enforces
// the "server-only" package's client/server guard. Alias it to a no-op here
// so tests can still import server-only-guarded modules directly.
export {};
