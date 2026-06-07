import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { AuthGuard } from '@nestjs/passport';
import { InventoryService } from './inventory.service';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'))
export class InventoryController {
    constructor(private inventoryService: InventoryService) { }

    @Get('restaurant/:restaurantId')
    findByRestaurant(@Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
        return this.inventoryService.findByRestaurant(restaurantId);
    }

    @Get('restaurant/:restaurantId/low-stock')
    getLowStock(@Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
        return this.inventoryService.getLowStock(restaurantId);
    }

    @Post()
    create(@Body() data: any) { return this.inventoryService.create(data.restaurantId, data); }

    @Put(':id')
    update(@Param('id', MongoIdValidationPipe) id: string, @Body() data: any) { return this.inventoryService.update(id, data); }

    @Delete(':id')
    delete(@Param('id', MongoIdValidationPipe) id: string) { return this.inventoryService.delete(id); }
}

