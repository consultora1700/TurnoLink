import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyTiersService } from './loyalty-tiers.service';
import { BookingEvent, BookingEventPayload } from '../../common/events/booking.events';
import { LoyaltyEvent } from '../../common/events/loyalty.events';

@Injectable()
export class LoyaltyEventsListener {
  private readonly logger = new Logger(LoyaltyEventsListener.name);

  constructor(
    private readonly loyaltyService: LoyaltyService,
    private readonly tiersService: LoyaltyTiersService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(BookingEvent.COMPLETED, { async: true })
  async handleBookingCompleted(payload: BookingEventPayload): Promise<void> {
    try {
      const { booking, tenantId } = payload;

      // Check if tenant has active loyalty program
      const program = await this.prisma.loyaltyProgram.findUnique({ where: { tenantId } });
      if (!program || !program.isActive) return;

      // Check if tenant plan includes loyalty feature
      const subscription = await this.prisma.subscription.findUnique({
        where: { tenantId },
        include: { plan: true },
      });
      if (!subscription) return;
      let features: string[] = [];
      try { features = JSON.parse(subscription.plan.features as string); } catch {}
      if (!features.includes('loyalty')) return;

      // Calculate points
      let points = program.pointsPerBooking;
      if (program.pointsPerCurrencyUnit) {
        const servicePrice = Number(booking.service?.price ?? booking.product?.price ?? 0);
        points = Math.floor(servicePrice * Number(program.pointsPerCurrencyUnit));
      }
      if (points <= 0) return;

      // Check for tier multiplier
      const currentBalance = await this.loyaltyService.getBalance(tenantId, booking.customerId);
      if (currentBalance?.currentTierSlug) {
        const currentTier = await this.prisma.loyaltyTier.findFirst({
          where: { tenantId, slug: currentBalance.currentTierSlug },
        });
        if (currentTier && Number(currentTier.pointsMultiplier) > 1) {
          points = Math.floor(points * Number(currentTier.pointsMultiplier));
        }
      }

      const description = `Turno completado: ${booking.service?.name ?? booking.product?.name ?? 'Sin detalle'}`;
      const result = await this.loyaltyService.earnPoints(tenantId, booking.customerId, points, description, 'BOOKING', booking.id);

      // Check tier upgrade
      const newTier = await this.tiersService.getCurrentTier(tenantId, result.balance.currentBalance);
      if (newTier && newTier.slug !== currentBalance?.currentTierSlug) {
        await this.prisma.loyaltyBalance.update({
          where: { tenantId_customerId: { tenantId, customerId: booking.customerId } },
          data: { currentTierSlug: newTier.slug },
        });

        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
        this.eventEmitter.emit(LoyaltyEvent.TIER_UPGRADED, {
          tenantId,
          customerId: booking.customerId,
          customerName: booking.customer.name,
          customerEmail: booking.customer.email || booking.customerEmail,
          newTierName: newTier.name,
          newTierColor: newTier.color,
          benefitDescription: newTier.benefitDescription,
          tenantName: tenant?.name || '',
        });
      }

      // Emit points earned event for email
      const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true, slug: true } });
      this.eventEmitter.emit(LoyaltyEvent.POINTS_EARNED, {
        tenantId,
        customerId: booking.customerId,
        customerName: booking.customer.name,
        customerEmail: booking.customer.email || booking.customerEmail,
        customerPhone: booking.customer.phone,
        points,
        totalBalance: result.balance.currentBalance,
        description,
        programName: program.programName,
        currencyPerPoint: Number(program.currencyPerPoint),
        tenantName: tenant?.name || '',
        tenantSlug: tenant?.slug || '',
      });

      this.logger.log(`Awarded ${points} points to customer ${booking.customerId} for booking ${booking.id}`);
    } catch (error) {
      this.logger.error(`Failed to process loyalty for booking: ${error.message}`, error.stack);
    }
  }
}
