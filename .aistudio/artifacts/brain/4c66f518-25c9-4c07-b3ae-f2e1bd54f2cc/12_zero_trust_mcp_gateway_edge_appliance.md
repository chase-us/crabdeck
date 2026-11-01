# Feature 12: Zero-Trust MCP Gateway & Sovereign Edge-Inference Appliance

**Feature ID:** `FEAT-12`  
**Classification:** Tool Execution Gateway & Kernel Sandbox Boundary  
**Security Gating:** Destructive Gated (Cryptographic Nonce & Approval Required)  
**Transports:** stdio IPC (Local Subprocess) & HTTP Server-Sent Events (SSE)  
**Confinement:** Win32 Job Objects (Windows) / POSIX `rlimits` & `unshare` (Linux/Termux)  

---

## 1. System Overview

The **Zero-Trust Model Context Protocol (MCP) Gateway** acts as the secure execution bridge between reasoning LLM agents and the host operating system. It enforces bidirectional capability discovery, strict schema validation, OS-level kernel sandboxing, and cryptographic approval nonces before executing any local tool or system command.

```
+-----------------------------------------------------------------------------------+
|                           ZERO-TRUST MCP TOOL GATEWAY                             |
+-----------------------------------------------------------------------------------+
                                          |
                      [ Inbound Agent Tool Invocation ]
                      { tool_name, tool_args, signature }
                                          |
                                          v
                    [ Bidirectional Capability Handshake ]
                      (Advertised via Pydantic / Zod)
                                          |
                                          v
                         [ Tri-Tier Security Filter ]
                                          |
         +--------------------------------+--------------------------------+
         |                                |                                |
         v                                v                                v
    [ SAFE TIER ]                   [ WRITE TIER ]                 [ DESTRUCTIVE ]
  - Read-Only ops                 - Mutating files                - Delete files / DB
  - Immediate execution           - Append to audit log           - PAUSE EXECUTION
  - Zero prompt gating            - Generate undo token           - Generate HMAC Nonce
                                                                  - Operator Sign-Off
                                                                           |
                                                                           v
                                                         [ OS-Level Kernel Sandbox ]
                                                         - Win32 Job Objects
                                                         - Linux POSIX rlimits
                                                         - Canonical realpath check
```

---

## 2. Dual-Transport Architecture

1. **stdio IPC Transport:** Used for low-latency, zero-network subprocess tool dispatch. The host spawns dedicated tool runners communicating over standard input/output pipes with structured JSON-RPC 2.0 framing.
2. **HTTP Server-Sent Events (SSE) Transport:** Used for streaming long-running terminal executions, build processes, and multi-file code searches back to the Crabdeck dashboard in real-time.

---

## 3. Cryptographic Execution Nonces & Approval Gate

To eliminate replay attacks, prompt injection exploits, and unauthorized destructive mutations:
1. When an agent requests a destructive action (such as dropping database tables or executing bash scripts), the MCP Gateway generates a cryptographic nonce:
   $$\text{HMAC-SHA256}(\text{SecretKey}, \text{tool\_name} \parallel \text{tool\_args} \parallel \text{timestamp})$$
2. The agent loop is immediately paused and a request is placed in the **Claw Approval Inbox** (`GET /claw/approvals`).
3. The human operator reviews the proposed action, parameters, and diff in the Crabdeck UI.
4. Only upon explicit operator approval is the signed HMAC nonce validated and the job dispatched within the isolated kernel sandbox.

---

## 4. Kernel Sandbox Boundaries

| Host Operating System | Confinement Mechanism | Resource Quota Enforced |
|---|---|---|
| **Windows 11 (Host)** | Win32 Job Objects (`CreateJobObject`) | Max RAM: 2.0 GB, CPU affinity clamp, Process termination on timeout |
| **Linux (Ubuntu/Debian)**| POSIX `setrlimit` + `unshare(CLONE_NEWNS)` | File descriptor ceiling: 256, Read-only root filesystem mount |
| **Android Termux** | `prlimit` process bounds + local loopback clamp | Battery-aware throttling, max 4 background threads |

---

## 5. Verification & Smoke Suite Assertions

- **Assertion 44:** Unregistered MCP tools are rejected fail-closed with HTTP 403 Forbidden.
- **Assertion 45:** Tampered HMAC-SHA256 nonces fail verification and prevent command execution.
- **Assertion 46:** Process exceeding 2.0 GB memory envelope in Win32 Job Object is terminated cleanly.
