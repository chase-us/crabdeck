# Crabdeck Quantum Omni-Layer — Master Architecture & Build Specification

**Status:** Canonical target specification; implementation status must be tracked separately.  
**Repo:** `chase-us/crabdeck`  
**Working branch:** `quantum-rebuild-spec`

## 1. Product definition
Crabdeck Quantum is a local-first, security-conscious agent operations OS. It combines a visual War Room, task and workflow orchestration, bounded bHive worker pools, Megabrain planning, tool execution, durable memory, blueprint lifecycle, telemetry, approval gates, and installer/deployment. The dashboard must never imply that simulated agents or metrics are live.

## 2. System topology
```
React War Room / Blueprint Studio / Agent Lab
        │ REST + authenticated WebSocket
        ▼
Express Gateway (:3001) — sessions, auth, rate limits, API, WS, routing
        │ versioned internal API / service auth
        ▼
FastAPI Megabrain (:8000) — task state machine, plans, scheduler, policy
        ├── Hermes Planner — reasoning/plan generation; no direct tool execution
        ├── bHive — bounded worker pool; task leasing and coordination
        ├── OpenClaw Tool Runtime — allowlisted tools, isolated execution
        ├── Shell Cracked Memory — SQLite + lexical/vector retrieval
        ├── Crabdeck Secure — policy, approvals, secrets boundary
        └── Chronos — health, budgets, circuit breakers, adaptive throttling
        │
        ├── SQLite WAL — source of truth
        ├── Redis — bounded cache/queues/ephemeral coordination
        ├── Chroma — vector index (rebuildable)
        ├── DuckDB/Parquet — archive/analytics
        └── Ollama — local model provider (optional)
```
Services may initially run as a modular monolith for ease of local development; preserve service contracts so they can be split later. Do not introduce distributed deployment complexity before measured need.

## 3. Canonical modules
- **War Room:** live observed system status, agent roster, task timeline, logs, controls, alerts; supports offline/degraded state.
- **Blueprint Studio:** versioned workflow templates, schema validation, import/export, preview, diff, dry-run, approvals, execution, rollback.
- **Megabrain:** task intake, context assembly, plan generation, plan validation, state machine, orchestration.
- **Hermes:** model-agnostic planner interface; structured outputs, retries, budget, provider failover; planning cannot execute tools.
- **bHive:** bounded worker scheduling; leases; heartbeat; priority; cancellation; backpressure; per-worker budgets.
- **OpenClaw Runtime:** tool registry and adapters; policy enforcement; isolated execution; typed result envelopes.
- **Shell Cracked:** memory search, durable facts, episodic events, retrieval provenance, compaction, retention.
- **Secure:** identity, policy, approvals, credential vault, audit, security events.
- **Chronos:** health checks, metrics, host resource monitoring, queue pressure, circuit breakers, adaptive budgets.
- **Labs:** model/provider testing, prompt experiments, evaluations, sandboxed prototypes.
- **Installer/Deployment:** one-command dev bootstrap, production compose, health, backup/restore, update and rollback.

## 4. Runtime & host budget
Target profile: 4-core CPU/APU, 16GB RAM. Containers must have explicit CPU/memory ceilings and configurable overrides. Initial suggested limits: Gateway 512MB, API/orchestrator 2GB, Redis 192MB (maxmemory 128MB), workers individually bounded. Use OMP_NUM_THREADS=2 for local inference by default. Do not assume hardware acceleration.

PAD-TCG adaptive load control:
- Trigger degraded mode if CPU/thermal telemetry reports temperature >75°C, system RAM >11GB, or inference latency >1200ms sustained within the sampling window.
- Reduce worker concurrency and pulse interval from 15s to 60s; lower model context from 8192 to 2048 if supported; stop nonessential jobs.
- Recovery uses hysteresis: temperature <68°C and RAM <9GB with stable latency for a configured recovery period.
- Sensors unavailable => mark unknown, never fabricate values; adaptive thermal control disabled but memory/latency controls remain where observable.

## 5. API contract (v1)
All API responses have trace ID and schema version. Standard envelope:
```json
{"ok":true,"data":{},"error":null,"meta":{"requestId":"...","version":"v1"}}
```
Errors:
```json
{"ok":false,"data":null,"error":{"code":"...","message":"safe message","details":null},"meta":{"requestId":"...","version":"v1"}}
```
Required endpoint groups:
- `GET /api/health`, `GET /api/health/ready`, `GET /api/health/live`
- `GET /api/system/telemetry`, `GET /api/system/dependencies`
- `GET/POST /api/tasks`, `GET /api/tasks/:id`, `POST /api/tasks/:id/cancel`, `POST /api/tasks/:id/approve`
- `GET/POST /api/agents`, `GET /api/agents/:id`, `POST /api/agents/:id/pause`, `POST /api/agents/:id/resume`
- `GET/POST /api/blueprints`, `GET /api/blueprints/:id`, `POST /api/blueprints/:id/validate`, `POST /api/blueprints/:id/dry-run`, `POST /api/blueprints/:id/execute`
- `GET/POST /api/memory/search`, `POST /api/memory/records`, `GET /api/memory/health`
- `GET /api/audit`, `GET /api/policies`, `POST /api/approvals`
- `GET /api/models`, `POST /api/labs/evaluations`
- WebSocket `/ws/swarm_events`: authenticated, versioned event stream with sequence numbers, replay cursor, bounded buffers, heartbeat, reconnect/backoff, and ALERT delivery priority.

Endpoint details and final schemas are to be versioned under `docs/contracts`; no endpoint may be marked implemented before tests cover success, validation, auth, and failure/degraded behavior.

## 6. Task state machine
`QUEUED → VALIDATING → PLANNING → AWAITING_APPROVAL (if required) → DISPATCHED → RUNNING → SUCCEEDED | FAILED | CANCELLED | TIMED_OUT`. Retry is a transition with attempt counter, reason, delay, and idempotency safeguards. Terminal states cannot be re-entered. State changes are transactional and emit outbox events. Tasks include ID, tenant/actor, blueprint revision, policy snapshot, trace ID, deadlines, budget, cancellation token, result pointer, and audit references.

## 7. Worker scheduling & limits
- Configurable global, per-tenant, per-agent, and per-tool concurrency.
- Default bounded queue; reject/slow intake when full.
- Lease timeout + heartbeat; requeue only idempotent work or use idempotency key.
- Retry exponential backoff with jitter and maximum attempts; no infinite retry.
- Priority classes with starvation protection.
- Explicit CPU, RAM, wall-time, token, network, and output limits.
- Cancellation cooperative and enforced at tool boundaries.
- Worker crashes do not corrupt task state; lease expiry reconciles.
- Never promise 15,000 simultaneously active agents on the target device. Design for high-scale logical agents, but run a measured bounded pool locally; load-test before setting capacity claims.

## 8. Security & trust
- Default-deny tool registry; unknown tools fail closed.
- Identity and role are server-derived; ignore client-supplied privilege/tenant claims.
- Read-only actions require authenticated access and policy; writes require scoped permission + audit; destructive/high-impact actions require explicit approval.
- Approval token/HMAC binds actor, action digest, target, nonce (128-bit minimum), expiry, and one-time use.
- SQL: parameterized statements; sqlglot validation for optional query surface; prohibit DDL/DML outside explicitly authorized mutation paths.
- Path jail: canonicalize, enforce allowed roots, prevent symlink/race escapes, atomic writes.
- SSRF: block private/loopback/link-local/metadata IPv4/IPv6; resolve and validate every hop; revalidate redirects; defend against DNS rebinding.
- Prompt injection: retrieved docs, memory, web, tool outputs wrapped/treated as untrusted; policy instructions are separate and immutable.
- Python AST policy is only a filter; untrusted code runs in isolated container/worker with no secrets, limited FS, disabled network by default, non-root, seccomp/AppArmor where available, CPU/memory/time/output limits.
- Secrets stored encrypted or external vault; never expose in UI/logs. Subprocess environment allowlisted.
- Audit: append-only, actor, action, resource, policy decision, timestamp, request/trace ID, redacted payload, outcome.
- MCP gateway validates headers/body consistency, strips untrusted privilege metadata, applies per-tool policy, schema validates args and results.

## 9. Shell Cracked memory design
SQLite is canonical:
- WAL; synchronous=NORMAL; busy_timeout=5000; wal_autocheckpoint=1000; checkpoint policy tracks WAL size.
- Tables (minimum): tenants, users, tasks, task_runs, approvals, activity_log, tool_policies, blueprint_revisions, memory_records, agent_profiles, heartbeat_state, token_ledger, outbox, schema_migrations.
- FTS5 BM25 lexical retrieval; vector index via Chroma (nomic-embed-text or configured model); Reciprocal Rank Fusion k=60; score threshold/promote candidate ≥0.82 subject to evaluation, not universal truth.
- Redis is hot cache/ephemeral coordination with maxmemory 128MB, container ceiling 192MB and eviction policy; never sole copy of durable data.
- Archive older-than-48-hour eligible conversation/task events into DuckDB/Parquet; retention rules configurable, privacy-safe, idempotent. Arrow IPC for interchange. Vector index is rebuildable.
- Memory entries carry source, timestamp, scope, tenant, sensitivity, confidence, retention, provenance, and access policy.
- Compaction must preserve key facts, decisions, unresolved tasks, and source references; test retrieval before/after.

## 10. Frontend contract
React + TypeScript. Existing app may retain Vite and Firebase where useful; migrate incrementally.
- API client typed from schemas; auth state centralized; no credentials in localStorage.
- Live telemetry over WS; REST snapshot on initial load/reconnect.
- Distinguish LIVE / DEMO / OFFLINE / DEGRADED in UI; every mock dataset marked demo.
- Accessibility: keyboard navigation, semantic labels, focus states, reduced motion.
- UI layout: War Room command surface, agent/task panels, event timeline, blueprint explorer, labs, memory, policy/approvals, system health.
- Performance: route-level lazy loading, bounded log virtualization, avoid unbounded client stores; initial gzipped chunk target <400KB after measuring and documenting exceptions.
- Keep visual identity distinctive; do not replace with generic dashboard template.

## 11. Persistence & schema
Use migrations, backups, restore tests, and tenant isolation. SQLite first; choose Redis, Chroma, and archive layers only when implemented and operationally verified. No hidden automatic destructive migrations. Data export and delete APIs must honor policy and retention.

## 12. Observability
Structured logs (JSON), metrics, traces/correlation IDs. Minimum metrics: queue depth/age, task state counts, worker utilization, task latency, retries, failures, tool latency, model latency/token counts, approval wait, memory retrieval scores, cache hit/miss, resource budget usage, WS clients/drops, dependency health. Metrics must be measured or explicitly marked unavailable/demo. Alert stream prioritizes security, failure, and resource alerts.

## 13. Test and release gates
- Contract tests for every API and WS event.
- Unit/integration tests for state machine, scheduler, policy, approvals, memory, tool runtime.
- Security tests: auth bypass, tenant mismatch, replay approval, nonce reuse, SSRF, redirect/DNS rebinding, path traversal/symlinks, SQL injection, prompt injection, MCP header/body desync, tool schema abuse, resource exhaustion.
- 68-assertion smoke suite is a target only; each assertion must execute a real test and derive PASS/FAIL from result. No hardcoded result strings.
- CI: install reproducibly, lint, typecheck, test, build, dependency/security scan, container scan, migration test.
- Release gate: gateway health on 127.0.0.1:3001; API health on 127.0.0.1:8000; if Ollama is absent, inference dependency reports unavailable and task execution degrades honestly; WS stress test verifies bounded heap and ALERT delivery; test suite must report real totals.
- Rollback: versioned image/tag, DB backup, reversible migrations or restore plan, feature flags, and release notes.

## 14. Implementation sequence
1. **Spec & repository audit:** inventory, remove false status claims, establish branch, define contracts.
2. **Foundation:** workspace tooling, shared schemas, config/env validation, logger, request IDs, errors.
3. **Data:** SQLite migrations, repositories, transactions, outbox, backups.
4. **Gateway:** auth, API, health, REST/WebSocket, rate limiting.
5. **Security:** policy engine, approval/HMAC, audit, path/SSRF guards, tool registry.
6. **Orchestrator:** task FSM, planner interface, worker queue, bounded bHive.
7. **Memory:** lexical search, vector adapter, RRF, compaction/archive.
8. **Frontend:** live state client, War Room, task and agent controls, blueprint studio.
9. **Tools & MCP:** isolated adapters, permissions, typed contracts, telemetry.
10. **Chronos/Labs:** resource guard, evaluations, experiments.
11. **Packaging:** Docker Compose, installer, local mode, secrets, backup/restore.
12. **Hardening/release:** tests, load tests, security review, docs, RC, production.

## 15. Definition of done
A feature is done only when: code exists; schemas are documented; tests are real and pass; telemetry is observed; permissions are enforced; failure mode is defined; docs updated; feature can be disabled; deployment/rollback is documented. Track each module as NOT STARTED / IN PROGRESS / BLOCKED / VERIFIED. Never label the whole product production-ready based on a UI mock or build success alone.
