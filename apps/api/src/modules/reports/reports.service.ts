import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============ DATE HELPERS ============

  private getDateRange(
    period?: string,
    startDate?: string,
    endDate?: string,
  ): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (period === 'custom' && startDate && endDate) {
      start = new Date(startDate + 'T00:00:00');
      end = new Date(endDate + 'T23:59:59.999');
    } else if (period === '7d') {
      start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    } else if (period === '90d') {
      start = new Date(now);
      start.setDate(start.getDate() - 89);
      start.setHours(0, 0, 0, 0);
    } else {
      // Default: 30d
      start = new Date(now);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
    }

    return { start, end };
  }

  private getCurrentMonthRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  // ============ BASIC REPORTS ============

  async getOverview(tenantId: string) {
    const { start, end } = this.getCurrentMonthRange();
    const where = { tenantId, date: { gte: start, lte: end } };

    const [total, completed, cancelled, noShow, totalCustomers, revenue] =
      await Promise.all([
        this.prisma.booking.count({ where }),
        this.prisma.booking.count({ where: { ...where, status: 'COMPLETED' } }),
        this.prisma.booking.count({ where: { ...where, status: 'CANCELLED' } }),
        this.prisma.booking.count({ where: { ...where, status: 'NO_SHOW' } }),
        this.prisma.customer.count({ where: { tenantId } }),
        this.prisma.booking.aggregate({
          where: { ...where, status: 'COMPLETED' },
          _sum: { totalPrice: true },
        }),
      ]);

    const pending = total - completed - cancelled - noShow;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;
    const noShowRate = total > 0 ? Math.round((noShow / total) * 100) : 0;

    return {
      totalBookings: total,
      completedBookings: completed,
      cancelledBookings: cancelled,
      noShowBookings: noShow,
      pendingBookings: pending,
      totalCustomers,
      totalRevenue: Number(revenue._sum.totalPrice || 0),
      completionRate,
      cancellationRate,
      noShowRate,
    };
  }

  async getBookingsByStatus(tenantId: string) {
    const { start, end } = this.getCurrentMonthRange();

    const result = await this.prisma.booking.groupBy({
      by: ['status'],
      where: { tenantId, date: { gte: start, lte: end } },
      _count: { id: true },
    });

    const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    return statuses.map((status) => {
      const found = result.find((r) => r.status === status);
      return { status, count: found?._count?.id || 0 };
    });
  }

  async getBookingsByDay(tenantId: string) {
    const { start, end } = this.getCurrentMonthRange();

    const result: Array<{ dow: number; count: bigint }> = await this.prisma.$queryRaw`
      SELECT EXTRACT(DOW FROM date)::int AS dow, COUNT(*)::bigint AS count
      FROM bookings
      WHERE "tenantId" = ${tenantId}
        AND date >= ${start} AND date <= ${end}
      GROUP BY dow
      ORDER BY dow
    `;

    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days.map((name, i) => {
      const found = result.find((r) => r.dow === i);
      return { day: name, dayIndex: i, count: Number(found?.count || 0) };
    });
  }

  async getTopServices(tenantId: string) {
    const { start, end } = this.getCurrentMonthRange();

    const result = await this.prisma.booking.groupBy({
      by: ['serviceId'],
      where: { tenantId, date: { gte: start, lte: end } },
      _count: { id: true },
      _sum: { totalPrice: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    if (result.length === 0) return [];

    const services = await this.prisma.service.findMany({
      where: { id: { in: result.map((r) => r.serviceId) } },
      select: { id: true, name: true, price: true },
    });

    const serviceMap = new Map(services.map((s) => [s.id, s]));

    return result.map((r) => {
      const service = serviceMap.get(r.serviceId);
      return {
        serviceId: r.serviceId,
        name: service?.name || 'Servicio eliminado',
        bookings: r._count.id,
        revenue: Number(r._sum.totalPrice || 0),
      };
    });
  }

  async getTopCustomers(tenantId: string) {
    const { start, end } = this.getCurrentMonthRange();

    const result = await this.prisma.booking.groupBy({
      by: ['customerId'],
      where: { tenantId, date: { gte: start, lte: end } },
      _count: { id: true },
      _sum: { totalPrice: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    if (result.length === 0) return [];

    const customers = await this.prisma.customer.findMany({
      where: { id: { in: result.map((r) => r.customerId) } },
      select: { id: true, name: true, phone: true },
    });

    const customerMap = new Map(customers.map((c) => [c.id, c]));

    return result.map((r) => {
      const customer = customerMap.get(r.customerId);
      return {
        customerId: r.customerId,
        name: customer?.name || 'Cliente eliminado',
        phone: customer?.phone || '',
        bookings: r._count.id,
        revenue: Number(r._sum.totalPrice || 0),
      };
    });
  }

  // ============ ADVANCED REPORTS ============

  async getRevenue(
    tenantId: string,
    period?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const { start, end } = this.getDateRange(period, startDate, endDate);

    const result: Array<{ day: Date; revenue: number }> = await this.prisma.$queryRaw`
      SELECT DATE(b.date) AS day,
             SUM(COALESCE(b."totalPrice", s.price))::float AS revenue
      FROM bookings b
      LEFT JOIN services s ON s.id = b."serviceId"
      WHERE b."tenantId" = ${tenantId}
        AND b.status = 'COMPLETED'
        AND b.date >= ${start} AND b.date <= ${end}
      GROUP BY DATE(b.date)
      ORDER BY day
    `;

    const totalRevenue = result.reduce((sum, r) => sum + Number(r.revenue || 0), 0);
    const avgDaily = result.length > 0 ? totalRevenue / result.length : 0;

    return {
      data: result.map((r) => ({
        date: r.day.toISOString().split('T')[0],
        revenue: Number(r.revenue || 0),
      })),
      summary: {
        total: totalRevenue,
        average: Math.round(avgDaily),
        days: result.length,
      },
    };
  }

  async getBookingTrends(
    tenantId: string,
    period?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const { start, end } = this.getDateRange(period, startDate, endDate);

    const result: Array<{ day: Date; status: string; count: bigint }> =
      await this.prisma.$queryRaw`
      SELECT DATE(date) AS day, status, COUNT(*)::bigint AS count
      FROM bookings
      WHERE "tenantId" = ${tenantId}
        AND date >= ${start} AND date <= ${end}
      GROUP BY DATE(date), status
      ORDER BY day
    `;

    // Build a map of date -> { status: count }
    const dateMap = new Map<string, Record<string, number>>();
    for (const r of result) {
      const dateStr = r.day.toISOString().split('T')[0];
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0, NO_SHOW: 0 });
      }
      dateMap.get(dateStr)![r.status] = Number(r.count);
    }

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, statuses]) => ({
        date,
        total: Object.values(statuses).reduce((s, v) => s + v, 0),
        ...statuses,
      }));
  }

  async getPeakHours(
    tenantId: string,
    period?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const { start, end } = this.getDateRange(period, startDate, endDate);

    const result: Array<{ dow: number; hour: number; count: bigint }> =
      await this.prisma.$queryRaw`
      SELECT EXTRACT(DOW FROM date)::int AS dow,
             SPLIT_PART("startTime", ':', 1)::int AS hour,
             COUNT(*)::bigint AS count
      FROM bookings
      WHERE "tenantId" = ${tenantId}
        AND date >= ${start} AND date <= ${end}
      GROUP BY dow, hour
      ORDER BY dow, hour
    `;

    // Build 7x24 matrix
    const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    let maxCount = 0;
    for (const r of result) {
      const count = Number(r.count);
      matrix[r.dow][r.hour] = count;
      if (count > maxCount) maxCount = count;
    }

    return { matrix, maxCount };
  }

  async getCancellationTrends(
    tenantId: string,
    period?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const { start, end } = this.getDateRange(period, startDate, endDate);

    const result: Array<{ week: string; total: bigint; cancelled: bigint; noshow: bigint }> =
      await this.prisma.$queryRaw`
      SELECT TO_CHAR(DATE_TRUNC('week', date), 'YYYY-MM-DD') AS week,
             COUNT(*)::bigint AS total,
             COUNT(*) FILTER (WHERE status = 'CANCELLED')::bigint AS cancelled,
             COUNT(*) FILTER (WHERE status = 'NO_SHOW')::bigint AS noshow
      FROM bookings
      WHERE "tenantId" = ${tenantId}
        AND date >= ${start} AND date <= ${end}
      GROUP BY DATE_TRUNC('week', date)
      ORDER BY week
    `;

    return result.map((r) => {
      const total = Number(r.total);
      const cancelled = Number(r.cancelled);
      const noshow = Number(r.noshow);
      return {
        week: r.week,
        total,
        cancelled,
        noShow: noshow,
        cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
        noShowRate: total > 0 ? Math.round((noshow / total) * 100) : 0,
      };
    });
  }

  async getCustomerRetention(
    tenantId: string,
    period?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const { start, end } = this.getDateRange(period, startDate, endDate);

    const result: Array<{ month: string; new_customers: bigint; returning_customers: bigint }> =
      await this.prisma.$queryRaw`
      SELECT TO_CHAR(DATE_TRUNC('month', b.date), 'YYYY-MM') AS month,
             COUNT(DISTINCT CASE WHEN c."createdAt" >= DATE_TRUNC('month', b.date)
                                  AND c."createdAt" < DATE_TRUNC('month', b.date) + INTERVAL '1 month'
                            THEN c.id END)::bigint AS new_customers,
             COUNT(DISTINCT CASE WHEN c."createdAt" < DATE_TRUNC('month', b.date)
                            THEN c.id END)::bigint AS returning_customers
      FROM bookings b
      JOIN customers c ON c.id = b."customerId"
      WHERE b."tenantId" = ${tenantId}
        AND b.date >= ${start} AND b.date <= ${end}
      GROUP BY DATE_TRUNC('month', b.date)
      ORDER BY month
    `;

    return result.map((r) => ({
      month: r.month,
      newCustomers: Number(r.new_customers),
      returningCustomers: Number(r.returning_customers),
    }));
  }

  async getEmployeePerformance(
    tenantId: string,
    period?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const { start, end } = this.getDateRange(period, startDate, endDate);

    const result = await this.prisma.booking.groupBy({
      by: ['employeeId'],
      where: {
        tenantId,
        date: { gte: start, lte: end },
        employeeId: { not: null },
      },
      _count: { id: true },
      _sum: { totalPrice: true },
    });

    if (result.length === 0) return [];

    const employeeIds = result
      .map((r) => r.employeeId)
      .filter((id): id is string => id !== null);

    const employees = await this.prisma.employee.findMany({
      where: { id: { in: employeeIds } },
      select: { id: true, name: true },
    });

    const employeeMap = new Map(employees.map((e) => [e.id, e]));

    // Get completed/cancelled counts per employee
    const statusCounts: Array<{ employeeId: string; status: string; count: bigint }> =
      await this.prisma.$queryRaw`
      SELECT "employeeId", status, COUNT(*)::bigint AS count
      FROM bookings
      WHERE "tenantId" = ${tenantId}
        AND date >= ${start} AND date <= ${end}
        AND "employeeId" IS NOT NULL
      GROUP BY "employeeId", status
    `;

    const statusMap = new Map<string, Record<string, number>>();
    for (const sc of statusCounts) {
      if (!statusMap.has(sc.employeeId)) {
        statusMap.set(sc.employeeId, {});
      }
      statusMap.get(sc.employeeId)![sc.status] = Number(sc.count);
    }

    return result
      .map((r) => {
        const employee = r.employeeId ? employeeMap.get(r.employeeId) : null;
        const statuses = r.employeeId ? statusMap.get(r.employeeId) || {} : {};
        const completed = statuses['COMPLETED'] || 0;
        return {
          employeeId: r.employeeId,
          name: employee?.name || 'Sin asignar',
          totalBookings: r._count.id,
          completed,
          cancelled: statuses['CANCELLED'] || 0,
          noShow: statuses['NO_SHOW'] || 0,
          revenue: Number(r._sum.totalPrice || 0),
          completionRate:
            r._count.id > 0 ? Math.round((completed / r._count.id) * 100) : 0,
        };
      })
      .sort((a, b) => b.totalBookings - a.totalBookings);
  }

  async getServicePerformance(
    tenantId: string,
    period?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const { start, end } = this.getDateRange(period, startDate, endDate);

    const result = await this.prisma.booking.groupBy({
      by: ['serviceId'],
      where: { tenantId, date: { gte: start, lte: end } },
      _count: { id: true },
      _sum: { totalPrice: true },
    });

    if (result.length === 0) return [];

    const services = await this.prisma.service.findMany({
      where: { id: { in: result.map((r) => r.serviceId) } },
      select: { id: true, name: true, price: true },
    });

    const serviceMap = new Map(services.map((s) => [s.id, s]));

    // Get completed counts per service
    const completedCounts = await this.prisma.booking.groupBy({
      by: ['serviceId'],
      where: { tenantId, date: { gte: start, lte: end }, status: 'COMPLETED' },
      _count: { id: true },
    });

    const completedMap = new Map(completedCounts.map((c) => [c.serviceId, c._count.id]));

    return result
      .map((r) => {
        const service = serviceMap.get(r.serviceId);
        const completed = completedMap.get(r.serviceId) || 0;
        return {
          serviceId: r.serviceId,
          name: service?.name || 'Servicio eliminado',
          price: Number(service?.price || 0),
          totalBookings: r._count.id,
          completedBookings: completed,
          revenue: Number(r._sum.totalPrice || 0),
          completionRate:
            r._count.id > 0 ? Math.round((completed / r._count.id) * 100) : 0,
        };
      })
      .sort((a, b) => b.totalBookings - a.totalBookings);
  }

  async exportBookingsCsv(
    tenantId: string,
    period?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<string> {
    const { start, end } = this.getDateRange(period, startDate, endDate);

    const bookings = await this.prisma.booking.findMany({
      where: { tenantId, date: { gte: start, lte: end } },
      include: {
        service: { select: { name: true, price: true } },
        customer: { select: { name: true, phone: true, email: true } },
        employee: { select: { name: true } },
      },
      orderBy: { date: 'asc' },
    });

    const header = 'Fecha,Hora Inicio,Hora Fin,Servicio,Cliente,Teléfono,Email,Empleado,Estado,Precio\n';
    const rows = bookings.map((b) => {
      const date = b.date.toISOString().split('T')[0];
      const serviceName = b.service.name.replace(/,/g, ';');
      const customerName = b.customer.name.replace(/,/g, ';');
      const employeeName = b.employee?.name?.replace(/,/g, ';') || '';
      const price = b.totalPrice ? Number(b.totalPrice) : Number(b.service.price);
      return `${date},${b.startTime},${b.endTime},${serviceName},${customerName},${b.customer.phone},${b.customer.email || ''},${employeeName},${b.status},${price}`;
    });

    return header + rows.join('\n');
  }

  async getBranchComparison(
    tenantId: string,
    period?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const { start, end } = this.getDateRange(period, startDate, endDate);

    const branches = await this.prisma.branch.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true },
    });

    if (branches.length === 0) return [];

    const results = await Promise.all(
      branches.map(async (branch) => {
        const where = { tenantId, branchId: branch.id, date: { gte: start, lte: end } };

        const [total, completed, cancelled, noShow, revenue] = await Promise.all([
          this.prisma.booking.count({ where }),
          this.prisma.booking.count({ where: { ...where, status: 'COMPLETED' } }),
          this.prisma.booking.count({ where: { ...where, status: 'CANCELLED' } }),
          this.prisma.booking.count({ where: { ...where, status: 'NO_SHOW' } }),
          this.prisma.booking.aggregate({
            where: { ...where, status: 'COMPLETED' },
            _sum: { totalPrice: true },
          }),
        ]);

        return {
          branchId: branch.id,
          branchName: branch.name,
          totalBookings: total,
          completedBookings: completed,
          cancelledBookings: cancelled,
          noShowBookings: noShow,
          revenue: Number(revenue._sum.totalPrice || 0),
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      }),
    );

    return results.sort((a, b) => b.totalBookings - a.totalBookings);
  }
}
