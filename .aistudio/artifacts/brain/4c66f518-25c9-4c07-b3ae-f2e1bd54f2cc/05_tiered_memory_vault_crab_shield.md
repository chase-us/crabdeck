# Feature 05: Tiered Memory Vault (Shell Cracked / CRAB-SHIELD)

**Feature ID:** `FEAT-05`  
**Classification:** Persistent State & Cognitive Memory Architecture  
**Security Gating:** Safe (Append-Only Working Log / Read-Only Vector Query)  
**Database Engines:** SQLite 3 (WAL mode), Redis 7, ChromaDB, `sqlite-vec`, Neo4j  
**Data Directory:** `data/crabdeck_local.db`, `data/hot_memory/`, `vault/chroma/`  

---

## 1. System Overview

The **Tiered Memory Vault** (codenamed **Shell Cracked** and protected by **CRAB-SHIELD**) eliminates LLM context amnesia and token context window saturation. It partitions agent knowledge across two coordinated tiers: **Hot State** for sub-second append-only recall, and **Cold State** for deep semantic vector search and entity relation graphs.

```
+-----------------------------------------------------------------------------------+
|                         TIERED MEMORY VAULT ARCHITECTURE                          |
+-----------------------------------------------------------------------------------+
                                          |
         +--------------------------------+--------------------------------+
         |                                                                 |
         v                                                                 v
+-----------------------------------+             +-----------------------------------+
|             HOT STATE             |             |            COLD STATE             |
|   (Sub-Millisecond Terminal Recall) |             |    (Semantic & Relational Recall)  |
+-----------------------------------+             +-----------------------------------+
| - SQLite 3 with PRAGMA journal=WAL|             | - sqlite-vec sub-ms embeddings    |
| - Redis 7 In-Memory Key-Value     |             | - ChromaDB Vector Space           |
| - Append-only claw_activity.jsonl |             | - Neo4j Entity Knowledge Graph    |
| - Rolling 50-entry buffer cache   |             | - Markdown Specifications Archive |
+-----------------------------------+             +-----------------------------------+
         |                                                                 |
         +--------------------------------+--------------------------------+
                                          |
                                          v
                      [ CONTEXT SATURATION PRUNER & SCRUBBER ]
                      Distills Hot Working Logs into Cold Graph Nodes
```

---

## 2. Storage Tier Specifications

### Tier 1: Hot State (Immediate Working Logs)
- **Engine:** SQLite 3 configured with `PRAGMA journal_mode=WAL` and `PRAGMA synchronous=NORMAL`.
- **Latency:** $\le 0.4\text{ms}$ write operations; zero file locking bottlenecks.
- **Canonical Tables in `data/crabdeck_local.db`:**
  - `telemetry_samples` (indexed by `idx_telemetry_ts`)
  - `health_events`
  - `app_metadata`
- **Audit Stream:** Append-only log file at `vault/claw_activity.jsonl` tracking every agent thought, tool dispatch, and step budget.

### Tier 2: Cold State (Vector & Graph Storage)
- **Vector Embedding Engine:** `sqlite-vec` extension loaded directly into `crabdeck_local.db` combined with ChromaDB collections for semantic clustering.
- **Dimensionality:** 384-dimensional dense vectors (e.g. `all-MiniLM-L6-v2` or `bge-small-en-v1.5`).
- **Knowledge Graph:** Neo4j property graph mapping nodes `(Agent)-[:EXECUTED]->(Tool)-[:MODIFIED]->(File)`.
- **Zero-Egress Guarantee:** All embeddings are computed locally using quantized ONNX runtimes without external cloud API calls.

---

## 3. Context Compaction & Thought Pruner

To ensure long-running multi-day agent execution loops do not exhaust the 8k–32k context windows of local models:
1. Every 15 minutes, the **Thought Pruner** scans active working trajectories in Hot Memory.
2. Redundant intermediate reasoning steps, scratchpad attempts, and verbose tool outputs are scrubbed.
3. High-salience findings and root-cause solutions are compiled into distilled Markdown summaries and embedded into the Cold State vector database.
4. Hot memory tables are truncated to retain the most recent 100 observations per task.

---

## 4. UI Inspector Features (`TieredMemoryVaultView.tsx`)

The interactive interface provides:
- **Hot Memory Live Terminal:** Real-time log inspector with filter controls (Hot, Cold, Vector, Graph).
- **Interactive Search:** Semantic keyword and cosine similarity vector search bar.
- **Memory Allocation Gauges:** Visual display of SQLite WAL file size, Redis memory usage, ChromaDB vector count, and Neo4j node/edge counts.
- **Snapshot Export:** One-click export of system state to JSON for offline regression analysis.

---

## 5. Verification & Smoke Suite Assertions

- **Assertion 17:** SQLite WAL mode is locked and verified via `PRAGMA journal_mode` returning `wal`.
- **Assertion 18:** `PRAGMA integrity_check` passes with zero corrupted database pages.
- **Assertion 19:** `sqlite-vec` cosine similarity query returns top-k nearest neighbors in $< 5\text{ms}$.
