import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(query: any = {}) {
    const { page = 1, limit = 20, role, search, isActive } = query;
    const filter: any = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel.find(filter).select('-password').skip(skip).limit(+limit).sort({ createdAt: -1 }),
      this.userModel.countDocuments(filter),
    ]);
    return { users, total, page: +page, pages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: any) {
    const updated = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true },
    ).select('-password');
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async updateNotificationPrefs(userId: string, prefs: any) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $set: { notificationPrefs: prefs } },
      { new: true },
    ).select('-password');
  }

  async suspend(id: string) {
    return this.userModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).select('-password');
  }

  async activate(id: string) {
    return this.userModel.findByIdAndUpdate(id, { isActive: true }, { new: true }).select('-password');
  }

  async deleteAccount(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { isActive: false });
    return { message: 'Account deactivated' };
  }

  async getStats() {
    const [total, customers, owners, active] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ role: UserRole.CUSTOMER }),
      this.userModel.countDocuments({ role: UserRole.OWNER }),
      this.userModel.countDocuments({ isActive: true }),
    ]);
    return { total, customers, owners, active };
  }
}
