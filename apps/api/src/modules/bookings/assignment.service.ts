import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLoggerService } from '../../common/logger';
import { SchedulesService } from '../schedules/schedules.service';

export interface AssignmentResult {
  employeeId: string;
  assignedBy: 'system';
  assignmentReason: string;
}

/**
 * Auto-assignment engine for booking creation.
 *
 * Supports two modes:
 * - auto_assign: Picks the employee with the fewest bookings on the requested date
 *   (load-balancing). Ties broken by least total bookings that week.
 * - round_robin: Strict rotation based on last assignment timestamp.
 *
 * Both modes respect:
 * - Employee must be active + publicly visible
 * - Employee must have an EmployeeService record for the service (if any exist)
 * - Employee must not have a conflicting booking at the requested time
 * - Employee must have availability on the requested day (schedule check)
 */
@Injectable()
export class AssignmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
    private readonly schedulesService: SchedulesService,
  ) {
    this.logger.setContext('AssignmentService');
  }

  /**
   * Auto-assign an employee for a booking.
   * Returns null if no employee is available (booking proceeds without employee).
   */
  async autoAssign(
    tenantId: string,
    serviceId: string,
    date: string,
    startTime: string,
    endTime: string,
    mode: 'auto_assign' | 'round_robin',
    branchId?: string | null,
  ): Promise<AssignmentResult | null> {
    // 1. Get eligible employees for this service
    const candidates = await this.getEligibleEmployees(tenantId, serviceId, branchId);

    if (candidates.length === 0) {
      this.logger.warn(`No eligible employees found for service ${serviceId}`);
      return null;
    }

    // 2. Filter out employees with conflicting bookings, schedule, and blocked dates
    const bookingDate = new Date(date + 'T12:00:00Z');
    const available = await this.filterByAvailability(
      candidates,
      tenantId,
      bookingDate,
      startTime,
      endTime,
      branchId,
    );

    if (available.length === 0) {
      this.logger.warn(`No available employees for service ${serviceId} on ${date} ${startTime}`);
      return null;
    }

    // 3. Pick based on mode
    if (mode === 'round_robin') {
      return this.pickRoundRobin(available, tenantId, serviceId);
    }

    return this.pickLeastLoaded(available, tenantId, bookingDate);
  }

  /**
   * Get employees eligible for a service.
   * If EmployeeService records exist → only those employees.
   * Otherwise → all active, publicly visible employees.
   */
  private async getEligibleEmployees(
    tenantId: string,
    serviceId: string,
    branchId?: string | null,
  ): Promise<string[]> {
    // Check if service has explicit employee assignments
    const assignments = await this.prisma.employeeService.findMany({
      where: {
        serviceId,
        isActive: true,
        employee: { tenantId, isActive: true, isPubliclyVisible: true },
      },
      select: { employeeId: true },
    });

    let employeeIds: string[];

    if (assignments.length > 0) {
      employeeIds = assignments.map((a) => a.employeeId);
    } else {
      // Fallback: all active employees
      const employees = await this.prisma.employee.findMany({
        where: { tenantId, isActive: true, isPubliclyVisible: true },
        select: { id: true },
      });
      employeeIds = employees.map((e) => e.id);
    }

    // If branch is specified, filter by branch assignment
    if (branchId && employeeIds.length > 0) {
      const branchEmployees = await this.prisma.branchEmployee.findMany({
        where: {
          branchId,
          isActive: true,
          employeeId: { in: employeeIds },
        },
        select: { employeeId: true },
      });
      // If branch has employees assigned, filter; otherwise keep all
      if (branchEmployees.length > 0) {
        const branchSet = new Set(branchEmployees.map((be) => be.employeeId));
        employeeIds = employeeIds.filter((id) => branchSet.has(id));
      }
    }

    return employeeIds;
  }

  /**
   * Filter employees by checking schedule, blocked dates, and conflicting bookings.
   */
  private async filterByAvailability(
    employeeIds: string[],
    tenantId: string,
    date: Date,
    startTime: string,
    endTime: string,
    branchId?: string | null,
  ): Promise<string[]> {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getUTCDay() === 0 ? 6 : date.getUTCDay() - 1;

    // Batch fetch: employee schedules for this day
    const empSchedules = await this.prisma.employeeSchedule.findMany({
      where: { employeeId: { in: employeeIds }, dayOfWeek },
    });
    const empScheduleMap = new Map(empSchedules.map((s) => [s.employeeId, s]));

    // Batch fetch: employee blocked dates
    const dayRange = {
      gte: new Date(dateStr + 'T00:00:00Z'),
      lte: new Date(dateStr + 'T23:59:59.999Z'),
    };
    const empBlockedDates = await this.prisma.employeeBlockedDate.findMany({
      where: { employeeId: { in: employeeIds }, date: { gte: dayRange.gte, lte: dayRange.lte } },
    });
    const blockedEmployeeIds = new Set(empBlockedDates.map((b) => b.employeeId));

    // Filter by schedule and blocked dates
    const scheduleFiltered: string[] = [];
    for (const empId of employeeIds) {
      // Skip blocked employees
      if (blockedEmployeeIds.has(empId)) continue;

      // Check employee schedule
      const empSched = empScheduleMap.get(empId);
      if (empSched) {
        // Employee has custom schedule - check if active and time fits
        if (!empSched.isActive) continue;
        if (startTime < empSched.startTime || endTime > empSched.endTime) continue;
      }
      // If no custom schedule, employee inherits business schedule (already validated at booking level)

      scheduleFiltered.push(empId);
    }

    if (scheduleFiltered.length === 0) return [];

    // Find all bookings for remaining employees on this date that conflict
    const conflicting = await this.prisma.booking.findMany({
      where: {
        tenantId,
        employeeId: { in: scheduleFiltered },
        date,
        status: { in: ['PENDING', 'CONFIRMED'] },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      select: { employeeId: true },
    });

    const busySet = new Set(conflicting.map((b) => b.employeeId).filter(Boolean));
    return scheduleFiltered.filter((id) => !busySet.has(id));
  }

  /**
   * auto_assign mode: pick employee with fewest bookings on the date.
   * Tiebreaker: fewest bookings in the current week.
   */
  private async pickLeastLoaded(
    employeeIds: string[],
    tenantId: string,
    date: Date,
  ): Promise<AssignmentResult> {
    // Count bookings per employee on this date
    const dayCounts = await this.prisma.booking.groupBy({
      by: ['employeeId'],
      where: {
        tenantId,
        employeeId: { in: employeeIds },
        date,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      _count: true,
    });

    const dayMap = new Map(dayCounts.map((c) => [c.employeeId, c._count]));

    // Find minimum day count
    let minCount = Infinity;
    for (const id of employeeIds) {
      const count = dayMap.get(id) || 0;
      if (count < minCount) minCount = count;
    }

    const tied = employeeIds.filter((id) => (dayMap.get(id) || 0) === minCount);

    if (tied.length === 1) {
      return {
        employeeId: tied[0],
        assignedBy: 'system',
        assignmentReason: `Auto-asignado: menor carga del día (${minCount} turnos)`,
      };
    }

    // Tiebreaker: weekly load
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const weekCounts = await this.prisma.booking.groupBy({
      by: ['employeeId'],
      where: {
        tenantId,
        employeeId: { in: tied },
        date: { gte: startOfWeek, lt: endOfWeek },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      _count: true,
    });

    const weekMap = new Map(weekCounts.map((c) => [c.employeeId, c._count]));

    let bestId = tied[0];
    let bestWeek = weekMap.get(tied[0]) || 0;
    for (let i = 1; i < tied.length; i++) {
      const weekCount = weekMap.get(tied[i]) || 0;
      if (weekCount < bestWeek) {
        bestId = tied[i];
        bestWeek = weekCount;
      }
    }

    return {
      employeeId: bestId,
      assignedBy: 'system',
      assignmentReason: `Auto-asignado: menor carga (${minCount} turnos hoy, ${bestWeek} esta semana)`,
    };
  }

  /**
   * round_robin mode: pick employee who was least recently assigned.
   */
  private async pickRoundRobin(
    employeeIds: string[],
    tenantId: string,
    serviceId: string,
  ): Promise<AssignmentResult> {
    // Find last assignment per employee for this service
    const lastAssignments = await this.prisma.booking.findMany({
      where: {
        tenantId,
        serviceId,
        employeeId: { in: employeeIds },
        status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] },
      },
      orderBy: { createdAt: 'desc' },
      select: { employeeId: true, createdAt: true },
      distinct: ['employeeId'],
    });

    const lastMap = new Map(lastAssignments.map((a) => [a.employeeId, a.createdAt]));

    // Employees never assigned get priority (timestamp = epoch)
    let oldestId = employeeIds[0];
    let oldestTime = lastMap.get(employeeIds[0]) || new Date(0);

    for (let i = 1; i < employeeIds.length; i++) {
      const time = lastMap.get(employeeIds[i]) || new Date(0);
      if (time < oldestTime) {
        oldestId = employeeIds[i];
        oldestTime = time;
      }
    }

    return {
      employeeId: oldestId,
      assignedBy: 'system',
      assignmentReason: 'Auto-asignado por rotación (round-robin)',
    };
  }
}
