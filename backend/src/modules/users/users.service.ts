import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { Restaurant, RestaurantDocument, RestaurantStatus } from '../restaurants/restaurant.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
  ) { }

  private cleanAddress(a: any) {
    const str = (v: unknown) => (typeof v === 'string' ? v.trim().slice(0, 200) : '');
    return {
      label: str(a?.label) || 'Home',
      street: str(a?.street),
      city: str(a?.city),
      state: str(a?.state),
      zip: str(a?.zip),
      isDefault: !!a?.isDefault,
    };
  }

  private detectBrand(digits: string, hint?: string) {
    if (/^4/.test(digits)) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
    if (/^3[47]/.test(digits)) return 'Amex';
    if (/^6/.test(digits)) return 'Discover';
    return hint || 'Card';
  }

  async updateProfile(userId: string, data: any) {
    const allowed = ['fullName', 'phone', 'avatar', 'address'];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (data[key] !== undefined) update[key] = data[key];
    }
    const updated = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: update },
      { returnDocument: 'after' },
    ).select('-password');
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async updateNotificationPrefs(userId: string, prefs: any) {
    const clean = {
      bookingConfirmation: !!prefs?.bookingConfirmation,
      marketing: !!prefs?.marketing,
      orderTracking: !!prefs?.orderTracking,
    };
    return this.userModel.findByIdAndUpdate(
      userId,
      { $set: { notificationPrefs: clean } },
      { returnDocument: 'after' },
    ).select('-password');
  }

  async deleteAccount(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { isActive: false });
    return { message: 'Account deactivated' };
  }

  async getFavorites(userId: string) {
    const user = await this.userModel.findById(userId).select('favoriteRestaurantIds');
    if (!user) throw new NotFoundException('User not found');
    const restaurants = await this.restaurantModel.find({
      _id: { $in: user.favoriteRestaurantIds || [] },
      status: RestaurantStatus.ACTIVE,
    });
    return { restaurants, ids: (user.favoriteRestaurantIds || []).map((i) => i.toString()) };
  }

  async addFavorite(userId: string, restaurantId: string) {
    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet: { favoriteRestaurantIds: new Types.ObjectId(restaurantId) },
    });
    return { message: 'Added to favorites' };
  }

  async removeFavorite(userId: string, restaurantId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { favoriteRestaurantIds: new Types.ObjectId(restaurantId) },
    });
    return { message: 'Removed from favorites' };
  }

  async getAddresses(userId: string) {
    const user = await this.userModel.findById(userId).select('addresses');
    if (!user) throw new NotFoundException('User not found');
    return { addresses: user.addresses || [] };
  }

  async addAddress(userId: string, address: any) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const addresses = [...(user.addresses || [])];
    const entry = this.cleanAddress(address);
    if (!entry.street) throw new BadRequestException('Street address is required');
    if (entry.isDefault || addresses.length === 0) {
      addresses.forEach(a => { a.isDefault = false; });
      entry.isDefault = true;
    }
    addresses.push(entry);

    await this.userModel.findByIdAndUpdate(userId, { addresses });
    return { addresses };
  }

  async updateAddress(userId: string, index: number, address: any) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (!user.addresses?.[index]) throw new NotFoundException('Address not found');

    const addresses = [...user.addresses];
    const entry = this.cleanAddress({ ...(addresses[index] as any).toObject?.() ?? addresses[index], ...address });
    if (entry.isDefault) {
      addresses.forEach(a => { a.isDefault = false; });
    }
    addresses[index] = entry;

    await this.userModel.findByIdAndUpdate(userId, { addresses });
    return { addresses };
  }

  async deleteAddress(userId: string, index: number) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (!user.addresses?.[index]) throw new NotFoundException('Address not found');

    const addresses = user.addresses.filter((_, i) => i !== index);
    if (addresses.length && !addresses.some(a => a.isDefault)) addresses[0].isDefault = true;
    await this.userModel.findByIdAndUpdate(userId, { addresses });
    return { addresses };
  }

  async getPaymentMethods(userId: string) {
    const user = await this.userModel.findById(userId).select('paymentMethods');
    if (!user) throw new NotFoundException('User not found');
    return { paymentMethods: user.paymentMethods || [] };
  }

  async addPaymentMethod(userId: string, method: any) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const paymentMethods = [...(user.paymentMethods || [])];
    const digits = String(method.cardNumber || method.last4 || '').replace(/\D/g, '');
    if (digits.length < 4) throw new BadRequestException('A valid card number is required');
    const expiryMonth = String(method.expiryMonth || '').padStart(2, '0');
    const expiryYear = String(method.expiryYear || '');
    if (!/^(0[1-9]|1[0-2])$/.test(expiryMonth) || !/^\d{2,4}$/.test(expiryYear)) {
      throw new BadRequestException('A valid expiry date is required');
    }
    if (method.isDefault || paymentMethods.length === 0) {
      paymentMethods.forEach(m => { m.isDefault = false; });
    }
    // Only non-sensitive metadata is stored — never the full number or CVV.
    paymentMethods.push({
      brand: this.detectBrand(digits, method.brand),
      last4: digits.slice(-4),
      expiryMonth,
      expiryYear,
      isDefault: !!method.isDefault || paymentMethods.length === 0,
    });

    await this.userModel.findByIdAndUpdate(userId, { paymentMethods });
    return { paymentMethods };
  }

  async deletePaymentMethod(userId: string, index: number) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (!user.paymentMethods?.[index]) throw new NotFoundException('Payment method not found');

    const paymentMethods = user.paymentMethods.filter((_, i) => i !== index);
    if (paymentMethods.length && !paymentMethods.some(m => m.isDefault)) paymentMethods[0].isDefault = true;
    await this.userModel.findByIdAndUpdate(userId, { paymentMethods });
    return { paymentMethods };
  }

  async setDefaultAddress(userId: string, index: number) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (!user.addresses?.[index]) throw new NotFoundException('Address not found');

    const addresses = user.addresses.map((a, i) => ({ ...(a as any).toObject?.() ?? a, isDefault: i === index }));
    await this.userModel.findByIdAndUpdate(userId, { addresses });
    return { addresses };
  }

  async setDefaultPaymentMethod(userId: string, index: number) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (!user.paymentMethods?.[index]) throw new NotFoundException('Payment method not found');

    const paymentMethods = user.paymentMethods.map((m, i) => ({ ...(m as any).toObject?.() ?? m, isDefault: i === index }));
    await this.userModel.findByIdAndUpdate(userId, { paymentMethods });
    return { paymentMethods };
  }
}
