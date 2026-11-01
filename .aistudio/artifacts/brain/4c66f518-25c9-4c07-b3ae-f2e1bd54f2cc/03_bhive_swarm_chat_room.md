# Feature 03: bHive Swarm Chat Room & Inter-Agent Dispatch

**Feature ID:** `FEAT-03`  
**Classification:** Agent Communication Bus / Collaborative Workspace  
**Security Gating:** Safe (Read/Publish Thread Messages)  
**Channel Binding:** `#operator-ai`, `#swarm-general`, `#architect-planning`, `#breaker-fuzzing`  

---

## 1. System Overview

The **bHive Swarm Chat Room** provides an operator-observable real-time communication stream where autonomous agents negotiate tasks, debate architectural trade-offs, report smoke test outcomes, and escalate approvals to the human operator.

### Core Capabilities:
- **Real-Time Agent Stream:** Live transcript of inter-agent dialogue between Architect, Weaver, Breaker, and Operator personas.
- **Hermes v0.7.0 [ACK] Supervision Marker:** Strict enforcement of a 3-message `[ACK]` termination rule on autonomous discussion threads to mathematically prevent infinite recursive ping-pong loops between reasoning models.
- **Temporal Timeline Playback:** Scrub through the 24-hour log history of agent decisions, tool execution results, and consensus milestones.
- **Direct Operator Injection:** Ability for the operator to inject commands, constraints, or approvals directly into the active multi-agent dialogue thread.

---

## 2. Conversation State & Protocol Wire Contracts

### Message Schema (`SwarmChatMessage`):
```typescript
export interface SwarmChatMessage {
  id: string;
  timestamp: string;               // ISO-8601 or HH:MM:SS format
  minuteSlot: number;              // 0 - 1439 temporal anchor
  senderRole: 'ARCHITECT' | 'WEAVER' | 'BREAKER' | 'OPERATOR' | 'SYSTEM';
  senderName: string;
  modelIdentifier: string;        // e.g., "nous-hermes-3-8b", "qwen2.5-coder-7b"
  channel: string;                 // Target channel
  content: string;
  isAckTerminator: boolean;        // True if message carries [ACK] terminal marker
  metadata?: {
    toolInvocations?: string[];
    tokenCostEstimate?: number;
    hmacSignature?: string;
  };
}
```

---

## 3. Anti-Loop Supervisor Engine ([ACK] Terminal Protocol)

When autonomous agents engage in peer-to-peer delegation, unconstrained conversation loops can rapidly saturate local inference queues. Crabdeck enforces the Hermes v0.7.0 3-step conversational ceiling:

```
[Agent A (Architect)] : Proposes Task Decomposition (Turn 1)
         |
         v
[Agent B (Weaver)]    : Acknowledges & Details Code Plan (Turn 2)
         |
         v
[Agent A (Architect)] : Validates Plan with Terminal "[ACK]" Marker (Turn 3)
         |
         v
   [THREAD FROZEN]    : ReAct Execution Loop Triggered; No further chat tokens generated.
```

If any agent attempts a 4th turn without an explicit manual operator prompt or new external event, the Swarm Sentinel automatically drops the packet and emits a `CYCLE_PREVENTED` log event.

---

## 4. UI Features & Interactivity

1. **Role Filtering:** Instant toggle to view all messages or isolate messages from specific castes (Architect, Weaver, Breaker, or System).
2. **Channel Hot-Switching:** Switch between high-level architectural deliberations (`#architect-planning`), raw code patches (`#weaver-synthesis`), and vulnerability warnings (`#breaker-fuzzing`).
3. **Interactive Manual Dispatch:** Form field allowing the human operator to broadcast an immediate prompt to the swarm, resetting the conversation cycle budget.

---

## 5. Verification & Smoke Suite Assertions

- **Assertion 13:** Multi-agent conversation threads terminate cleanly upon receiving `[ACK]` marker at or before Turn 3.
- **Assertion 14:** Injected operator prompts are routed to the designated minute-slot agent within $\le 10\text{ms}$.
- **Assertion 15:** Chat memory is flushed to `data/hot_memory/swarm_chat.jsonl` with valid SHA-256 rolling digest.
