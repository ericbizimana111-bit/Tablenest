import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Get('restaurant/:restaurantId')
  getFullMenu(@Param('restaurantId') restaurantId: string) {
    return this.menuService.getFullMenu(restaurantId);
  }

  @Get('categories/:restaurantId')
  getCategories(@Param('restaurantId') restaurantId: string) {
    return this.menuService.getCategories(restaurantId);
  }

  @Get('items/:restaurantId')
  getItems(@Param('restaurantId') restaurantId: string, @Query('categoryId') categoryId?: string) {
    return this.menuService.getItems(restaurantId, categoryId);
  }

  @Get('item/:id')
  getItemById(@Param('id') id: string) {
    return this.menuService.getItemById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('categories')
  createCategory(@Request() req, @Body() data: any) {
    return this.menuService.createCategory(data.restaurantId, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('categories/:id')
  updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.menuService.updateCategory(id, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.menuService.deleteCategory(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('items')
  createItem(@Request() req, @Body() data: any) {
    return this.menuService.createItem(data.restaurantId, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('items/:id')
  updateItem(@Param('id') id: string, @Body() data: any) {
    return this.menuService.updateItem(id, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('items/:id/toggle')
  toggleAvailability(@Param('id') id: string) {
    return this.menuService.toggleAvailability(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('items/:id')
  deleteItem(@Param('id') id: string) {
    return this.menuService.deleteItem(id);
  }
}
