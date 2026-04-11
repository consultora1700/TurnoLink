import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { pickRandomPickupWord, getPickupWordOptions } from './pickup-words';

// ─── Delivery state machine ─────────────────────────
// Transitions a delivery person can perform via the public token endpoint
const DELIVERY_NEXT: Record<string, string | null> = {
  READY: 'SHIPPED',     // "Retiré el pedido"
  SHIPPED: 'ARRIVED',   // "Llegué"
  ARRIVED: 'DELIVERED', // "Entregué"
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private serializeOrder(order: any) {
    return {
      ...order,
      subtotal: order.subtotal ? Number(order.subtotal) : 0,
      shippingCost: order.shippingCost ? Number(order.shippingCost) : 0,
      discount: order.discount ? Number(order.discount) : 0,
      tax: order.tax ? Number(order.tax) : 0,
      total: order.total ? Number(order.total) : 0,
      items: order.items?.map((item: any) => ({
        ...item,
        unitPrice: item.unitPrice ? Number(item.unitPrice) : 0,
        totalPrice: item.totalPrice ? Number(item.totalPrice) : 0,
      })),
      payments: order.payments?.map((p: any) => ({
        ...p,
        amount: p.amount ? Number(p.amount) : 0,
      })),
    };
  }

  // ─── Create Order (Public Checkout) ─────────────────────────────

  async createOrder(tenantId: string, dto: CreateOrderDto, options?: { initialStatus?: string }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Generate sequential order number (atomic to prevent race conditions)
      // Use advisory lock to prevent concurrent order creation for the same tenant
      const tenantHash = Buffer.from(tenantId).reduce((acc, b) => acc + b, 0);
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${tenantHash})`;
      const [{ next_num }] = await tx.$queryRaw<[{ next_num: bigint }]>`
        SELECT COALESCE(MAX(
          CAST(REGEXP_REPLACE("orderNumber", '^#TL-', '') AS INTEGER)
        ), 0) + 1 AS next_num
        FROM orders
        WHERE "tenantId" = ${tenantId}
          AND "orderNumber" ~ '^#TL-[0-9]+$'
      `;
      const orderNumber = `#TL-${String(Number(next_num)).padStart(4, '0')}`;

      // 2. Validate products: exist, active, belong to tenant
      const productIds = dto.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, tenantId, isActive: true },
        include: { variants: true },
      });

      if (products.length !== productIds.length) {
        const foundIds = new Set(products.map((p) => p.id));
        const missing = productIds.filter((id) => !foundIds.has(id));
        throw new BadRequestException(`Productos no encontrados o inactivos: ${missing.join(', ')}`);
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      // 3. Validate stock and build order items
      const orderItems: {
        productId: string;
        variantId: string | null;
        productName: string;
        variantName: string | null;
        sku: string | null;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }[] = [];

      for (const item of dto.items) {
        const product = productMap.get(item.productId)!;
        let unitPrice = Number(product.price);
        let variantName: string | null = null;
        let sku = product.sku;
        let stockSource: { stock: number; id: string; type: 'product' | 'variant' } | null = null;

        if (item.variantId) {
          const variant = product.variants.find((v) => v.id === item.variantId);
          if (!variant) {
            throw new BadRequestException(`Variante ${item.variantId} no encontrada para ${product.name}`);
          }
          unitPrice = variant.price ? Number(variant.price) : unitPrice;
          variantName = variant.name;
          sku = variant.sku || sku;
          if (product.trackInventory) {
            stockSource = { stock: variant.stock, id: variant.id, type: 'variant' };
          }
        } else if (product.trackInventory) {
          stockSource = { stock: product.stock, id: product.id, type: 'product' };
        }

        // Validate stock
        if (stockSource && stockSource.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para "${product.name}". Disponible: ${stockSource.stock}, solicitado: ${item.quantity}`,
          );
        }

        orderItems.push({
          productId: product.id,
          variantId: item.variantId || null,
          productName: product.name,
          variantName,
          sku,
          quantity: item.quantity,
          unitPrice,
          totalPrice: unitPrice * item.quantity,
        });
      }

      // 4. Calculate subtotal
      const subtotal = orderItems.reduce((sum, i) => sum + i.totalPrice, 0);

      // 5. Validate coupon if provided
      let discount = 0;
      let couponId: string | null = null;
      let couponCode: string | null = null;

      if (dto.couponCode) {
        const couponResult = await this.validateCouponInternal(tx, tenantId, dto.couponCode, subtotal);
        discount = couponResult.discount;
        couponId = couponResult.couponId;
        couponCode = dto.couponCode;
      }

      const total = Math.max(0, subtotal - discount);

      // 6. Upsert Customer by tenantId + phone
      const customer = await tx.customer.upsert({
        where: {
          tenantId_phone: { tenantId, phone: dto.customer.phone },
        },
        create: {
          tenantId,
          name: dto.customer.name,
          email: dto.customer.email,
          phone: dto.customer.phone,
        },
        update: {
          name: dto.customer.name,
          email: dto.customer.email,
        },
      });

      // 7. Build shipping address (includes method for all types)
      const shippingMethod = dto.shipping?.method || (dto.orderType === 'DELIVERY' ? 'envio' : 'retiro');
      const shippingAddress = JSON.stringify({
        method: shippingMethod,
        ...(shippingMethod === 'envio' ? {
          address: dto.shipping?.formattedAddress || dto.shipping?.address,
          city: dto.shipping?.city,
          province: dto.shipping?.province,
          postalCode: dto.shipping?.postalCode,
          lat: dto.shipping?.lat,
          lng: dto.shipping?.lng,
          placeId: dto.shipping?.placeId,
        } : {}),
      });

      // 8. Create Order + OrderItems
      // Build item options map from DTO
      const itemOptionsMap = new Map<string, { options?: string; itemNotes?: string }>();
      for (const dtoItem of dto.items) {
        itemOptionsMap.set(dtoItem.productId + (dtoItem.variantId || ''), {
          options: dtoItem.options,
          itemNotes: dtoItem.itemNotes,
        });
      }

      // Gastro flow: si no hay paymentMethod, el cliente lo elegirá DESPUÉS
      // de que el comercio acepte el pedido.
      const awaitingPayment = !dto.paymentMethod && (dto.orderType === 'DELIVERY' || dto.orderType === 'TAKE_AWAY' || dto.orderType === 'DINE_IN');

      // Pickup word for delivery confirmation (short keyword the customer tells the courier)
      const pickupWord = dto.orderType === 'DELIVERY' ? pickRandomPickupWord() : null;

      const order = await tx.order.create({
        data: {
          tenantId,
          orderNumber,
          customerId: customer.id,
          customerName: dto.customer.name,
          customerEmail: dto.customer.email || '',
          customerPhone: dto.customer.phone,
          status: options?.initialStatus || 'PENDING',
          awaitingPayment,
          pickupWord,
          orderType: dto.orderType || null,
          tableNumber: dto.tableNumber || null,
          subtotal,
          shippingCost: 0,
          discount,
          tax: 0,
          total,
          shippingAddress,
          couponId,
          couponCode,
          notes: dto.notes,
          items: {
            create: orderItems.map((item) => {
              const extra = itemOptionsMap.get(item.productId + (item.variantId || ''));
              return {
                productId: item.productId,
                variantId: item.variantId,
                productName: item.productName,
                variantName: item.variantName,
                sku: item.sku,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                options: extra?.options || null,
                itemNotes: extra?.itemNotes || null,
              };
            }),
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      // 9. Decrement stock
      for (const item of dto.items) {
        const product = productMap.get(item.productId)!;
        if (!product.trackInventory) continue;

        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // 10. Create OrderStatusHistory
      const effectiveStatus = options?.initialStatus || 'PENDING';
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: effectiveStatus,
          note: effectiveStatus === 'DELIVERED' ? 'Venta presencial (POS)' : 'Pedido creado',
        },
      });

      // 11. Create Payment record (skip if awaitingPayment — created when customer chooses)
      if (!awaitingPayment) {
        const paymentStatus = effectiveStatus === 'DELIVERED' ? 'APPROVED' : 'PENDING';
        await tx.payment.create({
          data: {
            orderId: order.id,
            amount: total,
            currency: 'ARS',
            status: paymentStatus,
            paymentMethod: dto.paymentMethod,
          },
        });
      }

      // 12. Register CouponUsage if applicable
      if (couponId) {
        await tx.couponUsage.create({
          data: {
            couponId,
            orderId: order.id,
            customerId: customer.id,
          },
        });
        await tx.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      // Refetch full order for response
      const fullOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: true,
          payments: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
      });

      // 13. Emit order.created event (async, outside transaction)
      setTimeout(() => {
        this.eventEmitter.emit('order.created', {
          order: fullOrder,
          tenantId,
          paymentMethod: dto.paymentMethod,
          customer: {
            name: dto.customer.name,
            email: dto.customer.email,
            phone: dto.customer.phone,
          },
        });
      }, 0);

      return this.serializeOrder(fullOrder);
    }, { timeout: 30000 });
  }

  // ─── Validate Coupon (Public) ───────────────────────────────────

  async validateCoupon(tenantId: string, code: string, subtotal: number) {
    try {
      const result = await this.validateCouponInternal(this.prisma, tenantId, code, subtotal);
      return {
        valid: true,
        discount: result.discount,
        discountType: result.discountType,
        discountValue: result.discountValue,
        message: `Descuento de $${result.discount.toLocaleString('es-AR')} aplicado`,
      };
    } catch (error) {
      return {
        valid: false,
        discount: 0,
        message: error instanceof BadRequestException ? error.message : 'Cupón inválido',
      };
    }
  }

  private async validateCouponInternal(
    tx: any,
    tenantId: string,
    code: string,
    subtotal: number,
  ): Promise<{ discount: number; couponId: string; discountType: string; discountValue: number }> {
    const coupon = await tx.coupon.findFirst({
      where: { tenantId, code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new BadRequestException('Cupón no encontrado');
    }

    if (!coupon.isActive) {
      throw new BadRequestException('Este cupón no está activo');
    }

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      throw new BadRequestException('Este cupón aún no es válido');
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      throw new BadRequestException('Este cupón ha expirado');
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('Este cupón ha alcanzado su límite de uso');
    }

    if (coupon.minPurchase && subtotal < Number(coupon.minPurchase)) {
      throw new BadRequestException(
        `Compra mínima de $${Number(coupon.minPurchase).toLocaleString('es-AR')} requerida`,
      );
    }

    // Calculate discount
    const discountValue = Number(coupon.discountValue);
    let discount: number;

    if (coupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * discountValue) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else {
      // FIXED
      discount = discountValue;
    }

    discount = Math.min(discount, subtotal); // Can't discount more than subtotal

    return { discount, couponId: coupon.id, discountType: coupon.discountType, discountValue };
  }

  // ─── Get Order by Number (Public) ───────────────────────────────

  async getOrderByNumber(tenantId: string, orderNumber: string) {
    const order = await this.prisma.order.findFirst({
      where: { tenantId, orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  select: { url: true, alt: true },
                  orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }],
                  take: 1,
                },
              },
            },
          },
        },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        payments: {
          select: {
            id: true,
            status: true,
            amount: true,
            paymentMethod: true,
            paidAt: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // Enrich items with product image
    const enriched = {
      ...order,
      items: order.items?.map((item: any) => ({
        ...item,
        productImage: item.product?.images?.[0]?.url || null,
      })),
    };

    return this.serializeOrder(enriched);
  }

  // ─── Existing Methods ──────────────────────────────────────────

  async getOrders(
    tenantId: string,
    filters?: { status?: string; page?: number; limit?: number; date?: string },
  ) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100); // Cap at 100 per page
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.date) {
      const dayStart = new Date(filters.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(filters.date);
      dayEnd.setHours(23, 59, 59, 999);
      where.createdAt = { gte: dayStart, lte: dayEnd };
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { items: true } },
          items: {
            select: {
              id: true,
              productName: true,
              variantName: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
              itemNotes: true,
              options: true,
            },
          },
          payments: {
            select: { id: true, status: true, amount: true, paymentMethod: true },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          deliveryEmployee: {
            select: { id: true, name: true, phone: true, deliveryVehicle: true, image: true },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders.map((order) => this.serializeOrder(order)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrder(tenantId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true, name: true, slug: true,
                images: { select: { url: true }, where: { isPrimary: true }, take: 1 },
              },
            },
            variant: { select: { id: true, name: true, sku: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        payments: true,
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return this.serializeOrder(order);
  }

  async getOrderStats(tenantId: string) {
    // Single GROUP BY query replaces 6 individual counts + 1 aggregate
    const [statusCounts, recentOrders] = await Promise.all([
      this.prisma.$queryRaw<
        { status: string; count: bigint; revenue: number | null }[]
      >`
        SELECT status,
               COUNT(*)::bigint AS count,
               CASE WHEN status = 'DELIVERED' THEN SUM(total) ELSE NULL END AS revenue
        FROM orders
        WHERE "tenantId" = ${tenantId}
        GROUP BY status
      `,
      this.prisma.order.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          status: true,
          total: true,
          createdAt: true,
        },
      }),
    ]);

    const countMap = new Map(
      statusCounts.map((r) => [r.status, Number(r.count)]),
    );
    const deliveredRow = statusCounts.find((r) => r.status === 'DELIVERED');

    return {
      totalOrders: statusCounts.reduce((sum, r) => sum + Number(r.count), 0),
      pendingOrders: countMap.get('PENDING') || 0,
      confirmedOrders: countMap.get('CONFIRMED') || 0,
      shippedOrders: countMap.get('SHIPPED') || 0,
      deliveredOrders: countMap.get('DELIVERED') || 0,
      cancelledOrders: countMap.get('CANCELLED') || 0,
      totalRevenue: deliveredRow?.revenue ? Number(deliveredRow.revenue) : 0,
      recentOrders: recentOrders.map((o) => ({
        ...o,
        total: o.total ? Number(o.total) : 0,
      })),
    };
  }

  async updatePaymentMethod(orderId: string, paymentMethod: string) {
    // Persist on Order so the tracking page can display "Método elegido" immediately.
    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentMethod },
    });

    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { paymentMethod },
      });
    } else {
      // Create payment record if none exists
      const order = await this.prisma.order.findUnique({ where: { id: orderId } });
      if (order) {
        await this.prisma.payment.create({
          data: {
            orderId,
            status: 'PENDING',
            paymentMethod,
            amount: order.total,
            currency: 'ARS',
          },
        });
      }
    }
  }

  async updateOrderStatus(
    tenantId: string,
    orderId: string,
    status: string,
    note?: string,
    userId?: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // When confirming an order, auto-advance to PROCESSING
    // EXCEPT when the order is awaiting customer payment selection (gastro flow):
    // in that case stay in CONFIRMED until payment is resolved.
    const autoProcess = status === 'CONFIRMED' && !order.awaitingPayment;
    const finalStatus = autoProcess ? 'PROCESSING' : status;

    // Generate delivery token the first time the order enters READY (DELIVERY only)
    let deliveryToken: string | undefined;
    if (
      finalStatus === 'READY' &&
      order.orderType === 'DELIVERY' &&
      !order.deliveryToken
    ) {
      deliveryToken = randomBytes(12).toString('base64url');
    }

    const txOps: any[] = [
      this.prisma.order.update({
        where: { id: orderId },
        data: deliveryToken
          ? { status: finalStatus, deliveryToken }
          : { status: finalStatus },
        include: {
          _count: { select: { items: true } },
          items: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
          payments: true,
          deliveryEmployee: {
            select: { id: true, name: true, phone: true, deliveryVehicle: true, image: true },
          },
        },
      }),
      this.prisma.orderStatusHistory.create({
        data: {
          orderId,
          status: finalStatus,
          note: note || (autoProcess ? 'Pedido aceptado' : undefined),
          createdBy: userId,
        },
      }),
    ];

    // Add PROCESSING history entry right after CONFIRMED
    if (autoProcess) {
      txOps.push(
        this.prisma.orderStatusHistory.create({
          data: {
            orderId,
            status: 'PROCESSING',
            note: 'Preparación iniciada',
            createdBy: userId,
          },
        }),
      );
    }

    const [updatedOrder] = await this.prisma.$transaction(txOps);

    return this.serializeOrder(updatedOrder);
  }

  // ─── Assign delivery employee ────────────────────────────────

  async assignDeliveryEmployee(
    tenantId: string,
    orderId: string,
    deliveryEmployeeId: string | null,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');

    if (deliveryEmployeeId) {
      const employee = await this.prisma.employee.findFirst({
        where: { id: deliveryEmployeeId, tenantId, isDelivery: true, isActive: true },
      });
      if (!employee) {
        throw new BadRequestException('Repartidor no válido');
      }
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { deliveryEmployeeId },
      include: {
        deliveryEmployee: { select: { id: true, name: true, phone: true, deliveryVehicle: true, image: true } },
      },
    });

    return this.serializeOrder(updated);
  }

  // ─── Delivery person (token-based public access) ─────────────

  async getDeliveryByToken(token: string) {
    const order = await this.prisma.order.findUnique({
      where: { deliveryToken: token },
      include: {
        items: { select: { productName: true, variantName: true, quantity: true, itemNotes: true } },
        tenant: { select: { name: true, slug: true, logo: true } },
        deliveryEmployee: { select: { name: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Link inválido o expirado');
    }

    // If the order is already finished (delivered or cancelled), return a minimal
    // archived response — no PII, no actions. Frontend shows a friendly "closed" screen.
    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      return {
        archived: true,
        status: order.status,
        orderNumber: order.orderNumber,
        tenant: order.tenant,
      } as any;
    }

    // Only expose pickup word options at the final step (ARRIVED -> DELIVERED).
    // The courier never sees the correct word plainly: they must tap the right one
    // from 6 shuffled options after the customer tells it.
    const pickupWordOptions =
      order.status === 'ARRIVED' && order.pickupWord
        ? getPickupWordOptions(order.pickupWord, order.id)
        : null;

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      orderType: order.orderType,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      notes: order.notes,
      items: order.items,
      total: Number(order.total),
      tenant: order.tenant,
      deliveryEmployeeName: order.deliveryEmployee?.name || null,
      nextStatus: DELIVERY_NEXT[order.status] || null,
      pickupWordOptions,
      requiresPickupWord: order.status === 'ARRIVED' && !!order.pickupWord,
    };
  }

  // In-memory cooldown for wrong pickup-word attempts (anti-brute-force)
  private pickupAttempts = new Map<string, { count: number; blockedUntil: number }>();

  async confirmDeliveryWithWord(token: string, word: string) {
    const order = await this.prisma.order.findUnique({
      where: { deliveryToken: token },
    });
    if (!order) throw new NotFoundException('Link inválido o expirado');
    if (order.status !== 'ARRIVED') {
      throw new BadRequestException('El pedido aún no está listo para confirmar la entrega');
    }
    if (!order.pickupWord) {
      // No word set — fall back to plain transition
      return this.advanceDeliveryByToken(token);
    }

    const now = Date.now();
    const attempt = this.pickupAttempts.get(token) || { count: 0, blockedUntil: 0 };
    if (attempt.blockedUntil > now) {
      const secs = Math.ceil((attempt.blockedUntil - now) / 1000);
      throw new BadRequestException(`Demasiados intentos. Probá de nuevo en ${secs}s`);
    }

    const normalized = (word || '').trim().toUpperCase();
    if (normalized !== order.pickupWord.toUpperCase()) {
      attempt.count += 1;
      if (attempt.count >= 3) {
        attempt.blockedUntil = now + 30_000;
        attempt.count = 0;
      }
      this.pickupAttempts.set(token, attempt);
      this.logger.warn(`Wrong pickup word on order ${order.orderNumber} (attempt ${attempt.count})`);
      throw new BadRequestException('Palabra incorrecta. Preguntale al cliente otra vez.');
    }

    this.pickupAttempts.delete(token);

    const [updated] = await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'DELIVERED' },
      }),
      this.prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'DELIVERED',
          note: 'Entrega confirmada con palabra clave',
        },
      }),
    ]);

    this.eventEmitter.emit('order.status.updated', {
      tenantId: order.tenantId,
      orderId: order.id,
      status: 'DELIVERED',
    });

    return {
      orderNumber: updated.orderNumber,
      status: updated.status,
      nextStatus: null,
    };
  }

  async advanceDeliveryByToken(token: string) {
    const order = await this.prisma.order.findUnique({
      where: { deliveryToken: token },
    });

    if (!order) {
      throw new NotFoundException('Link inválido o expirado');
    }

    const next = DELIVERY_NEXT[order.status];
    if (!next) {
      throw new BadRequestException(
        `No se puede avanzar desde estado ${order.status}`,
      );
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: order.id },
        data: { status: next },
      }),
      this.prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: next,
          note: 'Actualizado por repartidor',
        },
      }),
    ]);

    // Notify dashboards via event bus (cocina/pedidos)
    this.eventEmitter.emit('order.status.updated', {
      tenantId: order.tenantId,
      orderId: order.id,
      status: next,
    });

    return {
      orderNumber: updated.orderNumber,
      status: updated.status,
      nextStatus: DELIVERY_NEXT[updated.status] || null,
    };
  }
}
