/**
 * Grants (or revokes) platform-admin rights. Deliberately a server-side CLI: there is no HTTP
 * endpoint that can create an admin, so a compromised account cannot escalate itself.
 *
 *   npm run admin:grant -- someone@example.com
 *   npm run admin:grant -- someone@example.com --revoke
 */
import 'reflect-metadata';
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { UserRole, UserSchema } from '../modules/users/user.schema';
import { RestaurantSchema } from '../modules/restaurants/restaurant.schema';

dotenv.config();

async function run() {
  const email = process.argv.slice(2).find((a) => !a.startsWith('--'))?.toLowerCase();
  const revoke = process.argv.includes('--revoke');
  if (!email) throw new Error('Usage: npm run admin:grant -- <email> [--revoke]');

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tablenest');
  const User = mongoose.model('User', UserSchema);
  const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
  const user = await User.findOne({ email });
  if (!user) throw new Error(`No user with email ${email}. Register the account first.`);
  if (!revoke && (await Restaurant.exists({ ownerId: user._id }))) {
    throw new Error('This account owns a restaurant. Use a separate account for administration.');
  }
  // Changing role revokes existing sessions; the user signs in again with the new role.
  await User.updateOne({ _id: user._id }, { role: revoke ? UserRole.CUSTOMER : UserRole.ADMIN, $inc: { tokenVersion: 1 } });
  await mongoose.connection.collection('auditlogs').insertOne({
    actorId: null,
    actorRole: 'system',
    action: revoke ? 'admin.revoked' : 'admin.granted',
    targetType: 'user',
    targetId: user._id,
    meta: { via: 'cli' },
    createdAt: new Date(),
  });
  console.log(`${revoke ? 'Revoked admin from' : 'Granted admin to'} ${email}`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error((e as Error).message);
  process.exit(1);
});
