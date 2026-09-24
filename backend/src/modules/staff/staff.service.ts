import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Staff, StaffDocument } from './staff.schema';
import { AccessControlService } from '../../common/services/access-control.service';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name) private staffModel: Model<StaffDocument>,
    private access: AccessControlService,
  ) {}

  private async owned(user: any, id: string) {
    const doc = await this.staffModel.findById(id);
    if (!doc) throw new NotFoundException('Staff member not found');
    await this.access.assertRestaurantOwner(user, doc.restaurantId.toString());
    return doc;
  }

  private clean(data: any, partial = false) {
    const out: Record<string, unknown> = {};
    if (!partial || data.name !== undefined) {
      const name = String(data.name || '').trim();
      if (!name) throw new BadRequestException('Name is required');
      out.name = name;
    }
    if (!partial || data.email !== undefined) {
      const email = String(data.email || '').trim().toLowerCase();
      if (!EMAIL.test(email)) throw new BadRequestException('Enter a valid email address');
      out.email = email;
    }
    if (data.phone !== undefined) out.phone = String(data.phone).trim() || null;
    if (data.role !== undefined) out.role = String(data.role).trim() || 'Server';
    if (data.isActive !== undefined) out.isActive = !!data.isActive;
    return out;
  }

  async findByRestaurant(user: any, restaurantId: string) {
    await this.access.assertRestaurantOwner(user, restaurantId);
    return this.staffModel.find({ restaurantId }).sort({ name: 1 });
  }

  async create(user: any, data: any) {
    const restaurantId = await this.access.getOwnerRestaurantId(user);
    const clean = this.clean(data);
    if (await this.staffModel.exists({ restaurantId, email: clean.email as string })) {
      throw new BadRequestException('A staff member with this email already exists');
    }
    return this.staffModel.create({ ...clean, restaurantId } as any);
  }

  async update(user: any, id: string, data: any) {
    await this.owned(user, id);
    return this.staffModel.findByIdAndUpdate(id, { $set: this.clean(data, true) }, { returnDocument: 'after' });
  }

  async delete(user: any, id: string) {
    await this.owned(user, id);
    await this.staffModel.findByIdAndDelete(id);
    return { message: 'Staff member removed' };
  }
}
