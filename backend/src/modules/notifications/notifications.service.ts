import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './notification.schema';

@Injectable()
export class NotificationsService {
  constructor(@InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>) {}

  create(userId: string, data: { title: string; message: string; type: NotificationType; link?: string; metadata?: Record<string, unknown> }) {
    return this.notificationModel.create({ userId: new Types.ObjectId(userId), ...data });
  }

  async findByUser(userId: string, query: { type?: string; page?: number; limit?: number }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
    if (query.type && query.type !== 'all') filter.type = query.type;
    const [notifications, total, unread] = await Promise.all([
      this.notificationModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.notificationModel.countDocuments(filter),
      this.notificationModel.countDocuments({ userId: filter.userId, isRead: false }),
    ]);
    return { notifications, total, unread, page, pages: Math.ceil(total / limit) };
  }

  async markReadForUser(userId: string, id: string) {
    const n = await this.notificationModel.findOneAndUpdate({ _id: id, userId }, { isRead: true }, { returnDocument: 'after' });
    if (!n) throw new NotFoundException('Notification not found');
    return n;
  }

  async markAllRead(userId: string) {
    await this.notificationModel.updateMany({ userId, isRead: false }, { isRead: true });
    return { message: 'All notifications marked as read' };
  }

  async clearAll(userId: string) {
    await this.notificationModel.deleteMany({ userId });
    return { message: 'All notifications cleared' };
  }

  async getUnreadCount(userId: string) {
    return { count: await this.notificationModel.countDocuments({ userId, isRead: false }) };
  }
}
