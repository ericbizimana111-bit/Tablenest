import { Injectable, NotFoundException } from '@nestjs/common';
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
REVIEWS_EOF

cat > /home/claude / tablenest / backend / src / modules / reviews / reviews.controller.ts << 'RC_EOF'
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
    constructor(private reviewsService: ReviewsService) { }

    @Get('restaurant/:restaurantId')
    findByRestaurant(@Param('restaurantId') restaurantId: string, @Query() query: any) {
        return this.reviewsService.findByRestaurant(restaurantId, query);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Request() req, @Body() data: any) {
        return this.reviewsService.create(req.user._id.toString(), data);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/reply')
    reply(@Param('id') id: string, @Body() body: { reply: string }) {
        return this.reviewsService.replyToReview(id, body.reply);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.reviewsService.delete(id);
    }
}
RC_EOF

cat > /home/claude / tablenest / backend / src / modules / reviews / reviews.module.ts << 'RM_EOF'
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review, ReviewSchema } from './review.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }])],
    controllers: [ReviewsController],
    providers: [ReviewsService],
    exports: [ReviewsService],
})
export class ReviewsModule { }