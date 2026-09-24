import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  findByUser(@Request() req) {
    return this.paymentsService.findByUser(req.user._id.toString());
  }
}
