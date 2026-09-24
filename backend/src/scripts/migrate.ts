/**
 * Brings an existing database up to the current schema. Non-destructive and safe to run repeatedly:
 * it only adds fields, lock records and indexes, and REPORTS (never deletes) conflicting data.
 *
 *   npm run migrate
 */
import 'reflect-metadata';
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { UserSchema } from '../modules/users/user.schema';
import { RestaurantSchema } from '../modules/restaurants/restaurant.schema';
import { MenuItemSchema, MenuCategorySchema } from '../modules/menu/menu.schema';
import { TableSchema } from '../modules/tables/table.schema';
import { ReservationSchema, ReservationSlotSchema, ACTIVE_RESERVATION_STATUSES } from '../modules/reservations/reservation.schema';
import { OrderSchema } from '../modules/orders/order.schema';
import { PaymentSchema } from '../modules/payments/payment.schema';
import { ReviewSchema } from '../modules/reviews/review.schema';
import { NotificationSchema } from '../modules/notifications/notification.schema';
import { UploadSchema } from '../modules/uploads/upload.schema';
import { PlatformChargeSchema } from '../modules/billing/platform-charge.schema';
import { PlatformSettingsSchema } from '../modules/settings/platform-settings.schema';
import { AuditLogSchema } from '../common/audit/audit-log.schema';
import { SAFE_KEY } from '../modules/uploads/storage/storage.driver';
import { detectImage } from '../modules/uploads/image-signature';
import { slotsFor } from '../modules/reservations/slot-lock.service';
import { toMinutes } from '../common/utils/time';

dotenv.config();
const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tablenest';
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'));
const warnings: string[] = [];

async function run() {
  await mongoose.connect(URI);
  const M = {
    User: mongoose.model('User', UserSchema),
    Restaurant: mongoose.model('Restaurant', RestaurantSchema),
    MenuItem: mongoose.model('MenuItem', MenuItemSchema),
    MenuCategory: mongoose.model('MenuCategory', MenuCategorySchema),
    Table: mongoose.model('Table', TableSchema),
    Reservation: mongoose.model('Reservation', ReservationSchema),
    ReservationSlot: mongoose.model('ReservationSlot', ReservationSlotSchema),
    Order: mongoose.model('Order', OrderSchema),
    Payment: mongoose.model('Payment', PaymentSchema),
    Review: mongoose.model('Review', ReviewSchema),
    Notification: mongoose.model('Notification', NotificationSchema),
    Upload: mongoose.model('Upload', UploadSchema),
    PlatformCharge: mongoose.model('PlatformCharge', PlatformChargeSchema),
    PlatformSettings: mongoose.model('PlatformSettings', PlatformSettingsSchema),
    AuditLog: mongoose.model('AuditLog', AuditLogSchema),
  };

  // 1. Field backfills / removal of fields the app no longer uses.
  const users = await M.User.collection.updateMany({}, { $unset: { activePlan: '', refreshToken: '', emailVerified: '' } });
  await M.User.collection.updateMany({ tokenVersion: { $exists: false } }, { $set: { tokenVersion: 0, failedLoginAttempts: 0 } });
  const rest = await M.Restaurant.collection.updateMany({ plan: { $exists: false } }, { $set: { plan: 'starter' } });
  await M.PlatformSettings.findOneAndUpdate({ key: 'platform' }, { $setOnInsert: { key: 'platform' } }, { upsert: true, setDefaultsOnInsert: true });
  console.log(`✓ fields: users cleaned=${users.modifiedCount}, restaurants given a plan=${rest.modifiedCount}`);

  // 2. Report data that would violate new unique rules (never auto-deleted).
  const dupOwners = await M.Restaurant.aggregate([{ $group: { _id: '$ownerId', n: { $sum: 1 } } }, { $match: { n: { $gt: 1 } } }]);
  dupOwners.forEach((d) => warnings.push(`owner ${String(d._id)} has ${d.n} restaurants (one allowed) — resolve manually`));
  const dupTables = await M.Table.aggregate([{ $group: { _id: { r: '$restaurantId', t: '$tableNumber' }, n: { $sum: 1 } } }, { $match: { n: { $gt: 1 } } }]);
  dupTables.forEach((d) => warnings.push(`restaurant ${String(d._id.r)} has duplicate table number "${d._id.t}"`));

  // 3. Slot locks for existing active, current/future reservations.
  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z');
  const active = await M.Reservation.find({ status: { $in: ACTIVE_RESERVATION_STATUSES }, date: { $gte: today } });
  let locked = 0;
  for (const r of active) {
    if (await M.ReservationSlot.exists({ reservationIds: r._id })) continue;
    const key = { restaurantId: r.restaurantId, date: r.date };
    const start = Math.floor(toMinutes(r.time) / 30) * 30;
    try {
      for (const slot of slotsFor(start)) {
        if (r.tableId) {
          await M.ReservationSlot.create({ ...key, slot, tableId: r.tableId, seats: r.guests, reservationIds: [r._id] });
        } else {
          await M.ReservationSlot.updateOne({ ...key, slot, tableId: null }, { $inc: { seats: r.guests }, $push: { reservationIds: r._id } }, { upsert: true });
        }
      }
      locked++;
    } catch (err) {
      warnings.push(`reservation ${r.bookingRef || r._id.toString()} overlaps another booking on the same table (${(err as Error).message.slice(0, 60)})`);
    }
  }
  console.log(`✓ slot locks: ${locked} of ${active.length} upcoming reservations locked`);

  // 4. Register legacy uploaded images that records already reference.
  const owners = new Map<string, mongoose.Types.ObjectId>();
  const refs: Array<[string, mongoose.Types.ObjectId]> = [];
  for (const r of await M.Restaurant.find().select('ownerId logo images')) {
    owners.set(r._id.toString(), r.ownerId);
    for (const u of [r.logo, ...(r.images || [])]) if (u) refs.push([u, r.ownerId]);
  }
  for (const i of await M.MenuItem.find({ image: { $ne: null } }).select('image restaurantId')) {
    const o = owners.get(i.restaurantId.toString());
    if (o && i.image) refs.push([i.image, o]);
  }
  for (const u of await M.User.find({ avatar: { $ne: null } }).select('avatar')) if (u.avatar) refs.push([u.avatar, u._id]);

  let registered = 0;
  for (const [url, ownerId] of refs) {
    const m = /^\/uploads\/([^/]+)$/.exec(url);
    if (!m || (await M.Upload.exists({ url }))) continue;
    const key = m[1];
    const file = path.join(UPLOAD_DIR, key);
    if (!SAFE_KEY.test(key) || !fs.existsSync(file)) {
      warnings.push(`image ${url} is referenced but ${fs.existsSync(file) ? 'has an unsafe name' : 'missing on disk'}`);
      continue;
    }
    const buf = fs.readFileSync(file);
    const img = detectImage(buf);
    if (!img) {
      warnings.push(`file ${key} is referenced but is not a valid image — not served`);
      continue;
    }
    await M.Upload.create({ ownerId, key, url, mimetype: img.mimetype, size: buf.length, originalName: key, driver: 'local' });
    registered++;
  }
  console.log(`✓ uploads: registered ${registered} existing image(s)`);

  // 5. Build indexes (adds only; never drops existing indexes).
  for (const [name, model] of Object.entries(M)) {
    try {
      await model.createIndexes();
    } catch (err) {
      warnings.push(`index on ${name}: ${(err as Error).message.slice(0, 160)}`);
    }
  }
  console.log('✓ indexes ensured');

  await mongoose.disconnect();
  if (warnings.length) {
    console.log(`\n⚠ ${warnings.length} item(s) need attention:`);
    warnings.forEach((w) => console.log('  - ' + w));
  }
  console.log('Done.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
