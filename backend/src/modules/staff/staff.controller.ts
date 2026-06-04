import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StaffService } from './staff.service';

@Controller('staff')
@UseGuards(AuthGuard('jwt'))
export class StaffController {
    constructor(private staffService: StaffService) { }

    @Get('restaurant/:restaurantId')
    findByRestaurant(@Param('restaurantId') restaurantId: string) {
        return this.staffService.findByRestaurant(restaurantId);
    }

    @Post()
    create(@Body() data: any) { return this.staffService.create(data.restaurantId, data); }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) { return this.staffService.update(id, data); }

    @Delete(':id')
    delete(@Param('id') id: string) { return this.staffService.delete(id); }
}