/**
 * IndexedDB-based offline-first storage layer.
 *
 * Strategy:
 *  1. Read/write locally first (IndexedDB)
 *  2. Queue offline mutations so they can be synced later
 *  3. Sync queued changes to the backend when back online
 *  4. Prevent duplicate synchronization using a "syncedAt" timestamp
 */

const DB_NAME = "venue-vue-offline";
const DB_VERSION = 1;
export const STORE_NAME = "mutations";

/** Keys in the store that are not queued mutations. */
function isReservedKey(id: string) {
  return id === "currentUser" || id === "offlineSession" || id.startsWith("auth:");
}

function getIndexedDB(): IDBFactory | undefined {
  if (typeof window === "undefined") return undefined;
  return window.indexedDB;
}

export function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const idb = getIndexedDB();
    if (!idb) {
      reject(new Error("IndexedDB not supported"));
      return;
    }
    const request = idb.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
    request.onblocked = () => reject(new Error("IndexedDB upgrade blocked"));
  });
}

export function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

export function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
  });
}

export interface MutationEntry {
  id: string;
  type: "insert" | "update" | "delete";
  table: string;
  data?: unknown;
  where?: unknown;
  createdAt: number;
  syncedAt?: number;
}

export interface LocalUser {
  email: string;
  role?: string;
  userId: string;
}

interface UserEntry {
  id: string;
  data: LocalUser;
  createdAt: number;
  syncedAt: number;
}

/** Store a mutation entry for offline sync. */
export async function queueMutation(
  type: MutationEntry["type"],
  table: string,
  data?: unknown,
  where?: unknown,
): Promise<string> {
  const id = `${table}:${type}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  const entry: MutationEntry = { id, type, table, data, where, createdAt: Date.now() };

  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put(entry, entry.id);
  await txDone(tx);
  return id;
}

/** Get all pending (unsynced) mutations. */
export async function getPendingMutations(): Promise<MutationEntry[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const all = await promisifyRequest(tx.objectStore(STORE_NAME).getAll());
  return (all as MutationEntry[]).filter(
    (entry) => entry && entry.id && !isReservedKey(entry.id) && entry.syncedAt === undefined,
  );
}

/** Mark a mutation as synced by its id. */
export async function markSynced(mutationId: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const entry = (await promisifyRequest(store.get(mutationId))) as MutationEntry | undefined;
  if (entry) {
    entry.syncedAt = Date.now();
    store.put(entry, entry.id);
  }
  await txDone(tx);
}

/** Clear all synced mutations, keeping only pending ones. */
export async function clearSyncedMutations(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const all = (await promisifyRequest(store.getAll())) as MutationEntry[];
  for (const entry of all) {
    if (entry && entry.id && !isReservedKey(entry.id) && entry.syncedAt !== undefined) {
      store.delete(entry.id);
    }
  }
  await txDone(tx);
}

/** Read the cached signed-in user, if one was stored. */
export async function getUserFromLocal(): Promise<{ user: LocalUser } | null> {
  if (typeof window === "undefined") return null;
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const entry = (await promisifyRequest(tx.objectStore(STORE_NAME).get("currentUser"))) as
      | UserEntry
      | undefined;
    if (entry?.data) return { user: entry.data };
  } catch {
    // IndexedDB unavailable — fall through to the network path.
  }
  return null;
}

/** Cache the signed-in user for offline use. */
export async function storeUserLocally(userData: LocalUser): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const entry: UserEntry = {
      id: "currentUser",
      data: userData,
      createdAt: Date.now(),
      syncedAt: Date.now(),
    };
    tx.objectStore(STORE_NAME).put(entry, entry.id);
    await txDone(tx);
  } catch {
    // Non-fatal: offline caching is best effort.
  }
}

export default {
  queueMutation,
  getPendingMutations,
  markSynced,
  clearSyncedMutations,
  getUserFromLocal,
  storeUserLocally,
};
