import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from './user.schema';
import { Restaurant, RestaurantDocument, RestaurantStatus } from '../restaurants/restaurant.schema';
import { UploadsService } from '../uploads/uploads.service';
import type { Actor } from '../../common/services/access-control.service';
import { AddressDto, NotificationPrefsDto, PaymentMethodDto, UpdateAddressDto, UpdateProfileDto } from './users.dto';

const MAX_ADDRESSES = 10;
const MAX_CARDS = 10;

type Address = User['addresses'][number];
type Card = User['paymentMethods'][number];
const plain = <T>(v: T): T => ((v as { toObject?: () => T })?.toObject?.() ?? v);

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    private uploads: UploadsService,
  ) {}

  private async load(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(actor: Actor, dto: UpdateProfileDto) {
    const user = await this.load(actor._id.toString());
    if (dto.avatar !== undefined) await this.uploads.assertUsable(actor, [dto.avatar], [user.avatar]);
    const updated = await this.userModel.findByIdAndUpdate(user._id, { $set: dto }, { returnDocument: 'after' });
    if (dto.avatar !== undefined && user.avatar && user.avatar !== updated!.avatar) await this.uploads.releaseIfUnused([user.avatar]);
    return updated;
  }

  async updateNotificationPrefs(userId: string, dto: NotificationPrefsDto) {
    const user = await this.load(userId);
    const prefs = { ...(user.notificationPrefs || {}), ...dto };
    return this.userModel.findByIdAndUpdate(userId, { $set: { notificationPrefs: prefs } }, { returnDocument: 'after' });
  }

  /**
   * Deactivates the account and revokes its sessions. Data is kept for order/booking history.
   * An owner's restaurant is suspended so customers cannot order from an unattended restaurant.
   */
  async deactivate(userId: string) {
    const user = await this.userModel.findByIdAndUpdate(userId, { isActive: false, $inc: { tokenVersion: 1 } });
    if (user?.role === UserRole.OWNER) {
      await this.restaurantModel.updateOne({ ownerId: user._id }, { status: RestaurantStatus.SUSPENDED, acceptingOrders: false });
    }
    return { message: 'Account deactivated' };
  }

  // ── Favorites ─────────────────────────────────────────────────────────────
  async getFavorites(userId: string) {
    const user = await this.load(userId);
    const restaurants = await this.restaurantModel
      .find({ _id: { $in: user.favoriteRestaurantIds || [] }, status: RestaurantStatus.ACTIVE })
      .select('-commissionRate -plan -rejectionReason -sponsoredUntil');
    return { restaurants, ids: (user.favoriteRestaurantIds || []).map((i) => i.toString()) };
  }

  async addFavorite(userId: string, restaurantId: string) {
    if (!(await this.restaurantModel.exists({ _id: restaurantId, status: RestaurantStatus.ACTIVE }))) {
      throw new NotFoundException('Restaurant not found');
    }
    await this.userModel.updateOne({ _id: userId }, { $addToSet: { favoriteRestaurantIds: new Types.ObjectId(restaurantId) } });
    return { message: 'Added to favorites' };
  }

  async removeFavorite(userId: string, restaurantId: string) {
    await this.userModel.updateOne({ _id: userId }, { $pull: { favoriteRestaurantIds: new Types.ObjectId(restaurantId) } });
    return { message: 'Removed from favorites' };
  }

  // ── Addresses ─────────────────────────────────────────────────────────────
  async getAddresses(userId: string) {
    return { addresses: (await this.load(userId)).addresses || [] };
  }

  private static address(a: Partial<Address> & { street: string }): Address {
    return { label: a.label || 'Home', street: a.street, city: a.city || '', state: a.state || '', zip: a.zip || '', isDefault: !!a.isDefault };
  }

  private async saveAddresses(userId: string, addresses: Address[]) {
    if (addresses.length && !addresses.some((a) => a.isDefault)) addresses[0].isDefault = true;
    await this.userModel.updateOne({ _id: userId }, { addresses });
    return { addresses };
  }

  async addAddress(userId: string, dto: AddressDto) {
    const user = await this.load(userId);
    const addresses = (user.addresses || []).map(plain);
    if (addresses.length >= MAX_ADDRESSES) throw new BadRequestException(`You can save at most ${MAX_ADDRESSES} addresses`);
    const entry = UsersService.address(dto as Address);
    if (entry.isDefault) addresses.forEach((a) => (a.isDefault = false));
    addresses.push(entry);
    return this.saveAddresses(userId, addresses);
  }

  async updateAddress(userId: string, index: number, dto: UpdateAddressDto) {
    const user = await this.load(userId);
    const addresses = (user.addresses || []).map(plain);
    if (!addresses[index]) throw new NotFoundException('Address not found');
    const entry = UsersService.address({ ...addresses[index], ...dto } as Address);
    if (entry.isDefault) addresses.forEach((a) => (a.isDefault = false));
    addresses[index] = entry;
    return this.saveAddresses(userId, addresses);
  }

  async deleteAddress(userId: string, index: number) {
    const user = await this.load(userId);
    if (!user.addresses?.[index]) throw new NotFoundException('Address not found');
    return this.saveAddresses(userId, user.addresses.map(plain).filter((_, i) => i !== index));
  }

  async setDefaultAddress(userId: string, index: number) {
    const user = await this.load(userId);
    if (!user.addresses?.[index]) throw new NotFoundException('Address not found');
    return this.saveAddresses(userId, user.addresses.map(plain).map((a, i) => ({ ...a, isDefault: i === index })));
  }

  // ── Saved cards (display metadata only) ──────────────────────────────────
  async getPaymentMethods(userId: string) {
    return { paymentMethods: (await this.load(userId)).paymentMethods || [] };
  }

  private async saveCards(userId: string, cards: Card[]) {
    if (cards.length && !cards.some((c) => c.isDefault)) cards[0].isDefault = true;
    await this.userModel.updateOne({ _id: userId }, { paymentMethods: cards });
    return { paymentMethods: cards };
  }

  async addPaymentMethod(userId: string, dto: PaymentMethodDto) {
    const user = await this.load(userId);
    const cards = (user.paymentMethods || []).map(plain);
    if (cards.length >= MAX_CARDS) throw new BadRequestException(`You can save at most ${MAX_CARDS} cards`);
    if (dto.isDefault) cards.forEach((c) => (c.isDefault = false));
    cards.push({
      brand: dto.brand || 'Card',
      last4: dto.last4,
      expiryMonth: dto.expiryMonth.padStart(2, '0'),
      expiryYear: dto.expiryYear,
      isDefault: !!dto.isDefault,
    });
    return this.saveCards(userId, cards);
  }

  async deletePaymentMethod(userId: string, index: number) {
    const user = await this.load(userId);
    if (!user.paymentMethods?.[index]) throw new NotFoundException('Payment method not found');
    return this.saveCards(userId, user.paymentMethods.map(plain).filter((_, i) => i !== index));
  }

  async setDefaultPaymentMethod(userId: string, index: number) {
    const user = await this.load(userId);
    if (!user.paymentMethods?.[index]) throw new NotFoundException('Payment method not found');
    return this.saveCards(userId, user.paymentMethods.map(plain).map((c, i) => ({ ...c, isDefault: i === index })));
  }
}
