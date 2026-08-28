/**
 * Local persistence boundary.
 *
 * V1 keeps everything on the device: no account, no server. All reads and
 * writes go through this module so a remote adapter can be added later
 * without touching feature code.
 *
 * IndexedDB is the store of record; localStorage is a fallback for browsers
 * or privacy modes where IndexedDB is unavailable.
 */

const DB_NAME = "avora";
const DB_VERSION = 1;
const STORE = "documents";
const DOC_KEY = "root";
const LS_KEY = "avora:root";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

let available: boolean | null = null;

async function idbAvailable() {
  if (available !== null) return available;
  if (typeof indexedDB === "undefined") {
    available = false;
    return available;
  }
  try {
    const db = await openDb();
    db.close();
    available = true;
  } catch {
    available = false;
  }
  return available;
}

export async function readDocument<T>(): Promise<T | null> {
  if (typeof window === "undefined") return null;
  if (await idbAvailable()) {
    try {
      const db = await openDb();
      const value = await new Promise<T | null>((resolve, reject) => {
        const request = db.transaction(STORE, "readonly").objectStore(STORE).get(DOC_KEY);
        request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
        request.onerror = () => reject(request.error);
      });
      db.close();
      if (value) return value;
    } catch (error) {
      console.warn("Avora: falling back to local storage", error);
    }
  }
  const raw = window.localStorage.getItem(LS_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function writeDocument<T>(value: T): Promise<void> {
  if (typeof window === "undefined") return;
  if (await idbAvailable()) {
    try {
      const db = await openDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(value, DOC_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      db.close();
      return;
    } catch (error) {
      console.warn("Avora: falling back to local storage", error);
    }
  }
  window.localStorage.setItem(LS_KEY, JSON.stringify(value));
}

export async function clearDocument(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    if (await idbAvailable()) {
      const db = await openDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).delete(DOC_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    }
  } finally {
    window.localStorage.removeItem(LS_KEY);
  }
}
