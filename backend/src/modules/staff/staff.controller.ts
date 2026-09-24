import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { CreateStaffDto, StaffService, UpdateStaffDto } from './staff.service';

@Controller('staff')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Get('restaurant/:restaurantId')
  findByRestaurant(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    return this.staffService.findByRestaurant(req.user, restaurantId);
  }

  @Post()
  @Roles(UserRole.OWNER)
  create(@Request() req, @Body() dto: CreateStaffDto) {
    return this.staffService.create(req.user, dto);
  }

  @Put(':id')
  update(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: UpdateStaffDto) {
    return this.staffService.update(req.user, id, dto);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.staffService.delete(req.user, id);
  }
}
