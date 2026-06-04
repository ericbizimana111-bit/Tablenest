import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './review.schema';

@Injectable()
export class ReviewsService {
    constructor(@InjectModel(Review.name) private reviewModel: Model<ReviewDocument>) { }

    async create(customerId: string, data: any) {
        return this.reviewModel.create({ ...data, customerId });
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
        return this.reviewModel.findByIdAndUpdate(id, { ownerReply: reply, ownerRepliedAt: new Date() }, { new: true });
    }

    async delete(id: string) {
        await this.reviewModel.findByIdAndDelete(id);
        return { message: 'Review deleted' };
    }
}
