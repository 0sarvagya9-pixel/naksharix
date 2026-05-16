import "server-only";

export type StoredObject = {
  key: string;
  url?: string;
  contentType?: string;
  size?: number;
  createdAt: string;
};

export interface StorageAdapter {
  put(key: string, data: Blob | Buffer | Uint8Array, contentType: string): Promise<StoredObject>;
  get(key: string): Promise<Blob | Buffer | Uint8Array | null>;
}

export async function getStorageAdapter(): Promise<StorageAdapter> {
  const { localStorageAdapter } = await import("@/lib/storage/local-storage");
  return localStorageAdapter;
}
