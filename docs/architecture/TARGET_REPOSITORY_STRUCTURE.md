# Target Repository Structure

The layout is a target; adapt incrementally to the existing app. Avoid moving working files before the baseline is green.

```
crabdeck/
├── apps/
│   ├── war-room/                 # React/Vite shell and pages
│   ├── gateway/                  # Express API, auth, WS
│   └── megabrain/                # FastAPI orchestrator
├── packages/
│   ├── contracts/                # Shared API/events/schemas
│   ├── config/                   # Validated config
│   ├── logger/                   # Redacted structured logging
│   ├── database/                 # SQLite migrations/repositories
│   ├── security/                 # Policy/auth/approval primitives
│   ├── telemetry/                # Typed metrics/events
│   ├── agent-runtime/             # Planner interfaces and agent profiles
│   ├── tool-runtime/              # Registry, adapters, isolation
│   ├── memory/                   # FTS/vector/retrieval interfaces
│   └── ui-kit/                   # Shared UI components
├── services/
│   ├── worker/                   # Bounded execution workers
│   ├── memory-indexer/           # Embedding and archive pipeline
│   └── chronos/                  # Health/budget/control loop
├── blueprints/
│   ├── system/                   # Built-in workflow blueprints
│   ├── agents/                   # Agent profile blueprints
│   └── tools/                    # Tool manifests
├── data/                          # Runtime-only; gitignored
├── vault/                         # Secrets and private data; gitignored
├── docs/
│   ├── architecture/
│   ├── contracts/
│   ├── blueprints/
│   ├── audits/
│   ├── security/
│   ├── operations/
│   └── adr/                       # Architecture Decision Records
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── contract/
│   ├── security/
│   └── e2e/
├── infra/
│   ├── docker/
│   ├── compose/
│   └── scripts/
├── .github/workflows/
├── AGENTS.md
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Migration strategy
1. Keep the current Vite/React app running.
2. Add shared contracts and API client first.
3. Extract backend modules behind tested boundaries.
4. Move files only when imports and tests are updated together.
5. Avoid an all-at-once rewrite; each migration should have a rollback.
