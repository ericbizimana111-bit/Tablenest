import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from './user.schema';
import { Restaurant, RestaurantDocument, RestaurantStatus } from '../restaurants/restaurant.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
  ) {}

  async findAll(query: any = {}) {
    const { page = 1, limit = 20, role, search, isActive } = query;
    const filter: any = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel.find(filter).select('-password').skip(skip).limit(+limit).sort({ createdAt: -1 }),
      this.userModel.countDocuments(filter),
    ]);
    return { users, total, page: +page, pages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: any) {
    const allowed = ['fullName', 'phone', 'avatar', 'address', 'activePlan'];
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
    return this.userModel.findByIdAndUpdate(
      userId,
      { $set: { notificationPrefs: prefs } },
      { returnDocument: 'after' },
    ).select('-password');
  }

  async suspend(id: string) {
    return this.userModel.findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' }).select('-password');
  }

  async activate(id: string) {
    return this.userModel.findByIdAndUpdate(id, { isActive: true }, { returnDocument: 'after' }).select('-password');
  }

  async deleteAccount(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { isActive: false });
    return { message: 'Account deactivated' };
  }

  async getStats() {
    const [total, customers, owners, active] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ role: UserRole.CUSTOMER }),
      this.userModel.countDocuments({ role: UserRole.OWNER }),
      this.userModel.countDocuments({ isActive: true }),
    ]);
    return { total, customers, owners, active };
  }

  async getFavorites(userId: string) {
    const user = await this.userModel.findById(userId).select('favoriteRestaurantIds');
    if (!user) throw new NotFoundException('User not found');
    const restaurants = await this.restaurantModel.find({
      _id: { $in: user.favoriteRestaurantIds || [] },
      status: RestaurantStatus.ACTIVE,
    });
    return { restaurants };
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
    if (address.isDefault) {
      addresses.forEach(a => { a.isDefault = false; });
    }
    addresses.push(address);

    await this.userModel.findByIdAndUpdate(userId, { addresses });
    return { addresses };
  }

  async updateAddress(userId: string, index: number, address: any) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (!user.addresses?.[index]) throw new NotFoundException('Address not found');

    const addresses = [...user.addresses];
    if (address.isDefault) {
      addresses.forEach(a => { a.isDefault = false; });
    }
    addresses[index] = { ...addresses[index], ...address };

    await this.userModel.findByIdAndUpdate(userId, { addresses });
    return { addresses };
  }

  async deleteAddress(userId: string, index: number) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (!user.addresses?.[index]) throw new NotFoundException('Address not found');

    const addresses = user.addresses.filter((_, i) => i !== index);
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
    if (method.isDefault) {
      paymentMethods.forEach(m => { m.isDefault = false; });
    }
    paymentMethods.push({
      brand: method.brand,
      last4: method.last4 || method.cardNumber?.slice(-4) || '0000',
      expiryMonth: method.expiryMonth,
      expiryYear: method.expiryYear,
      isDefault: method.isDefault || paymentMethods.length === 0,
    });

    await this.userModel.findByIdAndUpdate(userId, { paymentMethods });
    return { paymentMethods };
  }

  async deletePaymentMethod(userId: string, index: number) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (!user.paymentMethods?.[index]) throw new NotFoundException('Payment method not found');

    const paymentMethods = user.paymentMethods.filter((_, i) => i !== index);
    await this.userModel.findByIdAndUpdate(userId, { paymentMethods });
    return { paymentMethods };
  }
}
