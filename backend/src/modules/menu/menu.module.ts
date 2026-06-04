import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { MenuItem, MenuItemSchema, MenuCategory, MenuCategorySchema } from './menu.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: MenuCategory.name, schema: MenuCategorySchema },
    ]),
  ],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService, MongooseModule],
})
export class MenuModule {}
