import { Controller, Get, Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlatformSettings, PlatformSettingsSchema } from './platform-settings.schema';
import { SettingsService } from './settings.service';

/** Public, non-sensitive subset the storefront needs (currency, fees shown at checkout, plans for partners). */
@Controller('settings')
class PublicSettingsController {
  constructor(private settings: SettingsService) {}

  @Get('public')
  async publicSettings() {
    const s = await this.settings.get();
    return {
      currency: s.currency,
      serviceFeeRate: s.serviceFeeRate,
      serviceFeeCap: s.serviceFeeCap,
      plans: s.plans,
    };
  }
}

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: PlatformSettings.name, schema: PlatformSettingsSchema }])],
  controllers: [PublicSettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
