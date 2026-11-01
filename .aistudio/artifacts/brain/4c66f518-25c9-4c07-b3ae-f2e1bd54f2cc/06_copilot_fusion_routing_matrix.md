# Feature 06: Copilot Fusion Dynamic Latency Router & Model Hot-Swapping

**Feature ID:** `FEAT-06`  
**Classification:** Model Routing, Inference Optimization & Fallback Gateway  
**Security Gating:** Safe (Read/Route Invocations)  
**Circuit Breaker Ceiling:** `1,200ms` Inference Latency  
**Backends:** Ollama (`127.0.0.1:11434`), vLLM (`:8001`), SGLang (`:30000`)  

---

## 1. System Overview

**Copilot Fusion** optimizes compute consumption, response latency, and inference fidelity across heterogeneous local model runtimes. It dynamically routes operator prompts through three distinct architectural patterns while actively monitoring inference latency against a strict 1,200ms ceiling.

```
                              [ Operator Prompt Intent ]
                                          |
                                          v
                              [ Copilot Fusion Router ]
                                          |
                     +--------------------+--------------------+
                     |                                         |
            [ Latency <= 1,200ms ]                    [ Latency > 1,200ms ]
                     |                                         |
     +---------------+---------------+                         v
     |               |               |            [ CIRCUIT BREAKER TRIPPED ]
     v               v               v                         |
 [ Single ]     [ Cascade ]     [ Critique ]                   v
Fast Local     Cheap Draft ->   Draft + Review        [ Force Downgrade to Single ]
  Dispatch       Escalate         (Hermes 8B)           (Eliminates Queue Stall)
```

---

## 2. Execution Routing Patterns

1. **Single (`single`):** Direct dispatch to a size-matched local model based on intent complexity. Lowest token overhead, zero multi-turn escalation.
2. **Cascade (`cascade`):** Attempts initial response generation using an ultralight quantized model (e.g. 3B or IQ3_XXS). A heuristic evaluator grades response completeness; if below confidence threshold (0.85), the request escalates to a heavier 8B/14B model. Yields up to 60% token energy savings on mundane tasks.
3. **Critique (`critique`):** Two-stage deliberation pattern. Model A produces a draft patch or architectural decomposition; Model B (Nous Hermes) conducts adversarial critique and refines the final payload before returning to the caller.

---

## 3. Dynamic Latency Circuit Breaker

To prevent cascading inference queue deadlocks during heavy background APU load:
- The router tracks a rolling exponential moving average of Time-to-First-Token (TTFT) and token generation velocity.
- If observed latency exceeds `latency_ceiling_ms` ($1,200\text{ms}$), `circuit_breaker_tripped` is set to `true`.
- Any multi-stage `cascade` or `critique` requests are immediately downgraded to `single` local dispatch.
- Telemetry payload exposes:
  ```json
  {
    "route_pattern": "single",
    "requested_pattern": "critique",
    "observed_latency_ms": 1450,
    "latency_ceiling_ms": 1200,
    "circuit_breaker_tripped": true,
    "downgrade_reason": "APU unified memory bus latency exceeded 1200ms ceiling"
  }
  ```

---

## 4. Sovereign Le Chonk Quantization Matrix

The engine probes host RAM and APU VRAM to select the optimal GGUF quantization profile:

| Host Memory Capacity | Recommended Profile | Model Artifact | Memory Envelope |
|---|---|---|---|
| $\ge 64\text{ GB}$ High-End Desktop | **Q5_K_M** | `Nous-Hermes-3-Llama-3.1-70B-Q5_K_M` | $\approx 48\text{ GB}$ VRAM |
| $\ge 24\text{ GB}$ Mid-Tier Workstation | **Q4_K_M** | `Nous-Hermes-3-Llama-3.1-8B-Q4_K_M` | $\approx 5.2\text{ GB}$ RAM |
| $< 16\text{ GB}$ Low-Power APU / Termux | **IQ3_XXS / 14B Distill** | `Qwen2.5-Coder-7B-IQ3_XXS` | $\approx 2.8\text{ GB}$ RAM |

### Honest HTTP 503 Fallback:
If the local inference daemon is unreachable or models are unloaded, the router never fabricates hallucinations; it returns an honest `HTTP 503 Service Unavailable` with instructions to launch Ollama.

---

## 5. UI Features & Controls (`CopilotFusionView.tsx`)

- **Interactive Pattern Selector:** Manual toggle between Single, Cascade, and Critique modes.
- **Circuit Breaker Simulator:** Slider to dynamically adjust observed latency and trigger circuit trip animations.
- **Quantization Selector Panel:** Visual cards for Q5_K_M, Q4_K_M, and IQ3_XXS with real-time memory gauges.
- **Active Model Badges:** Real-time indicator of the currently engaged core model with hot-swap buttons.

---

## 6. Verification & Smoke Suite Assertions

- **Assertion 58:** Latency $> 1,200\text{ms}$ trips `circuit_breaker_tripped = true` and downgrades `critique` to `single`.
- **Assertion 59:** Daemon disconnection returns clean HTTP 503 without process crash.
