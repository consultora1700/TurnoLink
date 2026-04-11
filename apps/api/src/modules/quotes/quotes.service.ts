import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(private readonly prisma: PrismaService) {}

  private serializeQuote(quote: any) {
    return {
      ...quote,
      subtotal: quote.subtotal ? Number(quote.subtotal) : 0,
      discount: quote.discount ? Number(quote.discount) : 0,
      total: quote.total ? Number(quote.total) : 0,
      items: quote.items?.map((item: any) => ({
        ...item,
        unitPrice: item.unitPrice ? Number(item.unitPrice) : 0,
        totalPrice: item.totalPrice ? Number(item.totalPrice) : 0,
      })),
    };
  }

  // ─── List quotes ─────────────────────────────────────────
  async getQuotes(tenantId: string, opts?: { status?: string; page?: number; limit?: number }) {
    const page = opts?.page || 1;
    const limit = Math.min(opts?.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (opts?.status) where.status = opts.status;

    const [data, total] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        include: {
          items: { orderBy: { position: 'asc' } },
          customer: { select: { id: true, name: true, phone: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.quote.count({ where }),
    ]);

    return {
      data: data.map((q) => this.serializeQuote(q)),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Get single quote ───────────────────────────────────
  async getQuote(tenantId: string, id: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, tenantId },
      include: {
        items: {
          orderBy: { position: 'asc' },
          include: {
            service: { select: { id: true, name: true, price: true, duration: true } },
            product: { select: { id: true, name: true, price: true, images: { select: { url: true }, take: 1 } } },
          },
        },
        customer: { select: { id: true, name: true, phone: true, email: true } },
      },
    });

    if (!quote) throw new NotFoundException('Presupuesto no encontrado');
    return this.serializeQuote(quote);
  }

  // ─── Create quote ──────────────────────────────────────
  async createQuote(tenantId: string, dto: CreateQuoteDto) {
    return this.prisma.$transaction(async (tx) => {
      // Generate sequential quote number
      const tenantHash = Buffer.from(tenantId).reduce((acc, b) => acc + b, 0);
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${tenantHash + 9999})`;
      const [{ next_num }] = await tx.$queryRaw<[{ next_num: bigint }]>`
        SELECT COALESCE(MAX(
          CAST(REGEXP_REPLACE("quoteNumber", '^#PR-', '') AS INTEGER)
        ), 0) + 1 AS next_num
        FROM quotes
        WHERE "tenantId" = ${tenantId}
          AND "quoteNumber" ~ '^#PR-[0-9]+$'
      `;
      const quoteNumber = `#PR-${String(Number(next_num)).padStart(4, '0')}`;

      // Calculate totals
      const items = dto.items.map((item, i) => ({
        type: item.type,
        serviceId: item.type === 'SERVICE' ? item.serviceId : null,
        productId: item.type === 'PRODUCT' ? item.productId : null,
        name: item.name,
        description: item.description || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        position: i,
      }));

      const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
      const discount = dto.discount || 0;
      const total = Math.max(subtotal - discount, 0);

      // Calculate validUntil
      const validDays = dto.validDays || 15;
      const validUntil = dto.validUntil
        ? new Date(dto.validUntil)
        : new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);

      const quote = await tx.quote.create({
        data: {
          tenantId,
          quoteNumber,
          customerId: dto.customerId || null,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone || null,
          customerEmail: dto.customerEmail || null,
          title: dto.title || null,
          notes: dto.notes || null,
          internalNotes: dto.internalNotes || null,
          terms: dto.terms || null,
          subtotal,
          discount,
          total,
          validDays,
          validUntil,
          items: {
            create: items,
          },
        },
        include: {
          items: { orderBy: { position: 'asc' } },
          customer: { select: { id: true, name: true, phone: true, email: true } },
        },
      });

      this.logger.log(`Quote ${quoteNumber} created for tenant ${tenantId}`);
      return this.serializeQuote(quote);
    });
  }

  // ─── Update quote (only DRAFT) ─────────────────────────
  async updateQuote(tenantId: string, id: string, dto: CreateQuoteDto) {
    const existing = await this.prisma.quote.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Presupuesto no encontrado');
    if (existing.status !== 'DRAFT') {
      throw new BadRequestException('Solo se pueden editar presupuestos en borrador');
    }

    // Recalculate
    const items = dto.items.map((item, i) => ({
      type: item.type,
      serviceId: item.type === 'SERVICE' ? item.serviceId : null,
      productId: item.type === 'PRODUCT' ? item.productId : null,
      name: item.name,
      description: item.description || null,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
      position: i,
    }));

    const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
    const discount = dto.discount || 0;
    const total = Math.max(subtotal - discount, 0);
    const validDays = dto.validDays || existing.validDays;
    const validUntil = dto.validUntil
      ? new Date(dto.validUntil)
      : new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);

    // Delete old items and create new ones
    await this.prisma.quoteItem.deleteMany({ where: { quoteId: id } });

    const quote = await this.prisma.quote.update({
      where: { id },
      data: {
        customerId: dto.customerId || null,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone || null,
        customerEmail: dto.customerEmail || null,
        title: dto.title || null,
        notes: dto.notes || null,
        internalNotes: dto.internalNotes || null,
        terms: dto.terms || null,
        subtotal,
        discount,
        total,
        validDays,
        validUntil,
        items: { create: items },
      },
      include: {
        items: { orderBy: { position: 'asc' } },
        customer: { select: { id: true, name: true, phone: true, email: true } },
      },
    });

    return this.serializeQuote(quote);
  }

  // ─── Update status ─────────────────────────────────────
  async updateStatus(tenantId: string, id: string, status: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, tenantId },
    });
    if (!quote) throw new NotFoundException('Presupuesto no encontrado');

    const validTransitions: Record<string, string[]> = {
      DRAFT: ['SENT', 'EXPIRED'],
      SENT: ['VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
      VIEWED: ['ACCEPTED', 'REJECTED', 'EXPIRED'],
    };

    const allowed = validTransitions[quote.status] || [];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `No se puede cambiar de ${quote.status} a ${status}`,
      );
    }

    const data: any = { status };
    if (status === 'SENT' && !quote.sentAt) data.sentAt = new Date();
    if (status === 'ACCEPTED' || status === 'REJECTED') data.respondedAt = new Date();

    const updated = await this.prisma.quote.update({
      where: { id },
      data,
      include: {
        items: { orderBy: { position: 'asc' } },
        customer: { select: { id: true, name: true, phone: true, email: true } },
      },
    });

    return this.serializeQuote(updated);
  }

  // ─── Delete quote (only DRAFT) ─────────────────────────
  async deleteQuote(tenantId: string, id: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, tenantId },
    });
    if (!quote) throw new NotFoundException('Presupuesto no encontrado');
    if (quote.status !== 'DRAFT') {
      throw new BadRequestException('Solo se pueden eliminar presupuestos en borrador');
    }

    await this.prisma.quote.delete({ where: { id } });
    return { success: true };
  }

  // ─── Public: get quote by token ────────────────────────
  async getPublicQuote(token: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { publicToken: token },
      include: {
        tenant: { select: { id: true, name: true, slug: true, logo: true, phone: true, address: true, city: true, instagram: true } },
        items: {
          orderBy: { position: 'asc' },
          include: {
            service: { select: { id: true, name: true, duration: true } },
            product: { select: { id: true, name: true, images: { select: { url: true }, take: 1 } } },
          },
        },
      },
    });

    if (!quote) throw new NotFoundException('Presupuesto no encontrado');

    // Mark as viewed if SENT
    if (quote.status === 'SENT') {
      await this.prisma.quote.update({
        where: { id: quote.id },
        data: { status: 'VIEWED', viewedAt: new Date() },
      });
      quote.status = 'VIEWED';
      (quote as any).viewedAt = new Date();
    }

    return this.serializeQuote(quote);
  }

  // ─── Public: respond to quote ──────────────────────────
  async respondToQuote(token: string, action: 'ACCEPTED' | 'REJECTED') {
    const quote = await this.prisma.quote.findUnique({
      where: { publicToken: token },
    });

    if (!quote) throw new NotFoundException('Presupuesto no encontrado');
    if (!['SENT', 'VIEWED'].includes(quote.status)) {
      throw new BadRequestException('Este presupuesto ya fue respondido o expiró');
    }

    // Check expiration
    if (quote.validUntil && new Date() > quote.validUntil) {
      await this.prisma.quote.update({
        where: { id: quote.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Este presupuesto ha expirado');
    }

    const updated = await this.prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: action,
        respondedAt: new Date(),
        viewedAt: quote.viewedAt || new Date(),
      },
      include: {
        tenant: { select: { name: true } },
        items: { orderBy: { position: 'asc' } },
      },
    });

    return this.serializeQuote(updated);
  }

  // ─── Stats ─────────────────────────────────────────────
  async getStats(tenantId: string) {
    const [total, draft, sent, accepted, rejected, expired] = await Promise.all([
      this.prisma.quote.count({ where: { tenantId } }),
      this.prisma.quote.count({ where: { tenantId, status: 'DRAFT' } }),
      this.prisma.quote.count({ where: { tenantId, status: { in: ['SENT', 'VIEWED'] } } }),
      this.prisma.quote.count({ where: { tenantId, status: 'ACCEPTED' } }),
      this.prisma.quote.count({ where: { tenantId, status: 'REJECTED' } }),
      this.prisma.quote.count({ where: { tenantId, status: 'EXPIRED' } }),
    ]);

    // Total quoted value (accepted)
    const acceptedTotal = await this.prisma.quote.aggregate({
      where: { tenantId, status: 'ACCEPTED' },
      _sum: { total: true },
    });

    return {
      total,
      draft,
      sent,
      accepted,
      rejected,
      expired,
      acceptanceRate: sent + accepted + rejected > 0
        ? Math.round((accepted / (sent + accepted + rejected)) * 100)
        : 0,
      totalAcceptedValue: Number(acceptedTotal._sum.total || 0),
    };
  }
}
