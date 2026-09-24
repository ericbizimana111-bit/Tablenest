import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { InventoryService } from './inventory.service';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.OWNER)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('restaurant/:restaurantId')
  findByRestaurant(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    return this.inventoryService.findByRestaurant(req.user, restaurantId);
  }

  @Get('restaurant/:restaurantId/low-stock')
  getLowStock(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    return this.inventoryService.getLowStock(req.user, restaurantId);
  }

  @Post()
  create(@Request() req, @Body() data: any) {
    return this.inventoryService.create(req.user, data);
  }

  @Put(':id')
  update(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() data: any) {
    return this.inventoryService.update(req.user, id, data);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.inventoryService.delete(req.user, id);
  }
}
