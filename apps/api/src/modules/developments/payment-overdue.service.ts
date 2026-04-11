import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailNotificationsService } from '../notifications/email-notifications.service';

@Injectable()
export class PaymentOverdueService {
  private readonly logger = new Logger(PaymentOverdueService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailNotificationsService,
  ) {}

  @Cron('0 8 * * *') // Daily at 8 AM
  async markOverduePayments() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find pending payments that are overdue (with investor/project info for notification)
      const overduePayments = await this.prisma.investmentPayment.findMany({
        where: {
          status: 'pending',
          dueDate: { lt: today },
        },
        include: {
          investment: {
            include: {
              project: {
                include: {
                  tenant: { select: { name: true } },
                },
              },
              unit: { select: { unitIdentifier: true } },
            },
          },
        },
      });

      if (overduePayments.length === 0) return;

      // Mark as overdue
      const result = await this.prisma.investmentPayment.updateMany({
        where: {
          id: { in: overduePayments.map(p => p.id) },
        },
        data: { status: 'overdue' },
      });

      this.logger.log(`Marked ${result.count} payment(s) as overdue`);

      // Send email notifications
      for (const payment of overduePayments) {
        const inv = payment.investment;
        if (!inv.investorEmail) continue;

        try {
          await this.emailService.sendInvestmentPaymentOverdueEmail(
            inv.investorEmail,
            inv.investorName,
            inv.unit?.unitIdentifier || null,
            inv.project.name,
            payment.installmentNumber,
            Number(payment.amount) - Number(payment.paidAmount),
            payment.dueDate,
            inv.project.tenant.name,
          );
          this.logger.log(`Overdue notification sent to ${inv.investorEmail} for payment #${payment.installmentNumber}`);
        } catch (emailError) {
          this.logger.error(`Failed to send overdue email to ${inv.investorEmail}`, emailError);
        }
      }
    } catch (error) {
      this.logger.error('Error marking overdue payments', error);
    }
  }
}
