import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  Unsubscribe
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, db, googleAuthProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';

export interface FirebaseSwarmMessage {
  id: string;
  slot: number;
  nodeId: string;
  timeUtc: string;
  timestamp: string;
  archetype: string;
  model: string;
  summary: string;
  payload: string;
  senderUid: string;
  createdAt: string;
}

export interface FirebaseTelemetryRecord {
  id: string;
  nodeId: string;
  latencyMs: number;
  activePeers: number;
  syncFrequency: number;
  recordedAt: string;
}

export const firebaseConfigInfo = {
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId,
  authDomain: firebaseConfig.authDomain,
};

// Sign in with Google Popup
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    return result.user;
  } catch (error) {
    console.error('Firebase Google Sign-In error:', error);
    throw error;
  }
}

// Sign out
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase Sign-Out error:', error);
    throw error;
  }
}

// Subscribe to auth state
export function onAuthStatusChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// Save a Swarm Message to Firestore
export async function saveSwarmMessageToFirestore(message: Omit<FirebaseSwarmMessage, 'senderUid' | 'createdAt'>): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.warn('Cannot write to Firestore: User not authenticated.');
    return;
  }

  const path = 'swarm_messages';
  try {
    const docRef = doc(db, path, message.id);
    const data: FirebaseSwarmMessage = {
      ...message,
      senderUid: currentUser.uid,
      createdAt: new Date().toISOString(),
    };
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${message.id}`);
  }
}

// Listen to Swarm Messages from Firestore
export function subscribeToSwarmMessages(
  callback: (messages: FirebaseSwarmMessage[]) => void
): Unsubscribe | null {
  if (!auth.currentUser) {
    return null;
  }

  const path = 'swarm_messages';
  try {
    const q = query(collection(db, path), limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        const msgs: FirebaseSwarmMessage[] = [];
        snapshot.forEach((docSnap) => {
          msgs.push(docSnap.data() as FirebaseSwarmMessage);
        });
        callback(msgs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Save Telemetry Record to Firestore
export async function saveTelemetryRecord(record: FirebaseTelemetryRecord): Promise<void> {
  if (!auth.currentUser) return;

  const path = 'telemetry';
  try {
    const docRef = doc(db, path, record.id);
    await setDoc(docRef, record);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${record.id}`);
  }
}
