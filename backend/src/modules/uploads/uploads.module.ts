import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as path from 'path';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { Upload, UploadSchema } from './upload.schema';
import { STORAGE_DRIVER } from './storage/storage.driver';
import { LocalStorageDriver } from './storage/local-storage.driver';
import { Restaurant, RestaurantSchema } from '../restaurants/restaurant.schema';
import { MenuItem, MenuItemSchema } from '../menu/menu.schema';
import { User, UserSchema } from '../users/user.schema';

export const uploadDir = (config: ConfigService) => path.resolve(config.get<string>('UPLOAD_DIR') || path.join(process.cwd(), 'uploads'));

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Upload.name, schema: UploadSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [UploadsController],
  providers: [
    UploadsService,
    {
      provide: STORAGE_DRIVER,
      inject: [ConfigService],
      // Only the local driver ships today; env validation rejects any other UPLOAD_DRIVER value.
      useFactory: (config: ConfigService) =>
        new LocalStorageDriver(uploadDir(config), (config.get<string>('PUBLIC_UPLOAD_BASE_URL') || '').replace(/\/$/, '')),
    },
  ],
  exports: [UploadsService],
})
export class UploadsModule {}
