import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant, RestaurantDocument } from '../../modules/restaurants/restaurant.schema';
import { UserRole } from '../../modules/users/user.schema';

@Injectable()
export class AccessControlService {
  constructor(
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
  ) {}

  assertSuperAdmin(user: { role: UserRole }) {
    if (user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Super admin access required');
    }
  }

  assertOwner(user: { role: UserRole }) {
    if (user.role !== UserRole.OWNER) {
      throw new ForbiddenException('Restaurant owner access required');
    }
  }

  assertCustomer(user: { role: UserRole }) {
    if (user.role !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Customer access required');
    }
  }

  async assertRestaurantOwner(user: { _id: { toString(): string }; role: UserRole; restaurantId?: { toString(): string } }, restaurantId: string) {
    if (user.role === UserRole.SUPER_ADMIN) {
      return;
    }

    if (user.role !== UserRole.OWNER) {
      throw new ForbiddenException('Restaurant owner access required');
    }

    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (restaurant.ownerId.toString() !== user._id.toString()) {
      throw new ForbiddenException('You do not manage this restaurant');
    }
  }

  async getOwnerRestaurantId(user: { _id: { toString(): string }; role: UserRole; restaurantId?: { toString(): string } }): Promise<string> {
    if (user.restaurantId) {
      return user.restaurantId.toString();
    }

    const restaurant = await this.restaurantModel.findOne({ ownerId: user._id.toString() });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found for owner');
    }

    return restaurant._id.toString();
  }

  assertSelfOrAdmin(user: { _id: { toString(): string }; role: UserRole }, targetUserId: string) {
    if (user.role === UserRole.SUPER_ADMIN) {
      return;
    }

    if (user._id.toString() !== targetUserId) {
      throw new ForbiddenException('Access denied');
    }
  }
}
