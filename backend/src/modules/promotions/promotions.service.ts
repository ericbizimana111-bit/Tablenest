import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Promotion, PromotionDocument } from './promotion.schema';

@Injectable()
export class PromotionsService {
    constructor(@InjectModel(Promotion.name) private promotionModel: Model<PromotionDocument>) { }

    async findByRestaurant(restaurantId: string) {
        return this.promotionModel.find({ restaurantId }).sort({ createdAt: -1 });
    }

    async create(restaurantId: string, data: any) {
        return this.promotionModel.create({ ...data, restaurantId });
    }

    async update(id: string, data: any) {
        return this.promotionModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    }

    async delete(id: string) {
        await this.promotionModel.findByIdAndDelete(id);
        return { message: 'Promotion deleted' };
    }

    async toggle(id: string) {
        const promo = await this.promotionModel.findById(id);
        if (!promo) throw new NotFoundException('Promotion not found');
        return this.promotionModel.findByIdAndUpdate(id, { isActive: !promo.isActive }, { new: true });
    }
}
