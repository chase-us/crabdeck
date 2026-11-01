# FEAT-17: Google Tasks Urgency Heat Map & Gemini 3.8 Flash Assistant Bot

## Executive Summary
**Crabdeck Quantum Omni-Layer v1.0.0 Production** extends the Google Workspace Google Tasks integration with a real-time **Urgency Heat Map Visualizer** utilizing **Crab Claw Orange (`#FF4D00`)** for high-priority/P0 urgent items. In addition, it embeds a full-stack **Gemini Assistant Bot** running on `gemini-3.8-flash` via an Express proxy route (`/api/gemini/chat`) conforming strictly to the `@google/genai` modern TypeScript SDK standards.

---

## 1. Urgency Heat Map Matrix Architecture

### 1.1 The 4-Tier Urgency Classification System
Tasks within Google Tasks are classified into four distinct heat intensity tiers:

| Tier | Priority Label | Color Code | Visual Indicators | Trigger Rules |
| :--- | :--- | :--- | :--- | :--- |
| **P0** | **Crab Claw Orange (Critical Urgent)** | `#FF4D00` | Pulsing flame badge, thick 5px glowing left border, ambient card aura | `[CRAB-P0]`, `[P0]`, `CRITICAL`, `URGENT`, `HOTFIX`, or due date within 24h / overdue |
| **P1** | **Amber Coral (High Priority)** | `#FF8C00` | Zap icon, amber glow, elevated priority badge | `[CRAB-P1]`, `[P1]`, `HIGH`, `IMPORTANT`, or due date within 3 days |
| **P2** | **Gold Yellow (Medium Priority)** | `#FFD700` | Clock icon, gold badge, standard card border | `[CRAB-P2]`, `[P2]`, `MEDIUM`, `NORMAL`, or due date within 7 days |
| **P3** | **Cyber Cyan (Low Priority)** | `#70D6FF` | Check circle icon, subtle cyan tint | Standard routine operational items |

### 1.2 Interactive Heat Distribution Bar & Filters
- **Continuous Spectrum Meter**: Displays the active proportion of tasks across each heat tier in real time.
- **One-Click Heat Tier Filtering**: Clicking on the **P0 Crab Claw Orange** chip instantly filters the active task feed down to critical items requiring immediate operator action.
- **Micro-Animations & Audio Feedback**: Tactile click SFX, hover scale (`hover:scale-[1.02]`), and active depression (`active:scale-[0.98]`).

---

## 2. Server-Side Gemini 3.8 Flash Assistant Bot

### 2.1 Backend Architecture (`server.ts`)
- **SDK**: Modern `@google/genai` TypeScript SDK (version `>= 2.4.0`).
- **Endpoint**: `POST /api/gemini/chat`.
- **Model**: `gemini-3.8-flash` for high-frequency reasoning, low latency, and multi-turn chat loops.
- **Custom User-Agent**: Strictly passes `User-Agent: aistudio-build` in the `fetch` initializer per AI Studio specifications.
- **Security Boundary**: Zero client-side API key exposure. `process.env.GEMINI_API_KEY` remains strictly server-side.

### 2.2 Assistant Bot Capabilities
1. **Google Tasks Triage**: Analyzes task backlogs and recommends promotion to Crab Claw Orange P0 status based on system deadlines.
2. **Swarm Mesh Diagnostics**: Evaluates bHive 1,440-minute peer latency distribution and gossip-delta sync frequencies.
3. **Smoke Suite Audit**: Inspects the 58 evaluation assertions in `scripts/smoke.sh`, including Carbon SecAuditor AST validation and Hob canonical realpath confinement.
4. **Interactive Chat Drawer**: Expandable, draggable tactical HUD with copy-to-clipboard, history purging, and preset operational prompts.

---

## 3. Production Deployment & OAuth Whitelist Specifications

- **Canonical Production Origin**: `https://hermesclaw.ai`
- **GCP Project ID**: `second-broker-412618` (Project Number: `70954141715`)
- **OAuth Client ID**: `70954141715-4q3a1d97gdk8vkf0lk35mbcqaqb8gd4a.apps.googleusercontent.com`
- **Authorized JavaScript Origins**:
  - `https://hermesclaw.ai`
  - `https://ais-dev-vaqiqabisfgomgwypr6s6i-262573108130.us-east1.run.app`
  - `https://ais-pre-vaqiqabisfgomgwypr6s6i-262573108130.us-east1.run.app`
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`
- **Authorized Redirect URIs**:
  - `https://hermesclaw.ai/__/auth/handler`
  - `https://second-broker-412618.firebaseapp.com/__/auth/handler`
  - `https://ais-dev-vaqiqabisfgomgwypr6s6i-262573108130.us-east1.run.app/__/auth/handler`
  - `https://ais-pre-vaqiqabisfgomgwypr6s6i-262573108130.us-east1.run.app/__/auth/handler`
  - `http://localhost:3000/__/auth/handler`
  - `http://127.0.0.1:3000/__/auth/handler`

---

## 4. Verification & Smoke Invariants
- **58/58 Smoke Suite**: Verified via `bash scripts/smoke.sh` with zero failures across all 17 sections.
- **Tree-Shaking & Minification**: Verified via `npm run build` (`vite build`), ensuring clean output in `dist/`.
- **Typings Compliance**: Global declarations in `src/types/google.d.ts` completely resolve `window.gapi` and `window.google.picker` build warnings.
