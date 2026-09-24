import { Body, Controller, Get, HttpCode, Param, Patch, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MongoIdValidationPipe } from '../../common/pipes/mongo-id.pipe';
import { pageParams } from '../../common/dto/pagination.dto';
import { UserRole } from '../users/user.schema';
import { AdminService } from './admin.service';
import { BillingService, currentPeriod } from '../billing/billing.service';
import { SettingsService } from '../settings/settings.service';
import { UpdateSettingsDto } from '../settings/settings.dto';
import { OrdersService } from '../orders/orders.service';
import { SupportService, TicketUpdateDto } from '../support/support.service';
import { AuditService } from '../../common/audit/audit.service';
import {
  AdminOrdersQueryDto,
  AdminReservationsQueryDto,
  AdminRestaurantsQueryDto,
  AdminTicketsQueryDto,
  AdminUpdateUserDto,
  AdminUploadsQueryDto,
  AdminUsersQueryDto,
  AuditQueryDto,
  ChargesQueryDto,
  MarkPaidDto,
  OrderCorrectionDto,
  PeriodDto,
  RestaurantBillingDto,
  RestaurantStatusDto,
  RevenueQueryDto,
  SponsorshipDto,
  VoidChargeDto,
} from './admin.dto';

/**
 * Platform administration. Every route requires an authenticated admin; every mutation is written
 * to the audit log. Admins can also use the owner-facing restaurant/menu/order/reservation routes
 * on any restaurant (see AccessControlService).
 */
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private admin: AdminService,
    private billing: BillingService,
    private settings: SettingsService,
    private orders: OrdersService,
    private support: SupportService,
    private audit: AuditService,
  ) {}

  @Get('stats')
  stats() {
    return this.admin.stats();
  }

  // ── Users ─────────────────────────────────────────────────────────────────
  @Get('users')
  users(@Query() q: AdminUsersQueryDto) {
    return this.admin.listUsers(q);
  }

  @Patch('users/:id')
  updateUser(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: AdminUpdateUserDto) {
    return this.admin.updateUser(req.user, id, dto);
  }

  // ── Restaurants ───────────────────────────────────────────────────────────
  @Get('restaurants')
  restaurants(@Query() q: AdminRestaurantsQueryDto) {
    return this.admin.listRestaurants(q);
  }

  @Patch('restaurants/:id/status')
  restaurantStatus(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: RestaurantStatusDto) {
    return this.admin.setRestaurantStatus(req.user, id, dto);
  }

  @Patch('restaurants/:id/billing')
  restaurantBilling(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: RestaurantBillingDto) {
    return this.billing.setPlan(req.user, id, dto.plan, dto.commissionRate);
  }

  @Post('restaurants/:id/sponsorship')
  sponsorship(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: SponsorshipDto) {
    return this.billing.grantSponsorship(req.user, id, dto.weeks);
  }

  @Get('restaurants/:id/statement')
  statement(@Param('id', MongoIdValidationPipe) id: string, @Query() q: PeriodDto) {
    return this.billing.statement(id, q.period);
  }

  // ── Orders & reservations ─────────────────────────────────────────────────
  @Get('orders')
  listOrders(@Query() q: AdminOrdersQueryDto) {
    return this.admin.listOrders(q);
  }

  @Post('orders/:id/correct')
  @HttpCode(200)
  correctOrder(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: OrderCorrectionDto) {
    return this.orders.adminCorrect(req.user, id, dto.status, dto.note);
  }

  @Get('reservations')
  listReservations(@Query() q: AdminReservationsQueryDto) {
    return this.admin.listReservations(q);
  }

  // ── Money ─────────────────────────────────────────────────────────────────
  @Get('revenue')
  revenue(@Query() q: RevenueQueryDto) {
    return this.billing.revenue(q.from, q.to);
  }

  @Get('charges')
  charges(@Query() q: ChargesQueryDto) {
    const { page, limit } = pageParams(q, 50);
    return this.billing.listCharges(q, page, limit);
  }

  @Post('charges/mark-paid')
  @HttpCode(200)
  markPaid(@Request() req, @Body() dto: MarkPaidDto) {
    return this.billing.markPaid(req.user, dto);
  }

  @Post('charges/:id/void')
  @HttpCode(200)
  voidCharge(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: VoidChargeDto) {
    return this.billing.voidCharge(req.user, id, dto.reason);
  }

  @Post('billing/run-subscriptions')
  @HttpCode(200)
  runSubscriptions(@Request() req, @Body() dto: PeriodDto) {
    return this.billing.chargeSubscriptions(req.user, dto.period || currentPeriod());
  }

  /** Safety net: recreates any revenue entries a failed write may have missed. Idempotent. */
  @Post('billing/reconcile')
  @HttpCode(200)
  async reconcile(@Request() req) {
    const [orders, reservations] = await Promise.all([this.orders.reconcileRevenue(), this.admin.reconcileBookingFees()]);
    await this.audit.record(req.user, 'admin.billing_reconciled', undefined, { ...orders, ...reservations });
    return { ...orders, ...reservations };
  }

  // ── Settings ──────────────────────────────────────────────────────────────
  @Get('settings')
  getSettings() {
    return this.settings.get();
  }

  @Put('settings')
  async updateSettings(@Request() req, @Body() dto: UpdateSettingsDto) {
    const updated = await this.settings.update(dto);
    await this.audit.record(req.user, 'admin.settings_updated', undefined, { ...dto });
    return updated;
  }

  // ── Uploads, support, audit ───────────────────────────────────────────────
  /** Delete with DELETE /api/uploads/:id?force=true, which detaches the image everywhere first. */
  @Get('uploads')
  uploads(@Query() q: AdminUploadsQueryDto) {
    return this.admin.listUploads(q);
  }

  @Get('support')
  tickets(@Query() q: AdminTicketsQueryDto) {
    const { page, limit } = pageParams(q, 25);
    return this.support.list({ status: q.status, type: q.type, search: q.search || undefined }, page, limit);
  }

  @Patch('support/:id')
  async updateTicket(@Request() req, @Param('id', MongoIdValidationPipe) id: string, @Body() dto: TicketUpdateDto) {
    const ticket = await this.support.adminUpdate(id, dto);
    await this.audit.record(req.user, 'admin.ticket_updated', { type: 'ticket', id }, { ...dto });
    return ticket;
  }

  @Get('audit-logs')
  auditLogs(@Query() q: AuditQueryDto) {
    return this.admin.listAudit(q);
  }
}
