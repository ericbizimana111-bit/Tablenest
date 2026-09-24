import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto, UpdateTableStatusDto } from './tables.dto';

@Controller('tables')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
export class TablesController {
  constructor(private tablesService: TablesService) {}

  @Get('restaurant/:restaurantId')
  findByRestaurant(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    return this.tablesService.findByRestaurant(req.user, restaurantId);
  }

  @Get('floor-plan/:restaurantId')
  getFloorPlan(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    return this.tablesService.getFloorPlan(req.user, restaurantId);
  }

  @Post()
  @Roles(UserRole.OWNER)
  create(@Request() req, @Body() dto: CreateTableDto) {
    return this.tablesService.create(req.user, dto);
  }

  @Put(':id')
  update(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: UpdateTableDto) {
    return this.tablesService.update(req.user, id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: UpdateTableStatusDto) {
    return this.tablesService.updateStatus(req.user, id, dto);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.tablesService.delete(req.user, id);
  }
}
