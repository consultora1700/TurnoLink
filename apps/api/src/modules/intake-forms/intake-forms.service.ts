import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIntakeFormDto } from './dto/create-intake-form.dto';
import { UpdateIntakeFormDto } from './dto/update-intake-form.dto';

@Injectable()
export class IntakeFormsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateIntakeFormDto) {
    return this.prisma.intakeForm.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        fields: JSON.stringify(dto.fields),
        isActive: dto.isActive ?? true,
        order: dto.order ?? 0,
      },
    });
  }

  async findAll(tenantId: string) {
    const forms = await this.prisma.intakeForm.findMany({
      where: { tenantId },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            services: true,
            submissions: true,
          },
        },
      },
    });
    return forms.map((f) => ({
      ...f,
      fields: typeof f.fields === 'string' ? JSON.parse(f.fields) : f.fields,
    }));
  }

  async findById(tenantId: string, id: string) {
    const form = await this.prisma.intakeForm.findFirst({
      where: { id, tenantId },
      include: {
        services: { select: { id: true, name: true } },
        _count: { select: { submissions: true } },
      },
    });
    if (!form) throw new NotFoundException('Formulario no encontrado');
    return {
      ...form,
      fields: typeof form.fields === 'string' ? JSON.parse(form.fields) : form.fields,
    };
  }

  async update(tenantId: string, id: string, dto: UpdateIntakeFormDto) {
    await this.findById(tenantId, id);
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.fields !== undefined) data.fields = JSON.stringify(dto.fields);
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.order !== undefined) data.order = dto.order;

    return this.prisma.intakeForm.update({ where: { id }, data });
  }

  async delete(tenantId: string, id: string) {
    const form = await this.findById(tenantId, id);
    if ((form._count?.submissions || 0) > 0) {
      // Soft-delete: just deactivate
      return this.prisma.intakeForm.update({
        where: { id },
        data: { isActive: false },
      });
    }
    return this.prisma.intakeForm.delete({ where: { id } });
  }

  // Get submissions for a form
  async getSubmissions(tenantId: string, formId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [submissions, total] = await Promise.all([
      this.prisma.intakeSubmission.findMany({
        where: { tenantId, intakeFormId: formId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          booking: { select: { id: true, date: true, startTime: true } },
        },
      }),
      this.prisma.intakeSubmission.count({ where: { tenantId, intakeFormId: formId } }),
    ]);

    return {
      data: submissions.map((s) => ({
        ...s,
        data: typeof s.data === 'string' ? JSON.parse(s.data) : s.data,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // Create a submission (used during booking)
  async createSubmission(tenantId: string, formId: string, data: Record<string, unknown>, bookingId?: string, customerId?: string) {
    return this.prisma.intakeSubmission.create({
      data: {
        tenantId,
        intakeFormId: formId,
        bookingId: bookingId || null,
        customerId: customerId || null,
        data: JSON.stringify(data),
      },
    });
  }
}
