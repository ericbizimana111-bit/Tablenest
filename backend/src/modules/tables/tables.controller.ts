import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TablesService } from './tables.service';
import { TableStatus } from './table.schema';

@Controller('tables')
@UseGuards(AuthGuard('jwt'))
export class TablesController {
    constructor(private tablesService: TablesService) { }

    @Get('restaurant/:restaurantId')
    findByRestaurant(@Param('restaurantId') restaurantId: string) {
        return this.tablesService.findByRestaurant(restaurantId);
    }

    @Get('floor-plan/:restaurantId')
    getFloorPlan(@Param('restaurantId') restaurantId: string) {
        return this.tablesService.getFloorPlan(restaurantId);
    }

    @Post()
    create(@Body() data: any) {
        return this.tablesService.create(data.restaurantId, data);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.tablesService.update(id, data);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: { status: TableStatus; guestId?: string }) {
        return this.tablesService.updateStatus(id, body.status, body.guestId);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.tablesService.delete(id);
    }
}