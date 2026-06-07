import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant, RestaurantDocument, RestaurantStatus } from './restaurant.schema';

@Injectable()
export class RestaurantsService {
  constructor(@InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>) {}

  async findAll(query: any = {}) {
    const { page = 1, limit = 20, status, search, cuisine, city } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (cuisine) filter.cuisineType = { $regex: cuisine, $options: 'i' };
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { cuisineType: { $regex: search, $options: 'i' } },
    ];
    const skip = (page - 1) * limit;
    const [restaurants, total] = await Promise.all([
      this.restaurantModel.find(filter).skip(skip).limit(+limit).sort({ createdAt: -1 }),
      this.restaurantModel.countDocuments(filter),
    ]);
    return { restaurants, total, page: +page, pages: Math.ceil(total / limit) };
  }

  async findPublic(query: any = {}) {
    const { page = 1, limit = 20, search, cuisine, city } = query;
    const filter: any = { status: RestaurantStatus.ACTIVE };
    if (cuisine) filter.cuisineType = { $regex: cuisine, $options: 'i' };
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { cuisineType: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    const skip = (page - 1) * limit;
    const [restaurants, total] = await Promise.all([
      this.restaurantModel.find(filter).skip(skip).limit(+limit).sort({ rating: -1 }),
      this.restaurantModel.countDocuments(filter),
    ]);
    return { restaurants, total, page: +page, pages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const restaurant = await this.restaurantModel.findById(id);
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return restaurant;
  }

  async findByOwner(ownerId: string) {
    return this.restaurantModel.findOne({ ownerId });
  }

  async create(ownerId: string, data: any) {
    return this.restaurantModel.create({ ...data, ownerId, status: RestaurantStatus.PENDING });
  }

  async update(id: string, ownerId: string, data: any) {
    const restaurant = await this.restaurantModel.findById(id);
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.ownerId.toString() !== ownerId) throw new ForbiddenException();
    return this.restaurantModel.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after' });
  }

  async approve(id: string) {
    return this.restaurantModel.findByIdAndUpdate(
      id,
      { status: RestaurantStatus.ACTIVE, approvedAt: new Date() },
      { returnDocument: 'after' },
    );
  }

  async reject(id: string, reason: string) {
    return this.restaurantModel.findByIdAndUpdate(
      id,
      { status: RestaurantStatus.REJECTED, rejectionReason: reason },
      { returnDocument: 'after' },
    );
  }

  async suspend(id: string) {
    return this.restaurantModel.findByIdAndUpdate(
      id,
      { status: RestaurantStatus.SUSPENDED },
      { returnDocument: 'after' },
    );
  }

  async getPendingApprovals() {
    return this.restaurantModel.find({ status: RestaurantStatus.PENDING }).sort({ createdAt: -1 });
  }

  async getStats() {
    const [total, active, pending, suspended] = await Promise.all([
      this.restaurantModel.countDocuments(),
      this.restaurantModel.countDocuments({ status: RestaurantStatus.ACTIVE }),
      this.restaurantModel.countDocuments({ status: RestaurantStatus.PENDING }),
      this.restaurantModel.countDocuments({ status: RestaurantStatus.SUSPENDED }),
    ]);
    return { total, active, pending, suspended };
  }
}
