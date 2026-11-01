# Feature 07: Biological Heartbeat & 4-Phase Chronos-Sync Telemetry

**Feature ID:** `FEAT-07`  
**Classification:** Temporal Governance, Synchronization & Hardware Health  
**Security Gating:** Safe (Read-Only Telemetry Streaming)  
**Primary Engine:** `megabrain_pump.py` / `Chronos-Sync Kernel Daemon`  
**Thermal Governor:** 75°C Flux-Smith APU Ceiling  
**Default Pulse Interval:** 15.0 seconds (Nominal 72 BPM Cardiac Baseline)  

---

## 1. System Overview

The **Biological Heartbeat** emulates a living, 4-phase organic circulatory system to coordinate distributed agent swarms, prevent state drift, and govern hardware thermals on resource-constrained host machines. By grouping asynchronous operations into distinct systolic and diastolic phases, Crabdeck eliminates unpredictable queue contention.

```
                           THE 4-PHASE CARDIAC CYCLE
                                (megabrain_pump.py)

                   [ PHASE 1: SYSTOLE ]
                   Task Intake & Intent Parsing
                                |
                                v
                   [ PHASE 2: FLOW ]
                   Tool Dispatch & P2P Swarm Gossip
                                |
                                v
                   [ PHASE 3: DIASTOLE ]
                   SQLite WAL Commits & Memory Compaction
                                |
                                v
                   [ PHASE 4: RETURN ]
                   Node Health Verification & Zero-Drift Reset
                                |
                                +---> Loops every 15 seconds (72 BPM)
```

---

## 2. Cardiac Phase Specifications

| Phase | Duration Ratio | Primary Subsystems Engaged | Behavioral Invariant |
|---|---|---|---|
| **Phase 1: Systole** | 20% | FastAPI Gatekeeper, Intent Parser | Locks incoming task queue; snapshots active queue state. |
| **Phase 2: Flow** | 40% | ReAct Worker, MCP Tool Servers, bHive Gossip | Executes pending tool calls; distributes delta gossip across P2P mesh. |
| **Phase 3: Diastole** | 25% | SQLite WAL, Redis Cache, Thought Pruner | Commits completed transactions; prunes scratchpad tokens into Cold State. |
| **Phase 4: Return** | 15% | Chronos Kernel Ping, Thermal Governor | Validates APU temperature; verifies loopback socket integrity; resets baseline. |

---

## 3. Flux-Smith 75°C Thermal Governor

On compact workstations (e.g. AMD A8-7410 APUs or fanless mini-PCs), sustained background inference can cause thermal throttling:
1. `megabrain_pump.py` samples hardware thermal sensors every 5 seconds.
2. If `thermalC` remains below $68^\circ\text{C}$, the heartbeat operates at full velocity ($72\text{ BPM} / 4.8\text{ Hz}$).
3. When `thermalC` crosses $70^\circ\text{C}$ (Warning zone), background cron intervals are doubled.
4. When `thermalC` breaches $75^\circ\text{C}$ (**Flux-Smith Ceiling**), the governor triggers an immediate thermal pause:
   - Suspends all speculative agent branches.
   - Caps concurrent inference concurrency to 1.
   - Throttles the cardiac frequency down to $0.5\text{ Hz}$ until temperature drops below $65^\circ\text{C}$.

---

## 4. UI Visualization & Interactivity (`BiologicalHeartbeatView.tsx`)

- **Interactive 3D Cartoon Heart:** Claymorphic heart model pulsing in real-time with rhythmic expansion and contraction.
- **EKG Oscilloscope Canvas:** 60 FPS real-time electrocardiogram wave visualizer tracing P-Q-R-S-T cardiac intervals.
- **Phase Progress Bar:** Live bar tracking transitions between Systole, Flow, Diastole, and Return.
- **Manual Defibrillator Boost:** Interactive operator button to force an immediate synchronization pulse across all nodes.

---

## 5. Verification & Smoke Suite Assertions

- **Assertion 23:** `megabrain_pump.py` transitions sequentially through Systole $\to$ Flow $\to$ Diastole $\to$ Return without skipped steps.
- **Assertion 24:** Thermal reading $> 75^\circ\text{C}$ immediately drops pulse frequency below $1.0\text{ Hz}$.
- **Assertion 25:** Socket hot-patching re-establishes dropped `/ws` connections within 1 heartbeat cycle.
