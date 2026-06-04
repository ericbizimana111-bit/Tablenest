import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';
import { Loyalty, LoyaltySchema } from './loyalty.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Loyalty.name, schema: LoyaltySchema }])],
    controllers: [LoyaltyController],
    providers: [LoyaltyService],
    exports: [LoyaltyService, MongooseModule],
})
export class LoyaltyModule { }