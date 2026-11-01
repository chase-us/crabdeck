# Feature 09: Worker Bot Playground & Autonomous Agent Lifecycle

**Feature ID:** `FEAT-09`  
**Classification:** Agent Population Management & Kinematic Physics Playground  
**Security Gating:** Safe (Status Inspection & Reconciliation Dispatch)  
**Lifecycle Protocol:** Moltcrab / Moltlobster Container Reconciliation  
**Kinematics:** Spring Damper Harmonic Oscillator ($120\text{ Hz}$ Wiggle Physics)  

---

## 1. System Overview

The **Worker Bot Playground** provides an interactive, visual testing ground for observing, managing, and synchronizing autonomous agent worker bots. It pairs robust operational state-machine mechanics with playful, tactile 3D cartoon visuals and responsive physical spring interactions.

```
+-----------------------------------------------------------------------------------+
|                        WORKER BOT FINITE STATE MACHINE                            |
+-----------------------------------------------------------------------------------+
                                          |
                +-------------------------+-------------------------+
                |                         |                         |
                v                         v                         v
           [ HAPPY ]                 [ WIGGLY ]                [ SLEEPY ]
         (Nominal Load)           (High Frequency)           (Idle Standby)
                |                         |                         |
                +-------------------------+-------------------------+
                                          |
                                          v
                                     [ ZOOMING ]
                               (Sprint Turbo Execution)
                                          |
                +-------------------------+-------------------------+
                |                                                   |
                v                                                   v
            [ ERROR ]                                           [ SYNCED ]
      (Thermal / AST Drift)                               (Reconciled & Grounded)
                |                                                   ^
                +---------------- [ AUTO-SYNC ] --------------------+
```

---

## 2. Worker Bot Schema (`WorkerBot`)

```typescript
export interface WorkerBot {
  id: string;                      // e.g. "bot-01"
  name: string;                    // e.g. "Pinchy McClaw", "Barnaby Banano"
  status: 'HAPPY' | 'WIGGLY' | 'SLEEPY' | 'ZOOMING' | 'CHILLIN' | 'ERROR' | 'LUCKY' | 'LEARNING' | 'LEGEND' | 'SYNCED';
  task: string;                    // Current active workstream description
  wiggleFreq: number;              // Kinematic oscillation frequency in Hz
  temperature: number;             // Worker core temperature in °C
  efficiency: number;              // 0.0 - 100.0% execution efficiency
  color: string;                   // Hex accent color
  avatar: string;                  // Emoji icon
}
```

---

## 3. Moltcrab / Moltlobster Container Reconciliation

When worker bots encounter environment drift, dependency corruption, or AST syntax errors:
1. The **Moltcrab Watchdog** flags the container with status `ERROR`.
2. The agent's working volume is quarantined.
3. The container runtime executes a zero-downtime hot-restart, mounting a pristine snapshot of the codebase from git HEAD.
4. Environment variables and HMAC authentication nonces are injected anew.
5. The bot transitions smoothly to status `SYNCED`, restoring efficiency to $\ge 99.8\%$ and cooling temperature to $\approx 39.0^\circ\text{C}$.

---

## 4. UI Interactivity & Spring Kinematics (`WorkerBotPlayground.tsx`)

- **Interactive Bot Cards:** Click any worker bot to cycle its status, view its active task, and trigger physical spring oscillations.
- **Googly Eyes & Wiggle Animation:** Tactile cartoon physics where pupil positions calculate vector offsets relative to cursor coordinates.
- **Sync All Bots Master Action:** Instantly sends an orchestration pulse to reconcile all lagging, wiggly, or errored bots to `SYNCED`.
- **Haptic Audio Chimes:** Synchronized audio feedback via Web Audio API oscillators when bots change state or achieve milestones.

---

## 5. Verification & Smoke Suite Assertions

- **Assertion 34:** Worker bot state updates trigger deterministic DOM updates within 16ms (60 FPS).
- **Assertion 35:** Moltcrab container reconciliation restores `ERROR` status bots to `SYNCED` within $< 2\text{ seconds}$.
- **Assertion 36:** Bot temperature and efficiency stay within bounded ranges ($30^\circ\text{C} \le T \le 75^\circ\text{C}$, $0\% \le \eta \le 100\%$).
