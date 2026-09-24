import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  // ── Public ────────────────────────────────────────────────────────────────
  @Get('popular')
  popular(@Query('limit') limit?: string) {
    return this.menuService.popularDishes(Number(limit) || 8);
  }

  @Get('search')
  search(@Query('q') q?: string) {
    return this.menuService.searchDishes(q || '');
  }

  @Get('restaurant/:restaurantId')
  getFullMenu(@Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    return this.menuService.getFullMenu(restaurantId);
  }

  @Get('categories/:restaurantId')
  getCategories(@Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    return this.menuService.getCategories(restaurantId);
  }

  @Get('items/:restaurantId')
  getItems(@Param('restaurantId', MongoIdValidationPipe) restaurantId: string, @Query('categoryId') categoryId?: string) {
    return this.menuService.getItems(restaurantId, categoryId);
  }

  @Get('item/:id')
  getItemById(@Param('id', MongoIdValidationPipe) id: string) {
    return this.menuService.getItemById(id);
  }

  // ── Owner ─────────────────────────────────────────────────────────────────
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Post('categories')
  createCategory(@Request() req, @Body() data: any) {
    return this.menuService.createCategory(req.user, data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Put('categories/:id')
  updateCategory(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() data: any) {
    return this.menuService.updateCategory(req.user, id, data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Delete('categories/:id')
  deleteCategory(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.menuService.deleteCategory(req.user, id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Post('items')
  createItem(@Request() req, @Body() data: any) {
    return this.menuService.createItem(req.user, data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Put('items/:id')
  updateItem(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() data: any) {
    return this.menuService.updateItem(req.user, id, data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch('items/:id/toggle')
  toggleAvailability(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.menuService.toggleAvailability(req.user, id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Delete('items/:id')
  deleteItem(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.menuService.deleteItem(req.user, id);
  }
}
