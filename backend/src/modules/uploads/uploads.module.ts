import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as path from 'path';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { Upload, UploadSchema } from './upload.schema';
import { STORAGE_DRIVER } from './storage/storage.driver';
import { LocalStorageDriver } from './storage/local-storage.driver';
import { CloudinaryStorageDriver, cloudinaryCredentials } from './storage/cloudinary-storage.driver';
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
      // Env validation guarantees UPLOAD_DRIVER is supported and, for cloudinary, that credentials exist.
      useFactory: (config: ConfigService) => {
        if (config.get('UPLOAD_DRIVER') === 'cloudinary') {
          const creds = cloudinaryCredentials((k) => config.get<string>(k));
          if (!creds) throw new Error('Cloudinary credentials are missing');
          return new CloudinaryStorageDriver(creds, config.get<string>('CLOUDINARY_FOLDER') || 'tablenest');
        }
        return new LocalStorageDriver(uploadDir(config), (config.get<string>('PUBLIC_UPLOAD_BASE_URL') || '').replace(/\/$/, ''));
      },
    },
  ],
  exports: [UploadsService],
})
export class UploadsModule {}
