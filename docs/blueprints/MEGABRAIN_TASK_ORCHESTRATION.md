# Blueprint: Megabrain Task Orchestration

## Mission
Turn operator requests into validated, auditable task plans and dispatch work only through policy-controlled execution.

## Task record
Required fields:
- id (UUID/ULID), tenant_id, actor_id, created_at, updated_at
- request_text (redacted/sensitive classification)
- status, priority, deadline, attempt_count
- plan_json + plan_version + plan_hash
- blueprint_id + revision
- policy_decision + approval_id
- trace_id, idempotency_key
- cancellation_requested, result_ref, error_code
- budget (wall time, model tokens, tool calls, output bytes)

## State transitions
```
QUEUED -> VALIDATING -> PLANNING
                       ├─> REJECTED
                       ├─> AWAITING_APPROVAL -> APPROVED / REJECTED
                       └─> DISPATCHED -> RUNNING
                                           ├─> SUCCEEDED
                                           ├─> FAILED
                                           ├─> CANCELLED
                                           └─> TIMED_OUT
```
Terminal states cannot be reopened. Retry creates a new attempt and records lineage.

## Planner contract
Planner output must validate against a typed plan schema. Plan contains ordered steps, dependencies, tool names, arguments, expected outputs, risk classification, budgets, and rollback hints. Planner does not receive direct execution authority.

## Dispatch rules
- Revalidate policy immediately before dispatch.
- Reject unknown tools.
- Human approval required for destructive/high-impact actions.
- Worker gets only scoped task context and short-lived permissions.
- Every tool result is untrusted input.
- Use per-step timeouts, cancellation, output caps and idempotency.

## API
POST /api/tasks creates an idempotent task.
GET /api/tasks lists scoped tasks.
GET /api/tasks/:id returns detail and history.
POST /api/tasks/:id/cancel requests cooperative cancellation.
POST /api/tasks/:id/approve requires authenticated approval grant.
GET /api/tasks/:id/events streams/replays events (or WS).

## Event envelope
```json
{
  "schemaVersion": "1",
  "eventId": "evt_...",
  "sequence": 12,
  "taskId": "task_...",
  "traceId": "trace_...",
  "timestamp": "ISO-8601",
  "type": "TASK_TRANSITION",
  "data": { "from": "PLANNING", "to": "AWAITING_APPROVAL" }
}
```

## Acceptance gate
- FSM rejects illegal transitions.
- Duplicate idempotency key returns original task.
- Cancellation is acknowledged and reaches terminal state.
- Worker crash lease expires and recovery does not duplicate non-idempotent action.
- Approval replay/expired/wrong-action approval fails.
- No planner output can invoke tools directly.
- Task budgets enforced under retries.
