import { promises as fs } from 'fs';
import * as path from 'path';
import { SAFE_KEY, StorageDriver } from './storage.driver';

/**
 * Stores files on the server's disk and serves them from `/uploads/<key>` (see app.setup.ts).
 * Suitable for a single server with a persistent volume. Use an object-storage driver when the
 * disk is ephemeral or several API instances run behind a load balancer.
 */
export class LocalStorageDriver implements StorageDriver {
  readonly name = 'local';

  constructor(
    private readonly dir: string,
    private readonly publicBaseUrl: string,
  ) {}

  private pathFor(key: string) {
    if (!SAFE_KEY.test(key)) throw new Error('Invalid storage key');
    const full = path.resolve(this.dir, key);
    if (path.dirname(full) !== path.resolve(this.dir)) throw new Error('Invalid storage key');
    return full;
  }

  async put(key: string, data: Buffer) {
    await fs.mkdir(this.dir, { recursive: true });
    await fs.writeFile(this.pathFor(key), data, { flag: 'wx' });
    return { url: `${this.publicBaseUrl}/uploads/${key}` };
  }

  async delete(key: string) {
    await fs.rm(this.pathFor(key), { force: true });
  }

  async exists(key: string) {
    try {
      await fs.access(this.pathFor(key));
      return true;
    } catch {
      return false;
    }
  }
}
