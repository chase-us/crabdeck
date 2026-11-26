# Crabdeck Quantum — Repository Operating Contract

## Mission
Build Crabdeck Quantum as a secure, modular, locally operable agent OS with an observable War Room, bounded orchestration, durable memory, controlled tools, and reproducible deployment. Implement in verified vertical slices; never claim a feature exists until code and tests prove it.

## Required workflow
1. Read the relevant subsystem blueprint and current code before modifying.
2. Make the smallest cohesive change on the working branch; do not work directly on main.
3. Define behavior, contracts, failure modes, and acceptance tests before implementation.
4. Run actual tests, lint/typecheck/build, and report exact results. Never hardcode PASS or fabricate telemetry.
5. Keep compatibility where useful; document breaking changes and migrations.
6. Update specs, changelog, and roadmap when behavior changes.
7. Keep secrets out of source, logs, telemetry, test fixtures, screenshots, and commits.
8. Fail closed for unknown tools, unauthorized writes, invalid signatures, malformed requests, and policy uncertainty.
9. Never execute untrusted generated code in the main process. Use isolated workers/containers with resource and network restrictions.
10. PRs should be small, reviewable, with tests and rollback instructions.

## Build modes
- **Standard:** maintainable, typed contracts, validation, least privilege, defensive errors, reproducible tests.
- **Rogue speedrun:** optimize time-to-value and reduce ceremony, but retain auth, audit, isolation, backup, and tests. No dangerous bypasses.

## Architecture principles
- UI is a visualization/control surface, not an authority.
- Gateway authenticates and validates requests; orchestrator authorizes task policy; execution worker enforces tool-level policy.
- Separate planning from execution. Plans are data, never direct executable instructions.
- Use bounded concurrency, explicit timeouts, cancellation, retries with backoff/jitter, idempotency keys, circuit breakers, and backpressure.
- Telemetry must represent observed state; mock/demo data must be labeled and cannot masquerade as live.
- Persistence is durable and transactional; in-memory caches are expendable.
- All cross-module communication uses versioned schemas.
- Resource budgets must fit the supported host profile; degrade gracefully rather than crash.

## Security checklist
- Authentication/session protections, CSRF strategy for cookie auth, rate limits, strict CORS, secure headers.
- RBAC/ABAC and tenant boundaries; permission checks at the server, not UI.
- HMAC approvals bind actor, action hash, nonce, expiry; nonce single-use; high-impact actions require explicit human approval.
- Path jail with canonical path checks and race-resistant operations; SQL parameterization and query restrictions.
- SSRF defenses include IPv4/IPv6 private, loopback, link-local, metadata addresses, DNS rebinding, and redirect revalidation.
- Secrets are injected at runtime; subprocess environment is allowlisted.
- Audit records are append-only, correlated, redacted, and tamper-evident where feasible.
- RAG and tool outputs are untrusted data; never let retrieved content override policy.
- AST checks are defense-in-depth, not a sandbox. Use OS/container isolation.

## Quality gates
- Typecheck and lint pass.
- Unit, integration, and security tests pass with real assertions.
- Build and startup smoke tests pass.
- Health reports dependency truth (including degraded/offline state).
- No unbounded queue, loop, agent fan-out, output, memory, or tool timeout.
- No secrets or fabricated PASS results.
- Every subsystem has a rollback or disable switch.

## Agent instructions
Before coding, state files to inspect, intended contract, and tests. Implement code, not placeholders. If a dependency is unavailable, provide an explicit degraded mode and test it. If uncertain, inspect repo and source; do not invent project state.
