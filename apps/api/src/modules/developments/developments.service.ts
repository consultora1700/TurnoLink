import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import {
  CreateDevelopmentProjectDto,
  CreateMilestoneDto,
  CreateUnitDto,
  CreateInvestmentDto,
  MarkInvestmentPaymentDto,
  CreateReservationDto,
  CreatePaymentPlanDto,
  CreateDocumentDto,
} from './dto';

function toNumber(v: any): number {
  return v instanceof Decimal ? v.toNumber() : Number(v ?? 0);
}

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

@Injectable()
export class DevelopmentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ================== PROJECTS ==================

  async findAllProjects(tenantId: string) {
    const projects = await this.prisma.developmentProject.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { units: true, investments: true, milestones: true } },
      },
    });
    return projects.map(p => ({
      ...p,
      images: this.parseJson(p.images),
      amenities: this.parseJson(p.amenities),
      currentFundedAmount: toNumber(p.currentFundedAmount),
      targetFundingAmount: p.targetFundingAmount ? toNumber(p.targetFundingAmount) : null,
    }));
  }

  async findProjectById(tenantId: string, id: string) {
    const project = await this.prisma.developmentProject.findFirst({
      where: { tenantId, id },
      include: {
        milestones: { orderBy: { order: 'asc' } },
        units: { orderBy: { unitIdentifier: 'asc' } },
        investments: {
          orderBy: { createdAt: 'desc' },
          include: {
            unit: { select: { unitIdentifier: true } },
            payments: { orderBy: { installmentNumber: 'asc' } },
          },
        },
        paymentPlans: { orderBy: { createdAt: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!project) throw new NotFoundException('Proyecto no encontrado');

    return {
      ...project,
      images: this.parseJson(project.images),
      amenities: this.parseJson(project.amenities),
      milestones: project.milestones.map(m => ({ ...m, photos: this.parseJson(m.photos) })),
      currentFundedAmount: toNumber(project.currentFundedAmount),
      targetFundingAmount: project.targetFundingAmount ? toNumber(project.targetFundingAmount) : null,
      units: project.units.map(u => ({
        ...u,
        area: u.area ? toNumber(u.area) : null,
        price: u.price ? toNumber(u.price) : null,
        supCubierta: u.supCubierta ? toNumber(u.supCubierta) : null,
      })),
      investments: project.investments.map(inv => ({
        ...inv,
        totalAmount: toNumber(inv.totalAmount),
        paidAmount: toNumber(inv.paidAmount),
        downPaymentAmount: inv.downPaymentAmount ? toNumber(inv.downPaymentAmount) : null,
        payments: inv.payments.map(p => ({
          ...p,
          amount: toNumber(p.amount),
          paidAmount: toNumber(p.paidAmount),
          adjustedAmount: p.adjustedAmount ? toNumber(p.adjustedAmount) : null,
        })),
      })),
      paymentPlans: project.paymentPlans.map(p => ({
        ...p,
        discountPercent: p.discountPercent ? toNumber(p.discountPercent) : 0,
      })),
    };
  }

  async createProject(tenantId: string, dto: CreateDevelopmentProjectDto) {
    const slug = dto.slug || slugify(dto.name);
    // Ensure unique slug per tenant
    const existing = await this.prisma.developmentProject.findUnique({
      where: { tenantId_slug: { tenantId, slug } },
    });
    if (existing) throw new BadRequestException('Ya existe un proyecto con ese slug');

    return this.prisma.developmentProject.create({
      data: {
        tenantId,
        ...dto,
        slug,
        images: dto.images ? JSON.stringify(dto.images) : '[]',
        amenities: dto.amenities ? JSON.stringify(dto.amenities) : '[]',
      },
    });
  }

  async updateProject(tenantId: string, id: string, dto: Partial<CreateDevelopmentProjectDto>) {
    const project = await this.prisma.developmentProject.findFirst({ where: { tenantId, id } });
    if (!project) throw new NotFoundException('Proyecto no encontrado');

    const data: any = { ...dto };
    if (dto.images) data.images = JSON.stringify(dto.images);
    if (dto.amenities) data.amenities = JSON.stringify(dto.amenities);
    if (dto.slug && dto.slug !== project.slug) {
      const existing = await this.prisma.developmentProject.findUnique({
        where: { tenantId_slug: { tenantId, slug: dto.slug } },
      });
      if (existing) throw new BadRequestException('Ya existe un proyecto con ese slug');
    }

    return this.prisma.developmentProject.update({ where: { id }, data });
  }

  async deleteProject(tenantId: string, id: string) {
    const project = await this.prisma.developmentProject.findFirst({
      where: { tenantId, id },
      include: { investments: { select: { id: true } } },
    });
    if (!project) throw new NotFoundException('Proyecto no encontrado');
    if (project.investments.length > 0) {
      throw new BadRequestException('No se puede eliminar un proyecto con inversiones');
    }
    return this.prisma.developmentProject.delete({ where: { id } });
  }

  // ================== MILESTONES ==================

  async createMilestone(tenantId: string, projectId: string, dto: CreateMilestoneDto) {
    await this.validateProject(tenantId, projectId);
    const milestone = await this.prisma.projectMilestone.create({
      data: {
        projectId,
        ...dto,
        photos: dto.photos ? JSON.stringify(dto.photos) : '[]',
      },
    });
    // Recalculate project progress as average of milestones
    await this.recalculateProjectProgress(projectId);
    return milestone;
  }

  async updateMilestone(tenantId: string, projectId: string, milestoneId: string, dto: Partial<CreateMilestoneDto>) {
    await this.validateProject(tenantId, projectId);
    const data: any = { ...dto };
    if (dto.photos) data.photos = JSON.stringify(dto.photos);

    const milestone = await this.prisma.projectMilestone.update({
      where: { id: milestoneId },
      data,
    });
    await this.recalculateProjectProgress(projectId);
    return milestone;
  }

  async deleteMilestone(tenantId: string, projectId: string, milestoneId: string) {
    await this.validateProject(tenantId, projectId);
    await this.prisma.projectMilestone.delete({ where: { id: milestoneId } });
    await this.recalculateProjectProgress(projectId);
    return { message: 'Hito eliminado' };
  }

  private async recalculateProjectProgress(projectId: string) {
    const milestones = await this.prisma.projectMilestone.findMany({ where: { projectId } });
    if (milestones.length === 0) return;
    const avg = Math.round(milestones.reduce((s, m) => s + m.progressPercent, 0) / milestones.length);
    await this.prisma.developmentProject.update({ where: { id: projectId }, data: { progressPercent: avg } });
  }

  // ================== UNITS ==================

  async createUnit(tenantId: string, projectId: string, dto: CreateUnitDto) {
    await this.validateProject(tenantId, projectId);
    return this.prisma.projectUnit.create({ data: { projectId, ...dto } });
  }

  async updateUnit(tenantId: string, projectId: string, unitId: string, dto: Partial<CreateUnitDto>) {
    await this.validateProject(tenantId, projectId);
    return this.prisma.projectUnit.update({ where: { id: unitId }, data: dto });
  }

  async deleteUnit(tenantId: string, projectId: string, unitId: string) {
    await this.validateProject(tenantId, projectId);
    const unit = await this.prisma.projectUnit.findFirst({
      where: { id: unitId, projectId },
      include: { investments: { select: { id: true } } },
    });
    if (!unit) throw new NotFoundException('Unidad no encontrada');
    if (unit.investments.length > 0) {
      throw new BadRequestException('No se puede eliminar una unidad con inversiones');
    }
    return this.prisma.projectUnit.delete({ where: { id: unitId } });
  }

  // ================== RESERVATIONS ==================

  async reserveUnit(tenantId: string, projectId: string, unitId: string, dto: CreateReservationDto) {
    const project = await this.validateProject(tenantId, projectId);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (project.reservationDays || 30));

    // Use updateMany with WHERE status='available' to prevent race conditions
    const result = await this.prisma.projectUnit.updateMany({
      where: { id: unitId, projectId, status: 'available' },
      data: {
        status: 'reserved',
        reservedAt: new Date(),
        reservationExpiresAt: expiresAt,
        reservedByName: dto.reservedByName,
        reservedByPhone: dto.reservedByPhone || null,
        reservedByEmail: dto.reservedByEmail || null,
      },
    });
    if (result.count === 0) throw new BadRequestException('La unidad no está disponible para reserva');

    return this.prisma.projectUnit.findUnique({ where: { id: unitId } });
  }

  async cancelReservation(tenantId: string, projectId: string, unitId: string) {
    await this.validateProject(tenantId, projectId);
    return this.prisma.projectUnit.update({
      where: { id: unitId },
      data: {
        status: 'available',
        reservedAt: null,
        reservationExpiresAt: null,
        reservedByName: null,
        reservedByPhone: null,
        reservedByEmail: null,
      },
    });
  }

  // ================== INVESTMENTS ==================

  async createInvestment(tenantId: string, projectId: string, dto: CreateInvestmentDto) {
    await this.validateProject(tenantId, projectId);

    if (dto.unitId) {
      const unit = await this.prisma.projectUnit.findFirst({ where: { id: dto.unitId, projectId } });
      if (!unit) throw new BadRequestException('Unidad no encontrada');
      // Mark unit as reserved
      await this.prisma.projectUnit.update({ where: { id: dto.unitId }, data: { status: 'reserved' } });
    }

    // If paymentPlanId provided, look up the plan and use its parameters
    let totalInstallments = dto.totalInstallments || 1;
    let downPaymentPercent = 0;
    let downPaymentAmount = dto.downPaymentAmount || 0;

    if (dto.paymentPlanId) {
      const plan = await this.prisma.paymentPlan.findUnique({ where: { id: dto.paymentPlanId } });
      if (!plan) throw new BadRequestException('Plan de pago no encontrado');
      if (plan.projectId !== projectId) throw new BadRequestException('El plan no pertenece a este proyecto');
      totalInstallments = plan.installments;
      downPaymentPercent = plan.downPaymentPercent;
      if (!dto.downPaymentAmount) {
        downPaymentAmount = (dto.totalAmount * downPaymentPercent) / 100;
      }
    }

    const investmentData: any = {
      projectId,
      ...dto,
      totalInstallments,
      downPaymentAmount: downPaymentAmount || null,
    };
    // Remove fields not in the model directly
    delete investmentData.totalInstallments;

    const investment = await this.prisma.projectInvestment.create({
      data: {
        projectId,
        unitId: dto.unitId,
        investorName: dto.investorName,
        investorDni: dto.investorDni,
        investorPhone: dto.investorPhone,
        investorEmail: dto.investorEmail,
        totalAmount: dto.totalAmount,
        currency: dto.currency,
        totalInstallments,
        notes: dto.notes,
        paymentPlanId: dto.paymentPlanId || null,
        downPaymentAmount: downPaymentAmount || null,
        adjustmentType: dto.adjustmentType || null,
      },
    });

    // Generate installment payments
    const payments: any[] = [];

    if (downPaymentAmount > 0) {
      // Installment 0 = down payment (due immediately)
      payments.push({
        investmentId: investment.id,
        installmentNumber: 0,
        dueDate: new Date(),
        amount: downPaymentAmount,
        paidAmount: 0,
        status: 'pending',
      });
    }

    const remainingAmount = dto.totalAmount - downPaymentAmount;
    if (totalInstallments > 0 && remainingAmount > 0) {
      const installmentAmount = remainingAmount / totalInstallments;
      for (let i = 1; i <= totalInstallments; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        payments.push({
          investmentId: investment.id,
          installmentNumber: i,
          dueDate,
          amount: installmentAmount,
          paidAmount: 0,
          status: 'pending',
        });
      }
    }

    if (payments.length > 0) {
      await this.prisma.investmentPayment.createMany({ data: payments });
    }

    // Update project funded amount
    await this.recalculateFunding(projectId);

    return investment;
  }

  async markInvestmentPayment(tenantId: string, projectId: string, paymentId: string, dto: MarkInvestmentPaymentDto) {
    await this.validateProject(tenantId, projectId);

    const payment = await this.prisma.investmentPayment.findUnique({
      where: { id: paymentId },
      include: { investment: { select: { projectId: true } } },
    });
    if (!payment || payment.investment.projectId !== projectId) {
      throw new NotFoundException('Pago no encontrado');
    }

    const newPaid = toNumber(payment.paidAmount) + dto.paidAmount;
    const amount = toNumber(payment.amount);
    const status = newPaid >= amount ? 'paid' : newPaid > 0 ? 'partial' : 'pending';

    const updated = await this.prisma.investmentPayment.update({
      where: { id: paymentId },
      data: {
        paidAmount: newPaid,
        paidDate: dto.paidDate || new Date().toISOString(),
        paymentMethod: dto.paymentMethod,
        status,
        notes: dto.notes,
        receiptUrl: dto.receiptUrl || undefined,
      },
    });

    // Update investment paidAmount
    const allPayments = await this.prisma.investmentPayment.findMany({
      where: { investmentId: payment.investmentId },
    });
    const totalPaid = allPayments.reduce((s, p) => s + toNumber(p.paidAmount), 0);
    await this.prisma.projectInvestment.update({
      where: { id: payment.investmentId },
      data: { paidAmount: totalPaid },
    });

    // Check if all paid → mark unit as sold
    const investment = await this.prisma.projectInvestment.findUnique({ where: { id: payment.investmentId } });
    if (investment && totalPaid >= toNumber(investment.totalAmount) && investment.unitId) {
      await this.prisma.projectUnit.update({ where: { id: investment.unitId }, data: { status: 'sold' } });
      await this.prisma.projectInvestment.update({ where: { id: investment.id }, data: { status: 'completed' } });
    }

    // Recalculate project funding
    await this.recalculateFunding(projectId);

    return updated;
  }

  private async recalculateFunding(projectId: string) {
    const investments = await this.prisma.projectInvestment.findMany({
      where: { projectId, status: { in: ['active', 'completed'] } },
    });
    const total = investments.reduce((s, i) => s + toNumber(i.paidAmount), 0);
    await this.prisma.developmentProject.update({
      where: { id: projectId },
      data: { currentFundedAmount: total },
    });
  }

  // ================== PAYMENT PLANS ==================

  async findPaymentPlans(tenantId: string, projectId: string) {
    await this.validateProject(tenantId, projectId);
    const plans = await this.prisma.paymentPlan.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { investments: true } } },
    });
    return plans.map(p => ({
      ...p,
      discountPercent: p.discountPercent ? toNumber(p.discountPercent) : 0,
    }));
  }

  async createPaymentPlan(tenantId: string, projectId: string, dto: CreatePaymentPlanDto) {
    await this.validateProject(tenantId, projectId);
    return this.prisma.paymentPlan.create({ data: { projectId, ...dto } });
  }

  async updatePaymentPlan(tenantId: string, projectId: string, planId: string, dto: Partial<CreatePaymentPlanDto>) {
    await this.validateProject(tenantId, projectId);
    return this.prisma.paymentPlan.update({ where: { id: planId }, data: dto });
  }

  async deletePaymentPlan(tenantId: string, projectId: string, planId: string) {
    await this.validateProject(tenantId, projectId);
    const count = await this.prisma.projectInvestment.count({ where: { paymentPlanId: planId } });
    if (count > 0) throw new BadRequestException('No se puede eliminar un plan con inversiones asociadas');
    return this.prisma.paymentPlan.delete({ where: { id: planId } });
  }

  async findPublicPaymentPlans(tenantSlug: string, projectSlug: string) {
    const tenant = await this.prisma.tenant.findFirst({ where: { slug: tenantSlug, status: 'ACTIVE' } });
    if (!tenant) throw new NotFoundException('Negocio no encontrado');
    const project = await this.prisma.developmentProject.findFirst({
      where: { tenantId: tenant.id, slug: projectSlug, isActive: true },
    });
    if (!project) throw new NotFoundException('Proyecto no encontrado');
    const plans = await this.prisma.paymentPlan.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'asc' },
    });
    return plans.map(p => ({
      ...p,
      discountPercent: p.discountPercent ? toNumber(p.discountPercent) : 0,
    }));
  }

  // ================== DOCUMENTS ==================

  async findDocuments(tenantId: string, projectId: string, unitId?: string, investmentId?: string) {
    await this.validateProject(tenantId, projectId);
    const where: any = { projectId };
    if (unitId) where.unitId = unitId;
    if (investmentId) where.investmentId = investmentId;
    return this.prisma.projectDocument.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async createDocument(tenantId: string, projectId: string, dto: CreateDocumentDto) {
    await this.validateProject(tenantId, projectId);
    return this.prisma.projectDocument.create({ data: { projectId, ...dto } });
  }

  async deleteDocument(tenantId: string, projectId: string, documentId: string) {
    await this.validateProject(tenantId, projectId);
    return this.prisma.projectDocument.delete({ where: { id: documentId } });
  }

  // ================== PUBLIC (for public page) ==================

  async findPublicProject(tenantSlug: string, projectSlug: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug }, select: { id: true, status: true } });
    if (!tenant || tenant.status !== 'ACTIVE') throw new NotFoundException('Negocio no encontrado');

    const project = await this.prisma.developmentProject.findUnique({
      where: { tenantId_slug: { tenantId: tenant.id, slug: projectSlug } },
      include: {
        milestones: { orderBy: { order: 'asc' } },
        units: {
          orderBy: { unitIdentifier: 'asc' },
          select: {
            id: true, unitIdentifier: true, unitType: true, floor: true,
            orientation: true, area: true, price: true, currency: true, status: true,
            supCubierta: true, floorPlanUrl: true, reservedAt: true, reservationExpiresAt: true,
          },
        },
        paymentPlans: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!project || !project.isActive) throw new NotFoundException('Proyecto no encontrado');

    return {
      name: project.name,
      slug: project.slug,
      description: project.description,
      address: project.address,
      city: project.city,
      totalUnits: project.totalUnits,
      progressPercent: project.progressPercent,
      status: project.status,
      targetFundingAmount: project.targetFundingAmount ? toNumber(project.targetFundingAmount) : null,
      currentFundedAmount: toNumber(project.currentFundedAmount),
      coverImage: project.coverImage,
      images: this.parseJson(project.images),
      brochureUrl: project.brochureUrl,
      videoUrl: project.videoUrl,
      latitude: project.latitude ? toNumber(project.latitude) : null,
      longitude: project.longitude ? toNumber(project.longitude) : null,
      amenities: this.parseJson(project.amenities),
      deliveryDate: project.deliveryDate,
      adjustmentType: project.adjustmentType,
      milestones: project.milestones.map(m => ({
        name: m.name,
        description: m.description,
        progressPercent: m.progressPercent,
        targetDate: m.targetDate,
        completionDate: m.completionDate,
        photos: this.parseJson(m.photos),
      })),
      units: project.units.map(u => ({
        ...u,
        area: u.area ? toNumber(u.area) : null,
        price: u.price ? toNumber(u.price) : null,
        supCubierta: u.supCubierta ? toNumber(u.supCubierta) : null,
      })),
      paymentPlans: project.paymentPlans.map(p => ({
        ...p,
        discountPercent: p.discountPercent ? toNumber(p.discountPercent) : 0,
      })),
    };
  }

  async findPublicProjects(tenantSlug: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug }, select: { id: true, status: true } });
    if (!tenant || tenant.status !== 'ACTIVE') throw new NotFoundException('Negocio no encontrado');

    const projects = await this.prisma.developmentProject.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        name: true, slug: true, description: true, address: true, city: true,
        progressPercent: true, status: true, coverImage: true, totalUnits: true,
        deliveryDate: true, latitude: true, longitude: true,
        _count: { select: { units: true } },
      },
    });

    return projects;
  }

  // ================== HELPERS ==================

  private async validateProject(tenantId: string, projectId: string) {
    const project = await this.prisma.developmentProject.findFirst({ where: { tenantId, id: projectId } });
    if (!project) throw new NotFoundException('Proyecto no encontrado');
    return project;
  }

  private parseJson(value: any): any[] {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return []; }
    }
    return [];
  }
}
