import "server-only";

import type { StorageAdapter } from "@/lib/storage";

const globalForStorage = globalThis as unknown as { naksharixObjectStorage?: Map<string, Blob | Buffer | Uint8Array> };
const store = globalForStorage.naksharixObjectStorage ?? new Map<string, Blob | Buffer | Uint8Array>();
globalForStorage.naksharixObjectStorage = store;

export const localStorageAdapter: StorageAdapter = {
  async put(key, data, contentType) {
    store.set(key, data);
    return { key, contentType, size: data instanceof Blob ? data.size : data.byteLength, createdAt: new Date().toISOString() };
  },
  async get(key) {
    return store.get(key) ?? null;
  }
};
