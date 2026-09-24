import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './review.schema';
import { Restaurant, RestaurantDocument } from '../restaurants/restaurant.schema';
import { Order, OrderDocument, OrderStatus } from '../orders/order.schema';
import { Reservation, ReservationDocument, ReservationStatus } from '../reservations/reservation.schema';
import { User, UserDocument } from '../users/user.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.schema';
import { AccessControlService } from '../../common/services/access-control.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notifications: NotificationsService,
    private access: AccessControlService,
  ) {}

  /** Customers can review once per completed order or dining reservation. */
  async create(customerId: string, data: any) {
    const rating = Number(data?.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new BadRequestException('Choose a rating from 1 to 5');
    const comment = String(data?.comment || '').trim().slice(0, 1500) || null;

    let restaurantId: Types.ObjectId;
    const refs: { orderId?: Types.ObjectId; reservationId?: Types.ObjectId } = {};

    if (data.orderId) {
      const order = await this.orderModel.findOne({ _id: data.orderId, customerId });
      if (!order) throw new NotFoundException('Order not found');
      if (order.status !== OrderStatus.DELIVERED) throw new BadRequestException('You can review an order once it is complete');
      if (order.reviewed) throw new BadRequestException('You already reviewed this order');
      restaurantId = order.restaurantId;
      refs.orderId = order._id;
    } else if (data.reservationId) {
      const r = await this.reservationModel.findOne({ _id: data.reservationId, customerId });
      if (!r) throw new NotFoundException('Booking not found');
      if (r.status !== ReservationStatus.COMPLETED) throw new BadRequestException('You can review a booking once your visit is complete');
      if (await this.reviewModel.exists({ reservationId: r._id })) throw new BadRequestException('You already reviewed this visit');
      restaurantId = r.restaurantId;
      refs.reservationId = r._id;
    } else {
      throw new BadRequestException('Choose an order or booking to review');
    }

    const customer = await this.userModel.findById(customerId).select('fullName');
    const review = await this.reviewModel.create(<any>{
      ...refs,
      customerId,
      customerName: customer?.fullName || 'Guest',
      restaurantId,
      rating,
      comment,
    });
    if (refs.orderId) await this.orderModel.updateOne({ _id: refs.orderId }, { reviewed: true });

    await this.syncRestaurantRating(restaurantId);
    const restaurant = await this.restaurantModel.findById(restaurantId).select('name ownerId');
    if (restaurant) {
      this.notifications
        .create(restaurant.ownerId.toString(), {
          title: 'New review',
          message: `${customer?.fullName || 'A guest'} left ${rating}★ on ${restaurant.name}.`,
          type: NotificationType.REVIEW,
          link: '/owner/reviews',
        })
        .catch(() => undefined);
    }
    return review;
  }

  /** Public: best recent reviews across the platform, for the landing page. */
  async featured(limit = 6) {
    const reviews = await this.reviewModel
      .find({ rating: { $gte: 4 }, comment: { $ne: null } })
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit * 3);
    const restaurants = await this.restaurantModel
      .find({ _id: { $in: reviews.map((r) => r.restaurantId) } })
      .select('name images city');
    const byId = new Map(restaurants.map((r) => [r._id.toString(), r]));
    return reviews
      .filter((r) => byId.has(r.restaurantId.toString()) && (r.comment?.length || 0) > 20)
      .slice(0, limit)
      .map((r) => ({
        _id: r._id,
        rating: r.rating,
        comment: r.comment,
        customerName: r.customerName,
        createdAt: (r as any).createdAt,
        restaurant: byId.get(r.restaurantId.toString()),
      }));
  }

  async findByRestaurant(restaurantId: string, query: any = {}) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
    const rid = new Types.ObjectId(restaurantId);
    const [reviews, total, dist] = await Promise.all([
      this.reviewModel.find({ restaurantId: rid }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.reviewModel.countDocuments({ restaurantId: rid }),
      this.reviewModel.aggregate([
        { $match: { restaurantId: rid } },
        { $group: { _id: '$rating', n: { $sum: 1 } } },
      ]),
    ]);
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    dist.forEach((d) => {
      distribution[d._id] = d.n;
      sum += d._id * d.n;
    });
    return {
      reviews,
      total,
      page,
      pages: Math.ceil(total / limit),
      avgRating: total ? Math.round((sum / total) * 10) / 10 : 0,
      distribution,
    };
  }

  async replyToReview(user: any, id: string, reply: string) {
    const text = String(reply || '').trim().slice(0, 1000);
    if (!text) throw new BadRequestException('Reply cannot be empty');
    const review = await this.reviewModel.findById(id);
    if (!review) throw new NotFoundException('Review not found');
    await this.access.assertRestaurantOwner(user, review.restaurantId.toString());
    const updated = await this.reviewModel.findByIdAndUpdate(id, { ownerReply: text, ownerRepliedAt: new Date() }, { returnDocument: 'after' });
    this.notifications
      .create(review.customerId.toString(), {
        title: 'The restaurant replied to your review',
        message: text.slice(0, 120),
        type: NotificationType.REVIEW,
        link: '/my-orders',
      })
      .catch(() => undefined);
    return updated;
  }

  async delete(userId: string, id: string) {
    const review = await this.reviewModel.findById(id);
    if (!review) throw new NotFoundException('Review not found');
    if (review.customerId.toString() !== userId) throw new ForbiddenException('You can only delete your own reviews');
    await this.reviewModel.findByIdAndDelete(id);
    if (review.orderId) await this.orderModel.updateOne({ _id: review.orderId }, { reviewed: false });
    await this.syncRestaurantRating(review.restaurantId);
    return { message: 'Review deleted' };
  }

  private async syncRestaurantRating(restaurantId: Types.ObjectId) {
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
