/**
 * Offline credential vault.
 *
 * After a successful ONLINE sign-in we store the user's identity plus a
 * PBKDF2 hash of their password in IndexedDB. With no connection, the login
 * form verifies the typed password against that hash so a returning user can
 * still get into the register.
 *
 * Only a salted hash is stored — never the plaintext password.
 */

import { openOfflineDB, promisifyRequest, txDone, STORE_NAME } from "./offline-storage";

const PBKDF2_ITERATIONS = 150_000;
const SESSION_KEY = "offlineSession";
const SESSION_FLAG = "venue-vue-offline-session";

export interface OfflineAuthRecord {
  id: string;
  email: string;
  userId: string;
  role: string;
  salt: string;
  passwordHash: string;
  cachedAt: number;
}

export interface OfflineSession {
  email: string;
  userId: string;
  role: string;
  startedAt: number;
}

function authKey(email: string) {
  return `auth:${email.trim().toLowerCase()}`;
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      // BufferSource copy keeps TS happy across lib targets
      salt: salt.slice(),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );
  return toHex(bits);
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Remember these credentials so the user can sign in again with no network. */
export async function cacheCredentialsForOffline(params: {
  email: string;
  password: string;
  userId: string;
  role: string;
}): Promise<void> {
  if (typeof window === "undefined" || !window.crypto?.subtle) return;
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passwordHash = await hashPassword(params.password, salt);
    const record: OfflineAuthRecord = {
      id: authKey(params.email),
      email: params.email.trim(),
      userId: params.userId,
      role: params.role,
      salt: toHex(salt.buffer),
      passwordHash,
      cachedAt: Date.now(),
    };
    const db = await openOfflineDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(record, record.id);
    await txDone(tx);
  } catch {
    // Best effort — offline sign-in simply won't be available.
  }
}

/** Verify typed credentials against the offline vault. */
export async function verifyOfflineCredentials(
  email: string,
  password: string,
): Promise<OfflineSession | null> {
  if (typeof window === "undefined" || !window.crypto?.subtle) return null;
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const record = (await promisifyRequest(
      tx.objectStore(STORE_NAME).get(authKey(email)),
    )) as OfflineAuthRecord | undefined;
    if (!record?.passwordHash) return null;

    const candidate = await hashPassword(password, fromHex(record.salt));
    if (!timingSafeEqual(candidate, record.passwordHash)) return null;

    return {
      email: record.email,
      userId: record.userId,
      role: record.role,
      startedAt: Date.now(),
    };
  } catch {
    return null;
  }
}

/** Mark the device as signed in while offline. */
export async function startOfflineSession(session: OfflineSession): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_FLAG, "1");
  } catch {
    /* ignore */
  }
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(session, SESSION_KEY);
    await txDone(tx);
  } catch {
    /* ignore */
  }
}

/** Read the offline session, if the device has one. */
export async function getOfflineSession(): Promise<OfflineSession | null> {
  if (typeof window === "undefined") return null;
  try {
    if (window.localStorage.getItem(SESSION_FLAG) !== "1") return null;
  } catch {
    return null;
  }
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const session = (await promisifyRequest(tx.objectStore(STORE_NAME).get(SESSION_KEY))) as
      | OfflineSession
      | undefined;
    return session ?? null;
  } catch {
    return null;
  }
}

/** Clear the offline session marker (keeps the credential vault intact). */
export async function endOfflineSession(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_FLAG);
  } catch {
    /* ignore */
  }
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(SESSION_KEY);
    await txDone(tx);
  } catch {
    /* ignore */
  }
}

/** True when the browser reports no network connection. */
export function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}
