import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './review.schema';
import { Restaurant, RestaurantDocument } from '../restaurants/restaurant.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
  ) {}

  async create(customerId: string, data: any) {
    const review = await this.reviewModel.create({ ...data, customerId });
    await this.syncRestaurantRating(data.restaurantId);
    return review;
  }

  async findByRestaurant(restaurantId: string, query: any = {}) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.reviewModel.find({ restaurantId }).skip(skip).limit(+limit).sort({ createdAt: -1 }),
      this.reviewModel.countDocuments({ restaurantId }),
    ]);
    const avg = await this.reviewModel.aggregate([
      { $match: { restaurantId } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    return { reviews, total, page: +page, pages: Math.ceil(total / limit), avgRating: avg[0]?.avg || 0 };
  }

  async replyToReview(id: string, reply: string) {
    return this.reviewModel.findByIdAndUpdate(id, { ownerReply: reply, ownerRepliedAt: new Date() }, { returnDocument: 'after' });
  }

  async delete(id: string) {
    const review = await this.reviewModel.findById(id);
    if (review) {
      await this.reviewModel.findByIdAndDelete(id);
      await this.syncRestaurantRating(review.restaurantId.toString());
    }
    return { message: 'Review deleted' };
  }

  private async syncRestaurantRating(restaurantId: string) {
    const stats = await this.reviewModel.aggregate([
      { $match: { restaurantId } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    await this.restaurantModel.findByIdAndUpdate(restaurantId, {
      rating: stats[0]?.avg ? Math.round(stats[0].avg * 10) / 10 : 0,
      totalReviews: stats[0]?.count || 0,
    });
  }
}
