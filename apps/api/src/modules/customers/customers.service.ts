import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createCustomerDto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: {
        ...createCustomerDto,
        tenantId,
      },
    });
  }

  async findAll(
    tenantId: string,
    options: { page?: number; limit?: number; search?: string } = {},
  ) {
    const { page = 1, limit = 20, search } = options;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async findByPhone(tenantId: string, phone: string) {
    return this.prisma.customer.findUnique({
      where: {
        tenantId_phone: {
          tenantId,
          phone,
        },
      },
    });
  }

  async update(
    tenantId: string,
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ) {
    await this.findById(tenantId, id);

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async delete(tenantId: string, id: string) {
    await this.findById(tenantId, id);

    // Check if customer has bookings
    const bookingsCount = await this.prisma.booking.count({
      where: { customerId: id },
    });

    if (bookingsCount > 0) {
      throw new NotFoundException(
        'Cannot delete customer with existing bookings',
      );
    }

    return this.prisma.customer.delete({ where: { id } });
  }

  async incrementBookings(customerId: string) {
    return this.prisma.customer.update({
      where: { id: customerId },
      data: {
        totalBookings: { increment: 1 },
        lastBookingAt: new Date(),
      },
    });
  }

  async getHistory(tenantId: string, id: string) {
    await this.findById(tenantId, id);

    return this.prisma.booking.findMany({
      where: { customerId: id },
      include: { service: true },
      orderBy: { date: 'desc' },
      take: 50,
    });
  }
}
