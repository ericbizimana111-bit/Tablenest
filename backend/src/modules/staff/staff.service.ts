import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Staff, StaffDocument } from './staff.schema';

@Injectable()
export class StaffService {
    constructor(@InjectModel(Staff.name) private staffModel: Model<StaffDocument>) { }

    async findByRestaurant(restaurantId: string) {
        return this.staffModel.find({ restaurantId }).sort({ name: 1 });
    }

    async create(restaurantId: string, data: any) {
        return this.staffModel.create({ ...data, restaurantId });
    }

    async update(id: string, data: any) {
        return this.staffModel.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after' });
    }

    async delete(id: string) {
        await this.staffModel.findByIdAndDelete(id);
        return { message: 'Staff member removed' };
    }
}