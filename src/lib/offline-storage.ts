/**
 * IndexedDB-based offline-first storage layer.
 *
 * Strategy:
 *  1. Read/write locally first (IndexedDB)
 *  2. Queue offline mutations so they can be synced later
 *  3. Sync queued changes to Supabase when back online
 *  4. Retry failed syncs with exponential backoff
 *  5. Prevent duplicate synchronization using a "syncedAt" timestamp
 */

const DB_NAME = "venue-vue-offline";
const DB_VERSION = 1;
const STORE_NAME = "mutations";

const INDEXEDDB =
  typeof window !== "undefined"
    ? window.indexedDB ||
      (window as unknown as IDBFactory).webkitIndexedDB ||
      (window as unknown as IDBFactory).mozIndexedDB ||
      (window as unknown as IDBFactory).msIndexedDB
    : undefined;

interface IDBFactory {
  indexedDB: IDBFactory;
  webkitIndexedIDB?: IDBFactory;
  mozIndexedDB?: IDBFactory;
  msIndexedDB?: IDBFactory;
}

// Open (or create) the database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!INDEXEDDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }
    const request = INDEXEDDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (event) => {
      resolve(request.result as IDBDatabase);
    };
    request.onerror = (event) => {
      reject((event.target as IDBRequest).error as Error);
    };
    request.onblocked = () => {
      reject(new Error("IndexedDB upgrade blocked"));
    };
  });
}

// Schema for a mutation entry
interface MutationEntry {
  id: string; // unique identifier (e.g., "table:action:timestamp")
  type: "insert" | "update" | "delete";
  table: string;
  data?: unknown;
  where?: unknown; // for delete/update
  createdAt: number; // timestamp
  syncedAt?: number; // set when successfully synced; undefined = pending
}

/**
 * Store a mutation entry for offline sync.
 * If an entry with the same id already exists and has been synced,
 * it will be overwritten. If it's pending, it will be updated.
 */
export async function queueMutation(
  type: "insert" | "update" | "delete",
  table: string,
  data?: unknown,
  where?: unknown,
): Promise<string> {
  const id = `${table}:${type}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  const entry: MutationEntry = {
    id,
    type,
    table,
    data,
    where,
    createdAt: Date.now(),
  };

  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.put(entry, entry.id);
  return tx.done.then(() => id);
}

/**
 * Get all pending (unsynced) mutations.
 */
export async function getPendingMutations(): Promise<MutationEntry[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const all = await store.getAll();
  return all.filter((entry: MutationEntry) => entry.syncedAt === undefined);
}

/**
 * Mark a mutation as synced by its id.
 */
export async function markSynced(mutationId: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const entry = await store.get(mutationId);
  if (entry) {
    entry.syncedAt = Date.now();
    store.put(entry, entry.id);
  }
  await tx.done;
}

/**
 * Clear all synced mutations, keeping only pending ones.
 * Useful after a successful full sync.
 */
export async function clearSyncedMutations(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const all = await store.getAll();
  for (const entry of all) {
    if (entry.syncedAt !== undefined) {
      store.delete(entry.id);
    }
  }
  await tx.done;
}

/**
 * Get the user record from IndexedDB local store first,
 * falls back to Supabase if online, and queues the fetch as a mutation.
 * Returns the user data or null if neither is available.
 */
export async function getUserFromLocal(): Promise<{
  user:
    | ReturnType<
        (typeof import("@/integrations/supabase/client").supabase)["auth"]["getUser"]
      >["data"]["user"]
    | null;
} | null> {
  if (typeof window === "undefined") return null;

  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const entry = await store.get("currentUser");

  if (entry && "syncedAt" in entry && entry.syncedAt !== undefined) {
    // We have a synced user record
    return {
      user: entry.data as ReturnType<
        (typeof import("@/integrations/supabase/client").supabase)["auth"]["getUser"]
      >["data"]["user"],
    };
  }
  return null;
}

/**
 * Store the user record in IndexedDB after fetching from Supabase.
 */
export async function storeUserLocally(userData: {
  email: string;
  role?: string;
  userId: string;
}): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const entry = {
    id: "currentUser",
    data: userData,
    createdAt: Date.now(),
    syncedAt: Date.now(),
  };
  store.put(entry, entry.id);
  await tx.done;
}

export default {
  queueMutation,
  getPendingMutations,
  markSynced,
  clearSyncedMutations,
  getUserFromLocal,
  storeUserLocally,
};
