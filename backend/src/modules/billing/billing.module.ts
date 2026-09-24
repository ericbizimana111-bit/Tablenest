import { Controller, Get, Module, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { IsOptional, Matches } from 'class-validator';
import { PlatformCharge, PlatformChargeSchema } from './platform-charge.schema';
import { Restaurant, RestaurantSchema } from '../restaurants/restaurant.schema';
import { BillingService, PERIOD_RE } from './billing.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { AccessControlService } from '../../common/services/access-control.service';

class StatementQueryDto {
  @IsOptional()
  @Matches(PERIOD_RE, { message: 'period must be YYYY-MM' })
  period?: string;
}

/** Owner view of what their restaurant owes the platform. */
@Controller('billing')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.OWNER)
class BillingController {
  constructor(
    private billing: BillingService,
    private access: AccessControlService,
  ) {}

  @Get('my-statement')
  async myStatement(@Request() req, @Query() q: StatementQueryDto) {
    const restaurantId = await this.access.getOwnerRestaurantId(req.user);
    return this.billing.statement(restaurantId, q.period);
  }
}

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlatformCharge.name, schema: PlatformChargeSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
    ]),
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
