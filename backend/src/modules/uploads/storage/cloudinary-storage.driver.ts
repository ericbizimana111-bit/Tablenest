import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { SAFE_KEY, StorageDriver } from './storage.driver';

export interface CloudinaryCredentials {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * Stores images in Cloudinary under `<folder>/<uuid>` and returns their HTTPS delivery URL.
 * Use it wherever the server disk is ephemeral (Render, Railway, Heroku…) or several API
 * instances run at once. Bytes are validated by the uploads service before they get here.
 */
export class CloudinaryStorageDriver implements StorageDriver {
  readonly name = 'cloudinary';

  constructor(
    private readonly creds: CloudinaryCredentials,
    private readonly folder: string,
  ) {}

  private auth() {
    return { cloud_name: this.creds.cloudName, api_key: this.creds.apiKey, api_secret: this.creds.apiSecret };
  }

  private publicIdFor(key: string) {
    if (!SAFE_KEY.test(key)) throw new Error('Invalid storage key');
    return `${this.folder}/${key.replace(/\.[a-z]+$/, '')}`;
  }

  put(key: string, data: Buffer) {
    const public_id = this.publicIdFor(key);
    return new Promise<{ url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { ...this.auth(), public_id, resource_type: 'image', overwrite: false, unique_filename: false },
        (err, res?: UploadApiResponse) => {
          if (err || !res) return reject(new Error(`Cloudinary upload failed: ${err?.message || 'no response'}`));
          resolve({ url: res.secure_url });
        },
      );
      stream.end(data);
    });
  }

  async delete(key: string) {
    await cloudinary.uploader.destroy(this.publicIdFor(key), { ...this.auth(), resource_type: 'image', invalidate: true });
  }

  async exists(key: string) {
    try {
      await cloudinary.api.resource(this.publicIdFor(key), { ...this.auth(), resource_type: 'image' });
      return true;
    } catch {
      return false;
    }
  }
}

/** Reads credentials from CLOUDINARY_URL (cloudinary://key:secret@cloud) or the three separate variables. */
export function cloudinaryCredentials(get: (k: string) => string | undefined): CloudinaryCredentials | null {
  const url = get('CLOUDINARY_URL');
  if (url) {
    const m = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec(url.trim());
    return m ? { apiKey: decodeURIComponent(m[1]), apiSecret: decodeURIComponent(m[2]), cloudName: m[3] } : null;
  }
  const cloudName = get('CLOUDINARY_CLOUD_NAME');
  const apiKey = get('CLOUDINARY_API_KEY');
  const apiSecret = get('CLOUDINARY_API_SECRET');
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}
