import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './notification.schema';

@Injectable()
export class NotificationsService {
  constructor(@InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>) {}

  async create(userId: string, data: { title: string; message: string; type: NotificationType; link?: string; metadata?: any }) {
    return this.notificationModel.create({ userId, ...data });
  }

  async findByUser(userId: string, query: any = {}) {
    const { type, page = 1, limit = 20 } = query;
    const filter: any = { userId };
    if (type && type !== 'all') filter.type = type;
    const skip = (page - 1) * limit;
    const [notifications, total, unread] = await Promise.all([
      this.notificationModel.find(filter).skip(skip).limit(+limit).sort({ createdAt: -1 }),
      this.notificationModel.countDocuments(filter),
      this.notificationModel.countDocuments({ userId, isRead: false }),
    ]);
    return { notifications, total, unread, page: +page, pages: Math.ceil(total / limit) };
  }

  async markRead(id: string) {
    return this.notificationModel.findByIdAndUpdate(id, { isRead: true }, { returnDocument: 'after' });
  }

  async markReadForUser(userId: string, id: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { returnDocument: 'after' },
    );
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
    const count = await this.notificationModel.countDocuments({ userId, isRead: false });
    return { count };
  }
}
