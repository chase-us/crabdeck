# Crabdeck Quantum Omni-Layer — Master Feature Index & Traceability Matrix

**Platform:** Crabdeck Quantum Omni-Layer (v0.4.0 Patched / ClayMortal v10.5)  
**Host Architecture:** `hermesclaw.ai` (Single-Machine Loopback `127.0.0.1:3001` Express Gateway / `127.0.0.1:8000` FastAPI Core)  
**Security Invariant:** Zero Cloud Egress, Tri-Tier Tool Gating, HMAC-SHA256 Nonce Verification, 0.0% Background Idle CPU Overhead  

---

## 1. Executive Architecture Overview

The Crabdeck Quantum Omni-Layer serves as a sovereign, self-hosted multi-agent operating system and decentralized swarm control plane. It integrates real-time telemetry streaming, a 1,440-node minute-slot hypermesh, AST syntax-guarded patch generation, tiered memory persistence (CRAB-SHIELD), and dynamic model hot-swapping into an industrial cyber-noir tactile claymorphic interface.

```
                              +---------------------------------------+
                              |      CRABDECK QUANTUM OMNI-LAYER       |
                              |         Master Control Plane          |
                              +---------------------------------------+
                                                  |
           +--------------------+-----------------+--------------------+--------------------+
           |                    |                                      |                    |
+--------------------+ +--------------------+                 +--------------------+ +--------------------+
|  bHive Swarm Mesh  | |  Carbon SecAuditor |                 | Tiered Memory Vault| |   Copilot Fusion   |
| 1,440-Node Hyper   | | AST Syntax Gating  |                 | (CRAB-SHIELD WAL)  | | Multi-Model Router |
+--------------------+ +--------------------+                 +--------------------+ +--------------------+
           |                    |                                      |                    |
+--------------------+ +--------------------+                 +--------------------+ +--------------------+
| Biological Pulse   | | Megabrain Core     |                 | Worker Bot Swarm   | | Log-O-Matic 3000   |
| 4-Phase Chronos    | | QUBO Optimization  |                 | Kinematic Wiggles  | | 58/58 Smoke Suite  |
+--------------------+ +--------------------+                 +--------------------+ +--------------------+
           |                    |                                      |                    |
+--------------------+ +--------------------+                 +--------------------+ +--------------------+
| Gloop Viscosity    | | Zero-Trust MCP     |                 | Voice Conductor    | | Host Onboarding    |
| Sludge Reserves    | | Stdio/SSE Gateway  |                 | Audio Synthesizer  | | Multi-Runtime Host |
+--------------------+ +--------------------+                 +--------------------+ +--------------------+
```

---

## 2. Feature Specification Matrix

| Feature ID | Pillar / Feature Name | UI Component / Route | Primary Engine / Backend | Security Tier | Smoke Assertion | Artifact Reference |
|---|---|---|---|---|---|---|
| **FEAT-01** | **The War Room & Omni-Layer** | `NeuralHubView.tsx` (`war-room`) | Express Gateway (`:3001`) | Safe (Read-Only) | Asserts 1–5 | `01_war_room_omni_layer_architecture.md` |
| **FEAT-02** | **bHive 1,440-Node Hypermesh** | `BHiveSwarmView.tsx` (`bhive-mesh`) | `backend_py/hypermesh_1440.py` | Safe / Swarm Mesh | Asserts 6–12 | `02_bhive_1440_swarm_hypermesh.md` |
| **FEAT-03** | **bHive Swarm Chat Room** | `BHiveChatRoom.tsx` (`bhive-chat`) | Redis Streams (`crabdeck:events`) | Safe / Messaging | Asserts 13–16 | `03_bhive_swarm_chat_room.md` |
| **FEAT-04** | **Carbon SecAuditor & AST Gating**| `ASTPatchPlaygroundView.tsx` | `backend_py/claw/weekly_features.py` | Write (Sandbox Jail) | Assert 56 | `04_carbon_secauditor_ast_patch_engine.md` |
| **FEAT-05** | **Tiered Memory Vault** | `TieredMemoryVaultView.tsx` | SQLite WAL / sqlite-vec / Chroma | Safe / Append Only | Asserts 17–22 | `05_tiered_memory_vault_crab_shield.md` |
| **FEAT-06** | **Copilot Fusion & Router** | `CopilotFusionView.tsx` | `route_copilot_fusion()` | Safe / Router | Assert 58 | `06_copilot_fusion_routing_matrix.md` |
| **FEAT-07** | **Biological Heartbeat Pulse** | `BiologicalHeartbeatView.tsx` | `megabrain_pump.py` (Chronos) | Safe (Read-Only) | Asserts 23–27 | `07_biological_heartbeat_chronos_sync.md` |
| **FEAT-08** | **Megabrain Quantum Overclock** | `MegabrainOverclockView.tsx` | FastAPI Async Queue / QUBO | Safe / Tuning | Asserts 28–33 | `08_megabrain_quantum_overclock.md` |
| **FEAT-09** | **Worker Bot Playground** | `WorkerBotPlayground.tsx` | Moltcrab Lifecycle / Zustand | Safe / ReAct State | Asserts 34–38 | `09_worker_bot_playground_lifecycle.md` |
| **FEAT-10** | **Log-O-Matic & Smoke Suite** | `LogOMaticView.tsx` | `scripts/smoke.sh` (58/58) | Safe / Telemetry | Asserts 1–58 | `10_log_o_matic_58_smoke_suite.md` |
| **FEAT-11** | **Gloop Viscosity Analytics** | `GloopAnalyticsView.tsx` | `ClayReactionDiffusionEngine.ts` | Safe / Fluid Telemetry | Asserts 39–43 | `11_gloop_viscosity_analytics_engine.md` |
| **FEAT-12** | **Zero-Trust MCP Gateway** | `packages/mcp-gateway/` | MCP Stdio/SSE + HMAC-SHA256 | Destructive Gated | Asserts 44–48, 57 | `12_zero_trust_mcp_gateway_edge_appliance.md` |
| **FEAT-13** | **Voice Conductor & Claw Override**| `VoiceConductorModal.tsx` | Web Audio API / Voice Grammar | Destructive (Nonce) | Asserts 49–52 | `13_voice_conductor_tactical_override.md` |
| **FEAT-14** | **Frictionless Onboarding** | `FrictionlessOnboardingWizard.tsx`| `install-crabdeck.ps1` / Docker | Host Environment | Asserts 53–55 | `14_frictionless_onboarding_and_deployment.md` |

---

## 3. Strict Operating Invariants Certified

1. **Loopback Confinement:** All gateway and API interactions bind strictly to `127.0.0.1` (`:3001` Express, `:8000` FastAPI, `:11434` Ollama, `:6379` Redis). Zero telemetry egress to third-party endpoints.
2. **Tri-Tier Security Model:**
   - `SAFE`: Non-mutating reads permitted instantaneously without confirmation.
   - `WRITE`: Workspace operations logged to append-only audit trail (`claw_activity.jsonl`) with atomic rollback undo tokens.
   - `DESTRUCTIVE`: Pauses execution, generating a cryptographic 16-character HMAC-SHA256 nonce approval token requiring physical operator sign-off.
3. **0.0% Idle CPU Overhead:** All views, 3D WebGL renderers, Web Audio pools, and canvas loops register `document.hidden` event hooks to completely suspend animation loops and socket pollers when unfocused or backgrounded.
