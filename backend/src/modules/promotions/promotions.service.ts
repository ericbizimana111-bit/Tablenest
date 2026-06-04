import { Injectable } from '@nestjs/common';
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
        return this.promotionModel.findByIdAndUpdate(id, { isActive: !promo.isActive }, { new: true });
    }
}
EOF

cat > /home/claude / tablenest / backend / src / modules / promotions / promotions.controller.ts << 'EOF'
import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PromotionsService } from './promotions.service';

@Controller('promotions')
@UseGuards(AuthGuard('jwt'))
export class PromotionsController {
    constructor(private promotionsService: PromotionsService) { }

    @Get('restaurant/:restaurantId')
    findByRestaurant(@Param('restaurantId') restaurantId: string) {
        return this.promotionsService.findByRestaurant(restaurantId);
    }

    @Post()
    create(@Body() data: any) { return this.promotionsService.create(data.restaurantId, data); }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) { return this.promotionsService.update(id, data); }

    @Patch(':id/toggle')
    toggle(@Param('id') id: string) { return this.promotionsService.toggle(id); }

    @Delete(':id')
    delete(@Param('id') id: string) { return this.promotionsService.delete(id); }
}
EOF

cat > /home/claude / tablenest / backend / src / modules / promotions / promotions.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { Promotion, PromotionSchema } from './promotion.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Promotion.name, schema: PromotionSchema }])],
    controllers: [PromotionsController],
    providers: [PromotionsService],
    exports: [PromotionsService],
})
export class PromotionsModule { }