import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { CreatePropertyDepositDto } from './dto/create-property-deposit.dto';
import { CreateGuaranteeRecordDto } from './dto/create-guarantee-record.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============ LEADS ============

  async getLeadStats(tenantId: string) {
    const [total, byStage, bySrc, followUpsToday] = await Promise.all([
      this.prisma.lead.count({ where: { tenantId } }),
      this.prisma.lead.groupBy({
        by: ['stage'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.lead.groupBy({
        by: ['source'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.lead.count({
        where: {
          tenantId,
          nextFollowUpAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);

    return {
      total,
      byStage: Object.fromEntries(byStage.map(s => [s.stage, s._count])),
      bySource: Object.fromEntries(bySrc.map(s => [s.source, s._count])),
      followUpsToday,
    };
  }

  async findAllLeads(tenantId: string, filters?: { stage?: string; source?: string; assignedTo?: string }) {
    const where: any = { tenantId };
    if (filters?.stage) where.stage = filters.stage;
    if (filters?.source) where.source = filters.source;
    if (filters?.assignedTo) where.assignedTo = filters.assignedTo;

    return this.prisma.lead.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { nextFollowUpAt: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findLeadById(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({ where: { id, tenantId } });
    if (!lead) throw new NotFoundException('Lead no encontrado');
    return lead;
  }

  async createLead(tenantId: string, dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: { tenantId, ...dto },
    });
  }

  async updateLead(tenantId: string, id: string, dto: Partial<CreateLeadDto>) {
    await this.findLeadById(tenantId, id);
    const data: any = { ...dto };
    // If stage changes, update lastContactAt
    if (dto.stage) data.lastContactAt = new Date();
    return this.prisma.lead.update({ where: { id }, data });
  }

  async deleteLead(tenantId: string, id: string) {
    await this.findLeadById(tenantId, id);
    return this.prisma.lead.delete({ where: { id } });
  }

  // ============ PROPERTY DEPOSITS / SEÑAS ============

  async findAllDeposits(tenantId: string, status?: string) {
    const where: any = { tenantId };
    if (status) where.status = status;
    return this.prisma.propertyDeposit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findDepositById(tenantId: string, id: string) {
    const dep = await this.prisma.propertyDeposit.findFirst({ where: { id, tenantId } });
    if (!dep) throw new NotFoundException('Seña no encontrada');
    return dep;
  }

  async createDeposit(tenantId: string, dto: CreatePropertyDepositDto) {
    return this.prisma.propertyDeposit.create({
      data: { tenantId, ...dto },
    });
  }

  async updateDeposit(tenantId: string, id: string, dto: Partial<CreatePropertyDepositDto>) {
    await this.findDepositById(tenantId, id);
    return this.prisma.propertyDeposit.update({ where: { id }, data: dto });
  }

  async deleteDeposit(tenantId: string, id: string) {
    await this.findDepositById(tenantId, id);
    return this.prisma.propertyDeposit.delete({ where: { id } });
  }

  // ============ GUARANTEE RECORDS ============

  async findAllGuarantees(tenantId: string, status?: string) {
    const where: any = { tenantId };
    if (status) where.status = status;
    return this.prisma.guaranteeRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findGuaranteeById(tenantId: string, id: string) {
    const g = await this.prisma.guaranteeRecord.findFirst({ where: { id, tenantId } });
    if (!g) throw new NotFoundException('Garantía no encontrada');
    return g;
  }

  async findGuaranteesByContract(tenantId: string, contractId: string) {
    return this.prisma.guaranteeRecord.findMany({
      where: { tenantId, contractId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createGuarantee(tenantId: string, dto: CreateGuaranteeRecordDto) {
    return this.prisma.guaranteeRecord.create({
      data: { tenantId, ...dto },
    });
  }

  async updateGuarantee(tenantId: string, id: string, dto: Partial<CreateGuaranteeRecordDto>) {
    await this.findGuaranteeById(tenantId, id);
    return this.prisma.guaranteeRecord.update({ where: { id }, data: dto });
  }

  async deleteGuarantee(tenantId: string, id: string) {
    await this.findGuaranteeById(tenantId, id);
    return this.prisma.guaranteeRecord.delete({ where: { id } });
  }

  async getExpiringGuarantees(tenantId: string, daysAhead = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    return this.prisma.guaranteeRecord.findMany({
      where: {
        tenantId,
        status: 'active',
        expirationDate: { lte: futureDate, gte: new Date() },
      },
      orderBy: { expirationDate: 'asc' },
    });
  }
}
