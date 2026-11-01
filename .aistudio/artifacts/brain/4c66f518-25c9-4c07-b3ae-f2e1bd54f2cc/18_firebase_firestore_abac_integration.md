# Feature Artifact 18: Firebase & Firestore Zero-Trust ABAC Architecture

**Crabdeck Quantum Omni-Layer (v1.2.0-rc2)**  
**Cloud Infrastructure & Database Integration Specification**

---

## 1. Executive Summary & Provisioning Details

To establish scalable, persistent real-time data storage and operator access controls for the Crabdeck Quantum Omni-Layer, Firebase and Firestore Enterprise Edition were provisioned:

- **Target Google Cloud / Firebase Project ID:** `second-broker-412618`
- **Region:** `us-east1`
- **Firestore Database Instance ID:** `ai-studio-crabdeck-4c66f518-25c9-4c07-b3ae-f2e1bd54f2cc`
- **Provisioned Services:**
  - Google Cloud Firestore (Document Database with real-time `onSnapshot` listeners)
  - Firebase Authentication (Google Sign-In via popup for Sovereign Operators)
  - Hardened Zero-Trust ABAC Security Rules deployed directly to Cloud Firestore

---

## 2. Intermediate Representation Blueprint (`firebase-blueprint.json`)

The architecture models application data into three core entities linked to Firestore collections:

1. **`SwarmMessage` (`/swarm_messages/{messageId}`)**
   - High-throughput message bus representing node broadcasts, peer synchronization signals, and human-in-the-loop operator directives.
   - Enforces payload bounds ($\le 4096$ characters) and strict sender UID validation (`request.auth.uid == senderUid`).

2. **`TelemetryRecord` (`/telemetry/{telemetryId}`)**
   - Live telemetry heartbeats tracking node latency, active peer count (1,440 nodes), and gossip synchronization frequencies.

3. **`OperatorProfile` (`/operators/{operatorId}`)**
   - Secure operator profiles partitioned strictly by Firebase Auth UID with callsign and tactical preferences.

---

## 3. Hardened Zero-Trust ABAC Security (`firestore.rules`)

The deployed Firestore security rules strictly implement the 8 pillars of hardened database protection:

- **Default-Deny Catch-All:** `match /{document=**} { allow read, write: if false; }` ensures no unmapped collections are ever publicly accessible.
- **Path Variable Hardening:** `isValidId(id)` verifies document keys conform to alphanumeric characters without regex or buffer injection attacks.
- **Identity Integrity:** Documents in `/swarm_messages` and `/operators` can only be authored or mutated by the verified authenticated caller matching `request.auth.uid`.
- **Prohibited Updates/Deletes:** Swarm messages and telemetry streams are append-only to preserve tamper-evident audit logs.

---

## 4. UI / UX Integration & Live Telemetry

- **Firebase Status Card (`FirebaseStatusModal.tsx`):**
  Accessible directly from the Left Control Box actions grid and the top navigation bar. Displays project credentials, database instance state, live connection checks, and Google Sign-In status.
- **Swarm Chat Persistence:**
  Operator directives entered in `BHiveChatRoom.tsx` are now automatically written to `/swarm_messages` in Firestore, allowing multi-device state synchronization.
- **Robust Error Telemetry (`handleFirestoreError`):**
  Structured JSON error payloads conform to `FirestoreErrorInfo` to immediately identify any permission denials or quota limits.
