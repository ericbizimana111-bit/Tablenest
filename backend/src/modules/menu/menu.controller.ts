import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { RolesGuard } from '../../common/guards/roles.guard';
import { OptionalJwtGuard } from '../../common/guards/optional-jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { MenuService } from './menu.service';
import { CreateCategoryDto, CreateMenuItemDto, UpdateCategoryDto, UpdateMenuItemDto } from './menu.dto';

@Controller('menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  // ── Public (owners/admins signed in also see unavailable dishes) ──────────
  @Get('popular')
  popular(@Query('limit') limit?: string) {
    return this.menuService.popularDishes(Number(limit) || 8);
  }

  @Get('search')
  search(@Query('q') q?: string) {
    return this.menuService.searchDishes(typeof q === 'string' ? q : '');
  }

  @UseGuards(OptionalJwtGuard)
  @Get('restaurant/:restaurantId')
  getFullMenu(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    return this.menuService.getFullMenu(req.user, restaurantId);
  }

  @UseGuards(OptionalJwtGuard)
  @Get('categories/:restaurantId')
  getCategories(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string) {
    return this.menuService.getCategories(req.user, restaurantId);
  }

  @UseGuards(OptionalJwtGuard)
  @Get('items/:restaurantId')
  getItems(@Request() req, @Param('restaurantId', MongoIdValidationPipe) restaurantId: string, @Query('categoryId') categoryId?: string) {
    return this.menuService.getItems(req.user, restaurantId, categoryId);
  }

  @UseGuards(OptionalJwtGuard)
  @Get('item/:id')
  getItemById(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.menuService.getItemById(req.user, id);
  }

  // ── Owner (admins may edit or remove any dish) ────────────────────────────
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Post('categories')
  createCategory(@Request() req, @Body() dto: CreateCategoryDto) {
    return this.menuService.createCategory(req.user, dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Put('categories/:id')
  updateCategory(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: UpdateCategoryDto) {
    return this.menuService.updateCategory(req.user, id, dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Delete('categories/:id')
  deleteCategory(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.menuService.deleteCategory(req.user, id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER)
  @Post('items')
  createItem(@Request() req, @Body() dto: CreateMenuItemDto) {
    return this.menuService.createItem(req.user, dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Put('items/:id')
  updateItem(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menuService.updateItem(req.user, id, dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Patch('items/:id/toggle')
  toggleAvailability(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.menuService.toggleAvailability(req.user, id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Delete('items/:id')
  deleteItem(@Request() req, @Param('id', MongoIdValidationPipe) id: string) {
    return this.menuService.deleteItem(req.user, id);
  }
}
