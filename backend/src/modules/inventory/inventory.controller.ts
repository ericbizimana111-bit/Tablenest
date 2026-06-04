import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InventoryService } from './inventory.service';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'))
export class InventoryController {
    constructor(private inventoryService: InventoryService) { }

    @Get('restaurant/:restaurantId')
    findByRestaurant(@Param('restaurantId') restaurantId: string) {
        return this.inventoryService.findByRestaurant(restaurantId);
    }

    @Get('restaurant/:restaurantId/low-stock')
    getLowStock(@Param('restaurantId') restaurantId: string) {
        return this.inventoryService.getLowStock(restaurantId);
    }

    @Post()
    create(@Body() data: any) { return this.inventoryService.create(data.restaurantId, data); }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) { return this.inventoryService.update(id, data); }

    @Delete(':id')
    delete(@Param('id') id: string) { return this.inventoryService.delete(id); }
}

