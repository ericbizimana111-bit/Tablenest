import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { CreateInventoryDto, InventoryService, UpdateInventoryDto } from './inventory.service';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
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
  @Roles(UserRole.OWNER)
  create(@Request() req, @Body() dto: CreateInventoryDto) {
    return this.inventoryService.create(req.user, dto);
  }

  @Put(':id')
  update(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: UpdateInventoryDto) {
    return this.inventoryService.update(req.user, id, dto);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.inventoryService.delete(req.user, id);
  }
}
