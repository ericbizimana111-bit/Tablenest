import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { AuthGuard } from '@nestjs/passport';
import { StaffService } from './staff.service';

@Controller('staff')
@UseGuards(AuthGuard('jwt'))
export class StaffController {
    constructor(private staffService: StaffService) { }

    @Get('restaurant/:restaurantId')
    findByRestaurant(@Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
        return this.staffService.findByRestaurant(restaurantId);
    }

    @Post()
    create(@Body() data: any) { return this.staffService.create(data.restaurantId, data); }

    @Put(':id')
    update(@Param('id', MongoIdValidationPipe) id: string, @Body() data: any) { return this.staffService.update(id, data); }

    @Delete(':id')
    delete(@Param('id', MongoIdValidationPipe) id: string) { return this.staffService.delete(id); }
}