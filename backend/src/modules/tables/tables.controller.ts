import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { TablesService } from './tables.service';
import { TableStatus } from './table.schema';

@Controller('tables')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.OWNER)
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
  create(@Request() req, @Body() data: any) {
    return this.tablesService.create(req.user, data);
  }

  @Put(':id')
  update(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() data: any) {
    return this.tablesService.update(req.user, id, data);
  }

  @Patch(':id/status')
  updateStatus(
    @Request() req,
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() body: { status: TableStatus; guestId?: string; serverNotes?: string },
  ) {
    return this.tablesService.updateStatus(req.user, id, body.status, body.guestId, body.serverNotes);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.tablesService.delete(req.user, id);
  }
}
