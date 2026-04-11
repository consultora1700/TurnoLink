import {
  Controller,
  Get,
  Query,

  ForbiddenException,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { ReportsService } from './reports.service';
import { ReportsQueryDto } from './dto/reports-query.dto';

@ApiTags('reports')
@Controller('reports')
@ApiBearerAuth()
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  // Feature hierarchy: complete_reports > advanced_reports > basic_reports
  private async requireFeature(
    tenantId: string,
    requiredFeature: 'basic_reports' | 'advanced_reports' | 'complete_reports',
  ): Promise<void> {
    const subscription = await this.subscriptionsService.getSubscription(tenantId);
    if (!subscription) {
      throw new ForbiddenException('No hay suscripción activa');
    }

    const features: string[] = subscription.plan.features;

    // Hierarchy: complete includes advanced includes basic
    if (requiredFeature === 'basic_reports') {
      if (
        features.includes('basic_reports') ||
        features.includes('advanced_reports') ||
        features.includes('complete_reports')
      ) {
        return;
      }
    } else if (requiredFeature === 'advanced_reports') {
      if (
        features.includes('advanced_reports') ||
        features.includes('complete_reports')
      ) {
        return;
      }
    } else if (requiredFeature === 'complete_reports') {
      if (features.includes('complete_reports')) {
        return;
      }
    }

    throw new ForbiddenException(
      'Tu plan no incluye esta función. Actualiza tu suscripción para acceder.',
    );
  }

  // ============ BASIC REPORTS (basic_reports) ============

  @Get('overview')
  @ApiOperation({ summary: 'KPI overview: bookings, revenue, rates (current month)' })
  async getOverview(@CurrentUser() user: User) {
    await this.requireFeature(user.tenantId!, 'basic_reports');
    return this.reportsService.getOverview(user.tenantId!);
  }

  @Get('bookings-by-status')
  @ApiOperation({ summary: 'Bookings grouped by status (current month)' })
  async getBookingsByStatus(@CurrentUser() user: User) {
    await this.requireFeature(user.tenantId!, 'basic_reports');
    return this.reportsService.getBookingsByStatus(user.tenantId!);
  }

  @Get('bookings-by-day')
  @ApiOperation({ summary: 'Bookings by day of week (current month)' })
  async getBookingsByDay(@CurrentUser() user: User) {
    await this.requireFeature(user.tenantId!, 'basic_reports');
    return this.reportsService.getBookingsByDay(user.tenantId!);
  }

  @Get('top-services')
  @ApiOperation({ summary: 'Top 5 services by booking count (current month)' })
  async getTopServices(@CurrentUser() user: User) {
    await this.requireFeature(user.tenantId!, 'basic_reports');
    return this.reportsService.getTopServices(user.tenantId!);
  }

  @Get('top-customers')
  @ApiOperation({ summary: 'Top 5 customers by booking count (current month)' })
  async getTopCustomers(@CurrentUser() user: User) {
    await this.requireFeature(user.tenantId!, 'basic_reports');
    return this.reportsService.getTopCustomers(user.tenantId!);
  }

  // ============ ADVANCED REPORTS (advanced_reports) ============

  @Get('revenue')
  @ApiOperation({ summary: 'Revenue over time (area chart)' })
  async getRevenue(@CurrentUser() user: User, @Query() query: ReportsQueryDto) {
    await this.requireFeature(user.tenantId!, 'advanced_reports');
    return this.reportsService.getRevenue(
      user.tenantId!,
      query.period,
      query.startDate,
      query.endDate,
    );
  }

  @Get('booking-trends')
  @ApiOperation({ summary: 'Booking trends over time (line chart)' })
  async getBookingTrends(
    @CurrentUser() user: User,
    @Query() query: ReportsQueryDto,
  ) {
    await this.requireFeature(user.tenantId!, 'advanced_reports');
    return this.reportsService.getBookingTrends(
      user.tenantId!,
      query.period,
      query.startDate,
      query.endDate,
    );
  }

  @Get('peak-hours')
  @ApiOperation({ summary: 'Peak hours heatmap (7x24 matrix)' })
  async getPeakHours(
    @CurrentUser() user: User,
    @Query() query: ReportsQueryDto,
  ) {
    await this.requireFeature(user.tenantId!, 'advanced_reports');
    return this.reportsService.getPeakHours(
      user.tenantId!,
      query.period,
      query.startDate,
      query.endDate,
    );
  }

  @Get('cancellation-trends')
  @ApiOperation({ summary: 'Cancellation and no-show trends' })
  async getCancellationTrends(
    @CurrentUser() user: User,
    @Query() query: ReportsQueryDto,
  ) {
    await this.requireFeature(user.tenantId!, 'advanced_reports');
    return this.reportsService.getCancellationTrends(
      user.tenantId!,
      query.period,
      query.startDate,
      query.endDate,
    );
  }

  @Get('customer-retention')
  @ApiOperation({ summary: 'New vs returning customers' })
  async getCustomerRetention(
    @CurrentUser() user: User,
    @Query() query: ReportsQueryDto,
  ) {
    await this.requireFeature(user.tenantId!, 'advanced_reports');
    return this.reportsService.getCustomerRetention(
      user.tenantId!,
      query.period,
      query.startDate,
      query.endDate,
    );
  }

  @Get('employee-performance')
  @ApiOperation({ summary: 'Performance by employee' })
  async getEmployeePerformance(
    @CurrentUser() user: User,
    @Query() query: ReportsQueryDto,
  ) {
    await this.requireFeature(user.tenantId!, 'advanced_reports');
    return this.reportsService.getEmployeePerformance(
      user.tenantId!,
      query.period,
      query.startDate,
      query.endDate,
    );
  }

  @Get('service-performance')
  @ApiOperation({ summary: 'Performance by service' })
  async getServicePerformance(
    @CurrentUser() user: User,
    @Query() query: ReportsQueryDto,
  ) {
    await this.requireFeature(user.tenantId!, 'advanced_reports');
    return this.reportsService.getServicePerformance(
      user.tenantId!,
      query.period,
      query.startDate,
      query.endDate,
    );
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export bookings as CSV' })
  async exportCsv(
    @CurrentUser() user: User,
    @Query() query: ReportsQueryDto,
    @Res() res: Response,
  ) {
    await this.requireFeature(user.tenantId!, 'advanced_reports');
    const csv = await this.reportsService.exportBookingsCsv(
      user.tenantId!,
      query.period,
      query.startDate,
      query.endDate,
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=reportes-turnos.csv');
    res.send('\uFEFF' + csv); // BOM for Excel UTF-8
  }

  // ============ ORDER-BASED REPORTS (mercado/ecommerce) ============

  @Get('orders/overview')
  @ApiOperation({ summary: 'Order KPIs: total orders, revenue, rates (current month)' })
  async getOrderOverview(@CurrentUser() user: User) {
    await this.requireFeature(user.tenantId!, 'basic_reports');
    return this.reportsService.getOrderOverview(user.tenantId!);
  }

  @Get('orders/by-status')
  @ApiOperation({ summary: 'Orders grouped by status (current month)' })
  async getOrdersByStatus(@CurrentUser() user: User) {
    await this.requireFeature(user.tenantId!, 'basic_reports');
    return this.reportsService.getOrdersByStatus(user.tenantId!);
  }

  @Get('orders/by-day')
  @ApiOperation({ summary: 'Orders by day of week (current month)' })
  async getOrdersByDay(@CurrentUser() user: User) {
    await this.requireFeature(user.tenantId!, 'basic_reports');
    return this.reportsService.getOrdersByDay(user.tenantId!);
  }

  @Get('orders/top-products')
  @ApiOperation({ summary: 'Top 5 products by order count (current month)' })
  async getTopProducts(@CurrentUser() user: User) {
    await this.requireFeature(user.tenantId!, 'basic_reports');
    return this.reportsService.getTopProducts(user.tenantId!);
  }

  @Get('orders/top-customers')
  @ApiOperation({ summary: 'Top 5 customers by order count (current month)' })
  async getTopOrderCustomers(@CurrentUser() user: User) {
    await this.requireFeature(user.tenantId!, 'basic_reports');
    return this.reportsService.getTopOrderCustomers(user.tenantId!);
  }

  // ============ ORDER ADVANCED REPORTS ============

  @Get('orders/revenue')
  @ApiOperation({ summary: 'Order revenue over time' })
  async getOrderRevenue(@CurrentUser() user: User, @Query() query: ReportsQueryDto) {
    await this.requireFeature(user.tenantId!, 'advanced_reports');
    return this.reportsService.getOrderRevenue(user.tenantId!, query.period, query.startDate, query.endDate);
  }

  @Get('orders/trends')
  @ApiOperation({ summary: 'Order trends over time by status' })
  async getOrderTrends(@CurrentUser() user: User, @Query() query: ReportsQueryDto) {
    await this.requireFeature(user.tenantId!, 'advanced_reports');
    return this.reportsService.getOrderTrends(user.tenantId!, query.period, query.startDate, query.endDate);
  }

  @Get('orders/peak-hours')
  @ApiOperation({ summary: 'Order peak hours heatmap' })
  async getOrderPeakHours(@CurrentUser() user: User, @Query() query: ReportsQueryDto) {
    await this.requireFeature(user.tenantId!, 'advanced_reports');
    return this.reportsService.getOrderPeakHours(user.tenantId!, query.period, query.startDate, query.endDate);
  }

  @Get('orders/cancellation-trends')
  @ApiOperation({ summary: 'Order cancellation rate trends' })
  async getOrderCancellationTrends(@CurrentUser() user: User, @Query() query: ReportsQueryDto) {
    await this.requireFeature(user.tenantId!, 'advanced_reports');
    return this.reportsService.getOrderCancellationTrends(user.tenantId!, query.period, query.startDate, query.endDate);
  }

  @Get('orders/customer-retention')
  @ApiOperation({ summary: 'Order customer retention (new vs returning)' })
  async getOrderCustomerRetention(@CurrentUser() user: User, @Query() query: ReportsQueryDto) {
    await this.requireFeature(user.tenantId!, 'advanced_reports');
    return this.reportsService.getOrderCustomerRetention(user.tenantId!, query.period, query.startDate, query.endDate);
  }

  @Get('orders/product-performance')
  @ApiOperation({ summary: 'Product performance metrics' })
  async getProductPerformance(@CurrentUser() user: User, @Query() query: ReportsQueryDto) {
    await this.requireFeature(user.tenantId!, 'advanced_reports');
    return this.reportsService.getProductPerformance(user.tenantId!, query.period, query.startDate, query.endDate);
  }

  @Get('orders/export/csv')
  @ApiOperation({ summary: 'Export orders as CSV' })
  async exportOrdersCsv(
    @CurrentUser() user: User,
    @Query() query: ReportsQueryDto,
    @Res() res: Response,
  ) {
    await this.requireFeature(user.tenantId!, 'advanced_reports');
    const csv = await this.reportsService.exportOrdersCsv(user.tenantId!, query.period, query.startDate, query.endDate);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=reportes-pedidos.csv');
    res.send('\uFEFF' + csv);
  }

  // ============ COMPLETE REPORTS (complete_reports) ============

  @Get('branch-comparison')
  @ApiOperation({ summary: 'Branch comparison (Business plan)' })
  async getBranchComparison(
    @CurrentUser() user: User,
    @Query() query: ReportsQueryDto,
  ) {
    await this.requireFeature(user.tenantId!, 'complete_reports');
    return this.reportsService.getBranchComparison(
      user.tenantId!,
      query.period,
      query.startDate,
      query.endDate,
    );
  }
}
