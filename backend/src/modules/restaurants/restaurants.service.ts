import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant, RestaurantDocument, RestaurantStatus } from './restaurant.schema';

@Injectable()
export class RestaurantsService {
  constructor(@InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>) {}

  async findPublic(query: any = {}) {
    const { page = 1, limit = 20, search, cuisine, city, country, priceRange, sort } = query;
    const filter: any = { status: RestaurantStatus.ACTIVE };
    if (cuisine) filter.cuisineType = { $regex: cuisine, $options: 'i' };
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (country) filter.country = { $regex: country, $options: 'i' };
    if (priceRange) filter.priceRange = priceRange;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { cuisineType: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { country: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    let sortObj: any = { rating: -1 };
    if (sort === 'rating_asc') sortObj = { rating: 1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };
    else if (sort === 'name_asc') sortObj = { name: 1 };
    const skip = (page - 1) * limit;
    const [restaurants, total] = await Promise.all([
      this.restaurantModel.find(filter).skip(skip).limit(+limit).sort(sortObj),
      this.restaurantModel.countDocuments(filter),
    ]);
    return { restaurants, total, page: +page, pages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const restaurant = await this.restaurantModel.findById(id);
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return restaurant;
  }

  async findPublicById(id: string) {
    const restaurant = await this.restaurantModel.findOne({ _id: id, status: RestaurantStatus.ACTIVE });
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
    const allowed = ['name', 'description', 'cuisineType', 'address', 'city', 'country', 'phone', 'priceRange', 'seatingCapacity', 'dineIn', 'delivery', 'images', 'openingHours', 'logo'];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (data[key] !== undefined) update[key] = data[key];
    }
    return this.restaurantModel.findByIdAndUpdate(id, { $set: update }, { returnDocument: 'after' });
  }
}
