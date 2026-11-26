# Crabdeck Quantum — Build Roadmap & Blueprint Index

This roadmap tracks target milestones, not claims of current completion.

## Milestone 0 — Truth and baseline
- [ ] Inventory existing app, APIs, Firebase, scripts, workflows, dependencies, and mock data.
- [ ] Mark mock/demo metrics; eliminate fabricated success fallbacks.
- [ ] Replace hardcoded smoke PASS strings with executable assertions.
- [ ] Establish branch, CI baseline, and migration strategy.

## M1 — Foundation contracts
- [ ] Workspace layout and dependency boundaries.
- [ ] Shared Zod/JSON schemas and versioned API/event contracts.
- [ ] Runtime config validation, structured logs, trace/request IDs.
- [ ] Error envelope and typed API client.
**Gate:** typecheck/lint/build pass; config-invalid startup exits safely; contract tests.

## M2 — Persistence
- [ ] SQLite WAL migrations and repositories.
- [ ] Tasks, runs, agents, blueprints, approvals, policies, audit, memory, outbox.
- [ ] Transactional state changes and idempotency.
- [ ] Backup/restore and migration rollback verification.
**Gate:** tests for concurrency, recovery, integrity, tenant isolation.

## M3 — Gateway
- [ ] Express gateway at configurable 3001.
- [ ] Health/live/ready/dependency status.
- [ ] Auth/session, CSRF where applicable, rate limit, CORS, secure headers.
- [ ] WebSocket authenticated event channel and bounded replay.
**Gate:** unauthorized calls blocked; offline dependencies truthfully represented.

## M4 — Secure
- [ ] Default-deny tool policy and role scopes.
- [ ] Human approvals for high-impact actions; one-use HMAC tokens.
- [ ] Append-only audit; redaction.
- [ ] Path jail, SSRF protections, SQL constraints, prompt injection defenses.
- [ ] Sandboxed execution with resource limits.
**Gate:** adversarial tests and zero bypasses.

## M5 — Megabrain/Hermes
- [ ] Task intake, context builder, plan schema, plan validator.
- [ ] Provider interface and offline/unavailable status.
- [ ] Planning/execution separation.
- [ ] Approval-aware state machine and cancellation.
**Gate:** planner outputs valid plans only; no direct tool calls.

## M6 — bHive workers
- [ ] Bounded scheduler, queue pressure, lease/heartbeat, cancellation.
- [ ] Worker profiles, budgets, priorities, retries, circuit breaker.
- [ ] Telemetry and backpressure.
**Gate:** crash/retry/duplicate tests; bounded resources under load.

## M7 — Shell Cracked memory
- [ ] SQLite FTS5 BM25.
- [ ] Vector provider interface and Chroma adapter.
- [ ] RRF k=60; measured retrieval eval.
- [ ] provenance/scope/retention and 48-hour compaction/archive pipeline.
**Gate:** quality metrics and privacy/tenant tests.

## M8 — War Room UI
- [ ] Live/offline/demo/degraded status.
- [ ] Agent/task controls, event timeline, alerts.
- [ ] Typed REST and WS client, reconnect/resync.
- [ ] Accessible navigation, bounded logs, lazy-loaded panels.
**Gate:** no fake live metrics; UI integration tests against API.

## M9 — Blueprint Studio & Labs
- [ ] Versioned blueprint schema and catalog.
- [ ] Validate, preview, dry-run, diff, approve, execute, rollback.
- [ ] Model evaluations, experiments, results with provenance.
**Gate:** blueprint reproducibility and approval enforcement.

## M10 — Tool/MCP layer
- [ ] Tool registry, schemas, policy adapter, isolated execution.
- [ ] MCP protocol adapter with identity boundary and header/body consistency.
- [ ] Per-tool timeout, rate, output, network, resource budgets.
**Gate:** unknown tool rejected; isolation tests.

## M11 — Chronos and adaptive runtime
- [ ] Hardware telemetry availability/quality labels.
- [ ] Resource budget and thermal hysteresis.
- [ ] Queue/circuit breakers and safe mode.
- [ ] Event alert priorities.
**Gate:** simulated and real sensor tests separated; safe degradation.

## M12 — Packaging & release
- [ ] Docker Compose profiles and local non-Docker mode.
- [ ] Installer with preflight, config wizard, health wait, logs, uninstall.
- [ ] Secrets and data volume boundaries.
- [ ] Backup/restore, upgrade/rollback.
- [ ] CI security, dependency and container scans.
- [ ] Release candidate, operator manual, threat model, incident playbook.
**Gate:** clean-machine install and 68 real assertions (or equivalent documented suite) pass.

## Sprint rule
Every 30-minute sprint produces one verifiable artifact: contract, migration, endpoint, UI slice, test, or docs. No “progress” commits that only rename tasks. Prioritize: (1) real health and telemetry, (2) truthful smoke tests, (3) persistence contract, (4) gateway, then vertical slices.

## Status vocabulary
- NOT STARTED — no implementation.
- IN PROGRESS — work exists, gate not met.
- BLOCKED — external dependency or issue is identified.
- VERIFIED — acceptance gate passed with linked test evidence.
