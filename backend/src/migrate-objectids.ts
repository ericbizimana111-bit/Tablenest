/**
 * One-off migration: earlier versions stored reference ids as plain strings.
 * This converts them to real ObjectIds so queries, joins and aggregations match.
 * Safe to run more than once. Usage: npm run migrate:ids
 */
import 'reflect-metadata';
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tablenest';
const HEX = /^[0-9a-fA-F]{24}$/;

const PLAN: Record<string, { scalar?: string[]; arrays?: string[]; itemsField?: string }> = {
  users: { scalar: ['restaurantId'], arrays: ['favoriteRestaurantIds'] },
  restaurants: { scalar: ['ownerId'] },
  menucategories: { scalar: ['restaurantId'] },
  menuitems: { scalar: ['restaurantId', 'categoryId'] },
  tables: { scalar: ['restaurantId', 'currentGuestId'] },
  reservations: { scalar: ['customerId', 'restaurantId', 'tableId'] },
  orders: { scalar: ['customerId', 'restaurantId', 'driverId', 'tableId'], itemsField: 'menuItemId' },
  reviews: { scalar: ['customerId', 'restaurantId', 'orderId', 'reservationId'] },
  notifications: { scalar: ['userId'] },
  loyalties: { scalar: ['userId'] },
  referrals: { scalar: ['userId'] },
  payments: { scalar: ['userId', 'orderId', 'reservationId'] },
  promotions: { scalar: ['restaurantId'] },
  inventoryitems: { scalar: ['restaurantId'] },
  staffs: { scalar: ['restaurantId', 'userId'] },
  supporttickets: { scalar: ['userId', 'assignedTo'] },
  messages: { scalar: ['conversationId', 'senderId'] },
  conversations: { scalar: ['restaurantId'], arrays: ['participants'] },
};

const toOid = (expr: unknown) => ({
  $cond: [
    { $and: [{ $eq: [{ $type: expr }, 'string'] }, { $regexMatch: { input: expr, regex: HEX } }] },
    { $toObjectId: expr },
    expr,
  ],
});

async function run() {
  const conn = await mongoose.connect(URI);
  const db = conn.connection.db!;
  const existing = new Set((await db.listCollections().toArray()).map((c) => c.name));

  for (const [name, plan] of Object.entries(PLAN)) {
    if (!existing.has(name)) continue;
    const set: Record<string, unknown> = {};
    for (const f of plan.scalar || []) set[f] = toOid(`$${f}`);
    for (const f of plan.arrays || []) {
      set[f] = { $map: { input: { $ifNull: [`$${f}`, []] }, as: 'v', in: toOid('$$v') } };
    }
    if (plan.itemsField) {
      set.items = {
        $map: {
          input: { $ifNull: ['$items', []] },
          as: 'it',
          in: { $mergeObjects: ['$$it', { [plan.itemsField]: toOid(`$$it.${plan.itemsField}`) }] },
        },
      };
    }
    const res = await db.collection(name).updateMany({}, [{ $set: set }]);
    console.log(`✓ ${name}: ${res.modifiedCount} documents updated`);
  }
  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
