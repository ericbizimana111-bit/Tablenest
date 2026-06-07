import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { AuthGuard } from '@nestjs/passport';
import { PromotionsService } from './promotions.service';

@Controller('promotions')
@UseGuards(AuthGuard('jwt'))
export class PromotionsController {
    constructor(private promotionsService: PromotionsService) { }

    @Get('restaurant/:restaurantId')
    findByRestaurant(@Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
        return this.promotionsService.findByRestaurant(restaurantId);
    }

    @Post()
    create(@Body() data: any) { return this.promotionsService.create(data.restaurantId, data); }

    @Put(':id')
    update(@Param('id', MongoIdValidationPipe) id: string, @Body() data: any) { return this.promotionsService.update(id, data); }

    @Patch(':id/toggle')
    toggle(@Param('id', MongoIdValidationPipe) id: string) { return this.promotionsService.toggle(id); }

    @Delete(':id')
    delete(@Param('id', MongoIdValidationPipe) id: string) { return this.promotionsService.delete(id); }
}