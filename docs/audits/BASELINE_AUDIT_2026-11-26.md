# Baseline Repository Audit — 2026-11-26

**Scope:** Read-only inspection of `main` files: `package.json`, `server.ts`, `scripts/smoke.sh`, `src/data/mockData.ts`, `vite.config.ts`. This is not a complete repository audit; additional files, Firebase rules, routes, and workflows remain to be inspected.

## Confirmed findings

### A0 — Smoke script does not perform the assertions it reports (CRITICAL)
In `scripts/smoke.sh`, `assert_test` receives status and detail as caller-supplied string arguments. The inspected calls pass literal `"PASS"` and fabricated details for assertion numbers 1–58. The final summary prints a hardcoded `100.0%` and certifies production readiness when the failure counter is zero. This suite is not valid verification evidence.

**Action:** replace it with actual executable tests; until then, mark the legacy suite invalid and do not use its output as release evidence.

### A1 — Health endpoint overstates state (HIGH)
`server.ts` `GET /api/health` returns static `status: "ok"` and `version: "1.0.0-PROD"`, without checking server dependencies or application readiness.

**Action:** implement liveness/readiness and dependency health with truthful degraded/offline statuses. Version comes from package metadata or build configuration; never hardcode a production label unsupported by release metadata.

### A2 — Heartbeat endpoint fabricates telemetry (HIGH)
`GET /api/heartbeat` returns fixed pulse, activeNodes, frequency, and thermal values without reading sensors or runtime state.

**Action:** telemetry schema must distinguish observed, simulated, unavailable, and stale values. Remove the endpoint's false live-state implication.

### A3 — Gemini fallback invents successful operations (CRITICAL)
`POST /api/gemini/chat` returns success-like text claiming synchronized nodes, verified loopback, smoke suite success, and active integrations when no API key is configured or generation fails. It also echoes user text into responses. The system prompt claims capabilities not shown as implemented. Model name `gemini-3.8-flash` requires provider/model availability verification.

**Action:** no provider configured => explicit `503 MODEL_UNAVAILABLE`; provider timeout/failure => structured error or truthful degraded response. Do not imply operations were executed. Validate request size/history and rate-limit before proxying.

### A4 — Default port mismatch (MEDIUM)
Server defaults to `3000`, while target spec calls for Gateway `3001`. Existing Vite development behavior is embedded in Express.

**Action:** make port and host explicit config; target defaults `127.0.0.1:3001` for single-operator local mode; retain deliberate opt-in LAN binding with warning and security setup. Document dev/prod distinction.

### A5 — Typecheck script naming is misleading (MEDIUM)
`npm run lint` runs `tsc --noEmit` (typecheck, not lint). No dedicated lint, test, or smoke command is declared in the inspected package file.

**Action:** add distinct `typecheck`, `lint`, `test`, `smoke`, `build` scripts; use actual tooling and lockfile reproducibility.

### A6 — Mock data contains live-looking impossible telemetry (HIGH)
`src/data/mockData.ts` seeds bots, model latency, temperatures, frequencies, efficiency, throughput, and statuses as constants. Some specs describe impossible hardware or throughput. UI must not display these as real runtime measurements.

**Action:** mark the data provider explicitly `demo`; attach provenance/status to telemetry; replace dashboard source with backend state; mock provider is opt-in and visibly labeled DEMO.

### A7 — Dependency and project naming cleanup (LOW)
Package is named `react-example`; Vite and React plugin are declared in both dependency and devDependency sections. `clean` uses Unix shell syntax, which is not Windows-friendly.

**Action:** normalize package name, dependency placement, cross-platform scripts, lockfile, and workspace structure after baseline tests.

## Immediate implementation sequence
1. M0: inspect remaining routes/components, Firebase configuration/rules, build workflows, package lock, and env usage; record full inventory.
2. M1: add config validation, typed error envelope, request IDs, honest health/telemetry.
3. Replace fabricated Gemini fallback with truthful unavailable/error responses and bounded input validation.
4. Add real automated tests for health and model unavailable paths; retire invalid 58 assertion script.
5. Preserve existing UI while adding demo/live/offline source labeling.

## Verification caveat
No local build/test execution was performed through this read-only GitHub inspection. Findings above are confirmed from the cited source snippets; the remainder of the repository has not yet been audited.
