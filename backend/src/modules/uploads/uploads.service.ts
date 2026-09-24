import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { randomUUID } from 'crypto';
import { Upload, UploadDocument } from './upload.schema';
import { STORAGE_DRIVER, StorageDriver } from './storage/storage.driver';
import { detectImage } from './image-signature';
import { Restaurant, RestaurantDocument } from '../restaurants/restaurant.schema';
import { MenuItem, MenuItemDocument } from '../menu/menu.schema';
import { User, UserDocument, UserRole } from '../users/user.schema';
import { AuditService } from '../../common/audit/audit.service';
import type { Actor } from '../../common/services/access-control.service';

export interface UploadResult {
  id: string;
  url: string;
  filename: string;
  originalName: string | null;
  mimetype: string;
  size: number;
}

export const MAX_FILES_PER_REQUEST = 10;

@Injectable()
export class UploadsService {
  private readonly logger = new Logger('Uploads');

  constructor(
    @InjectModel(Upload.name) private uploadModel: Model<UploadDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(STORAGE_DRIVER) private storage: StorageDriver,
    private audit: AuditService,
  ) {}

  private toResult(doc: UploadDocument): UploadResult {
    return {
      id: doc._id.toString(),
      url: doc.url,
      filename: doc.key,
      originalName: doc.originalName,
      mimetype: doc.mimetype,
      size: doc.size,
    };
  }

  /** Validates by content, stores under a server-generated name, and records ownership. */
  async storeImage(user: Actor, file: Express.Multer.File | undefined): Promise<UploadResult> {
    if (!file || !file.buffer?.length) throw new BadRequestException('No file provided');

    const detected = detectImage(file.buffer);
    if (!detected) {
      this.logger.warn(`upload.rejected reason=not_an_image uid=${user._id.toString()} claimed=${file.mimetype}`);
      throw new UnsupportedMediaTypeException('Only JPEG, PNG, WebP or GIF images are allowed');
    }

    const key = `${randomUUID()}.${detected.ext}`;
    const { url } = await this.storage.put(key, file.buffer, detected.mimetype);
    try {
      const doc = await this.uploadModel.create({
        ownerId: new Types.ObjectId(user._id.toString()),
        key,
        url,
        mimetype: detected.mimetype,
        size: file.buffer.length,
        originalName: (file.originalname || '').replace(/[^\w.\- ]/g, '').slice(0, 120) || null,
        driver: this.storage.name,
      });
      return this.toResult(doc);
    } catch (err) {
      // Never leave an orphaned file behind when the record could not be written.
      await this.storage.delete(key).catch(() => undefined);
      this.logger.error(`upload.failed uid=${user._id.toString()} ${(err as Error).message}`);
      throw err;
    }
  }

  async storeImages(user: Actor, files: Express.Multer.File[] | undefined) {
    if (!files?.length) throw new BadRequestException('No files provided');
    if (files.length > MAX_FILES_PER_REQUEST) throw new BadRequestException(`Upload at most ${MAX_FILES_PER_REQUEST} files at once`);
    // Validate every file before storing any, so a bad file does not leave a partial batch.
    for (const f of files) {
      if (!f.buffer?.length || !detectImage(f.buffer)) {
        throw new UnsupportedMediaTypeException(`"${f.originalname}" is not a JPEG, PNG, WebP or GIF image`);
      }
    }
    const results: UploadResult[] = [];
    try {
      for (const f of files) results.push(await this.storeImage(user, f));
    } catch (err) {
      await Promise.all(results.map((r) => this.remove(r.id).catch(() => undefined)));
      throw err;
    }
    return results;
  }

  async listMine(user: Actor, page: number, limit: number) {
    const filter = { ownerId: user._id };
    const [items, total] = await Promise.all([
      this.uploadModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.uploadModel.countDocuments(filter),
    ]);
    return { uploads: items.map((d) => this.toResult(d)), total, page, pages: Math.ceil(total / limit) };
  }

  private findDoc(idOrKey: string) {
    return isValidObjectId(idOrKey) ? this.uploadModel.findById(idOrKey) : this.uploadModel.findOne({ key: idOrKey });
  }

  /** Live records that display this file. */
  async usage(url: string) {
    const [restaurants, menuItems, users] = await Promise.all([
      this.restaurantModel.find({ $or: [{ logo: url }, { images: url }] }).select('_id name'),
      this.menuItemModel.find({ image: url }).select('_id name restaurantId'),
      this.userModel.find({ avatar: url }).select('_id'),
    ]);
    return { restaurants, menuItems, users, count: restaurants.length + menuItems.length + users.length };
  }

  /**
   * Deletes a file. Only its uploader or an admin may do so. A file still shown somewhere is
   * refused (409) so no page ends up with a broken image — unless an admin forces it, in which
   * case every reference is detached first.
   */
  async delete(user: Actor, idOrKey: string, force = false) {
    const doc = await this.findDoc(idOrKey);
    if (!doc) throw new NotFoundException('File not found');
    const isAdmin = user.role === UserRole.ADMIN;
    if (!isAdmin && doc.ownerId.toString() !== user._id.toString()) {
      throw new ForbiddenException('You can only delete files you uploaded');
    }

    const used = await this.usage(doc.url);
    if (used.count > 0) {
      if (!(isAdmin && force)) throw new ConflictException('This image is still in use. Remove it from your menu, restaurant or profile first.');
      await Promise.all([
        this.restaurantModel.updateMany({ logo: doc.url }, { logo: null }),
        this.restaurantModel.updateMany({ images: doc.url }, { $pull: { images: doc.url } }),
        this.menuItemModel.updateMany({ image: doc.url }, { image: null }),
        this.userModel.updateMany({ avatar: doc.url }, { avatar: null }),
      ]);
    }

    await this.remove(doc._id.toString());
    if (isAdmin) await this.audit.record(user, 'admin.upload_deleted', { type: 'upload', id: doc._id }, { url: doc.url, detached: used.count });
    return { deleted: true };
  }

  private async remove(id: string) {
    const doc = await this.uploadModel.findByIdAndDelete(id);
    if (doc) await this.storage.delete(doc.key);
  }

  /**
   * Ensures every newly referenced image URL is a file the actor uploaded (admins: any tracked
   * file). URLs already on the record (`current`) are accepted unchanged, so legacy values stay valid.
   */
  async assertUsable(user: Actor, urls: Array<string | null | undefined>, current: Array<string | null | undefined> = []) {
    const known = new Set(current.filter(Boolean));
    const fresh = [...new Set(urls.filter((u): u is string => !!u && !known.has(u)))];
    if (!fresh.length) return;
    const docs = await this.uploadModel.find({ url: { $in: fresh } }).select('url ownerId');
    const byUrl = new Map(docs.map((d) => [d.url, d]));
    for (const url of fresh) {
      const doc = byUrl.get(url);
      if (!doc) throw new BadRequestException('Images must be uploaded with POST /api/uploads/image first');
      if (user.role !== UserRole.ADMIN && doc.ownerId.toString() !== user._id.toString()) {
        throw new ForbiddenException('You can only use images you uploaded');
      }
    }
  }

  /** After a record drops an image, delete the file if nothing else shows it. Best effort. */
  async releaseIfUnused(urls: Array<string | null | undefined>) {
    for (const url of new Set(urls.filter((u): u is string => !!u))) {
      try {
        const doc = await this.uploadModel.findOne({ url });
        if (!doc) continue;
        if ((await this.usage(url)).count === 0) await this.remove(doc._id.toString());
      } catch (err) {
        this.logger.warn(`upload.cleanup_failed url=${url} ${(err as Error).message}`);
      }
    }
  }
}
