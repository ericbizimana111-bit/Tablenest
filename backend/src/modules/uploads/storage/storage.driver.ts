/**
 * Where uploaded bytes live. The rest of the app only sees `key` and `url`, so moving to object
 * storage (S3, Cloudflare R2, Backblaze B2, MinIO…) means adding a driver here and selecting it
 * with UPLOAD_DRIVER — no changes to services, schemas or the API.
 */
export interface StorageDriver {
  readonly name: string;
  put(key: string, data: Buffer, mimetype: string): Promise<{ url: string }>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

export const STORAGE_DRIVER = Symbol('STORAGE_DRIVER');

/**
 * Keys are generated server-side (`<uuid>.<ext>`); this guards every driver against traversal
 * regardless. The second form matches files written by the previous upload implementation,
 * which the migration registers only after verifying their bytes are a real image.
 */
export const SAFE_KEY = /^(?:[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}|\d{10,16}-\d{1,12})\.(jpg|jpeg|png|webp|gif)$/;
