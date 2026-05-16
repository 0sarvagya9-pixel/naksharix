import "server-only";

import type { StorageAdapter } from "@/lib/storage";

export const cloudStorageAdapter: StorageAdapter = {
  async put() {
    throw new Error("Cloud storage is not configured yet.");
  },
  async get() {
    return null;
  }
};
