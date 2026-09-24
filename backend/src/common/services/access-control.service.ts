import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Restaurant, RestaurantDocument } from '../../modules/restaurants/restaurant.schema';
import { UserRole } from '../../modules/users/user.schema';

export type Actor = {
  _id: { toString(): string };
  role: UserRole;
  restaurantId?: { toString(): string } | null;
};

/**
 * Resource-level authorization. Role guards say *who may call* an endpoint; this service says
 * *which records* they may touch. Admins pass every restaurant check; owners only their own.
 */
@Injectable()
export class AccessControlService {
  constructor(@InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>) {}

  isAdmin(user: Actor) {
    return user.role === UserRole.ADMIN;
  }

  /** Throws unless `user` is the owner of `restaurantId` (or an admin). Returns the restaurant. */
  async assertRestaurantOwner(user: Actor, restaurantId: string): Promise<RestaurantDocument> {
    if (user.role !== UserRole.OWNER && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Restaurant owner access required');
    }
    if (!isValidObjectId(restaurantId)) throw new NotFoundException('Restaurant not found');
    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (user.role === UserRole.OWNER && restaurant.ownerId.toString() !== user._id.toString()) {
      throw new ForbiddenException('You do not manage this restaurant');
    }
    return restaurant;
  }

  /** Non-throwing variant for read endpoints that combine several access paths. */
  async managesRestaurant(user: Actor, restaurantId: string) {
    if (user.role === UserRole.ADMIN) return true;
    if (user.role !== UserRole.OWNER) return false;
    return !!(await this.restaurantModel.exists({ _id: restaurantId, ownerId: user._id }));
  }

  /** The restaurant an owner manages. Always resolved from the database, never from client input. */
  async getOwnerRestaurantId(user: Actor): Promise<string> {
    if (user.role !== UserRole.OWNER) throw new ForbiddenException('Restaurant owner access required');
    const restaurant = await this.restaurantModel.findOne({ ownerId: user._id }).select('_id');
    if (!restaurant) throw new NotFoundException('Create your restaurant profile first');
    return restaurant._id.toString();
  }
}
