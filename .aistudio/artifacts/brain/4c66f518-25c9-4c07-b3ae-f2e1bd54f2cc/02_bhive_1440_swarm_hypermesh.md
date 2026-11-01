# Feature 02: bHive 1,440-Node Swarm Hypermesh Protocol

**Feature ID:** `FEAT-02`  
**Classification:** Decentralized P2P Multi-Agent Mesh  
**Security Gating:** Safe (Read/Gossip Broadcast)  
**Ports:** `4002` (API Control) / `4003` (P2P Mesh) / `6379` (Redis Pub/Sub)  
**Registry Path:** `~/.bee2bee/registry.json`  

---

## 1. System Overview

The **bHive 1,440-Node Swarm Hypermesh** orchestrates a decentralized swarm of autonomous agents mapped across the 1,440 minutes of a 24-hour day ($24 \times 60 = 1,440$). The protocol partitions the temporal space into 12 2-hour cognitive epochs, rotating agents between three specialized operational castes: **Architect**, **Weaver**, and **Breaker**.

```
+-----------------------------------------------------------------------------------+
|                        1,440-MINUTE TEMPORAL HYPERMESH                            |
|  [N_0000 ---------------------- N_0719 ---------------------- N_1439]             |
|       |                                  |                                  |     |
|   Epoch 01-04                        Epoch 05-08                        Epoch 09-12|
| (Deep Reasoning)                  (Active Synthesis)                (Hardening)   |
+-----------------------------------------------------------------------------------+
       |                                  |                                  |
   ARCHITECT                            WEAVER                            BREAKER
(Nous Hermes 8B)                   (Qwen 2.5 Coder)                   (DeepSeek R1)
Planning & Spec                    Code & Execution                   Fuzzing & Red-Team
```

---

## 2. Tri-Role Agent Specialization Matrix

| Role | Primary Cognitive Responsibility | Preferred Local Model Profile | Memory Access Tier |
|---|---|---|---|
| **Architect** | High-level decomposition, dependency topological sort, and task framing | Nous Hermes 3 8B (Q4_K_M) | Cold State (Neo4j / Markdown Specifications) |
| **Weaver** | Implementation synthesis, patch generation, tool invoking, and code authoring | Qwen 2.5 Coder 7B (Q4_K_M) | Hot State (SQLite WAL Working Logs) |
| **Breaker** | Dynamic edge-case generation, syntax audit, adversarial fuzzing, and AST checks | DeepSeek R1 8B (Q4_K_M) | Ephemeral Workspace Sandbox (`vault/hob_workspace/`) |

---

## 3. Protocol Wire Specification

### Node Announcement & Registry Schema (`~/.bee2bee/registry.json`):
```json
{
  "node_id": "bhive_node_0842",
  "minute_slot": 842,
  "epoch": 7,
  "role": "WEAVER",
  "p2p_endpoint": "127.0.0.1:4003",
  "heartbeat_interval_s": 30,
  "last_seen_epoch_ms": 1793448000000,
  "status_vector": {
    "load_factor": 0.38,
    "temperature_c": 41.5,
    "active_tasks": 2,
    "hmac_sig": "9f3a8b27c4d1e05a"
  }
}
```

### Redis Gossip Delta Broadcast Channels:
- `crabdeck:events:bhive:announce`: Node join / leave heartbeat packets.
- `crabdeck:events:bhive:gossip_delta`: Incremental state-vector diffs (broadcast every 500ms under load).
- `crabdeck:events:bhive:task_dispatch`: Intent delegation addressed to specific minute slots.

---

## 4. Adaptive Dynamic Polling Backoff

To prevent network and CPU saturation on constrained edge hardware (such as Android Termux or 16GB APU workstations):
1. **Active State:** When active tasks are queued, heartbeat and gossip polling runs at $500\text{ms}$ intervals ($2\text{ Hz}$).
2. **Idle State:** When idle queue count is 0 for $> 30\text{ seconds}$, exponential backoff scales down check frequency to $5,000\text{ms}$ ($0.2\text{ Hz}$).
3. **Emergency Halt:** When APU thermal reading exceeds 75°C (Flux-Smith ceiling), all non-critical gossip broadcasts are throttled by $80\%$.

---

## 5. Live Heartbeat Telemetry Panel (`BHiveSwarmView.tsx`)

The swarm view integrates a dedicated real-time telemetry panel sourced directly from `~/.bee2bee/heartbeat.json` and Redis channels:
1. **Active Peer Count:** Real-time count of healthy, connected peers (e.g. `1,418 / 1,440` nodes; $98.5\%$ availability) with role distribution breakdown across Architect, Weaver, and Breaker populations.
2. **Network Latency:** Continuous calculation of mean mesh RTT (e.g. $5.4\text{ms}$), tracking minimum, peak, and jitter against the $100.0\text{ms}$ alert ceiling.
3. **Gossip-Delta Sync Frequency:** Live synchronization frequency (e.g. $2.0\text{Hz}$ / $500\text{ms}$ cadence in Standard mode, $2.5\text{Hz}$ / $400\text{ms}$ in Fast mode, $0.5\text{Hz}$ in Eco backoff), with average payload throughput (~$6.4\text{ KB}$ per delta).
4. **Interactive Manual Ping:** Operator trigger to dispatch immediate P2P ping requests and update telemetry state vectors on demand.

---

## 6. Verification & Smoke Suite Assertions

- **Assertion 06:** `resolve_active_minute_node(epoch_minute)` deterministically maps $0 \le t \le 1439$ to valid `(NodeID, Role, Epoch)`.
- **Assertion 07:** Redis Pub/Sub receives gossip delta payloads within $\le 5\text{ms}$ across local loopback.
- **Assertion 08:** Disconnecting node triggers peer rediscovery from `~/.bee2bee/registry.json` within 2 heartbeat cycles.
