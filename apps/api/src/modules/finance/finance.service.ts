import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

export interface FinanceSummary {
  period: { month: number; year: number; label: string };
  income: {
    total: number;
    bookings: number;
    bookingCount: number;
    orders: number;
    orderCount: number;
    manual: number;
    manualCount: number;
    byService: { service: string; total: number; count: number }[];
    byProduct: { product: string; total: number; count: number }[];
    byEmployee: { employee: string; employeeId: string | null; total: number; count: number }[];
    byIncomeCategory: { category: string; total: number; count: number }[];
  };
  expenses: {
    total: number;
    byCategory: { category: string; total: number; count: number }[];
  };
  profit: number;
  profitMargin: number;
}

export interface MonthlyComparison {
  months: {
    month: number;
    year: number;
    label: string;
    income: number;
    expenses: number;
    profit: number;
  }[];
}

const CATEGORY_LABELS: Record<string, string> = {
  SALARY: 'Sueldos',
  RENT: 'Alquiler',
  TAXES: 'Impuestos',
  INTERNET: 'Internet',
  ELECTRICITY: 'Electricidad',
  GAS: 'Gas',
  SUPPLIES: 'Insumos',
  MARKETING: 'Marketing',
  INSURANCE: 'Seguros',
  MAINTENANCE: 'Mantenimiento',
  OTHER: 'Otros',
};

const INCOME_CATEGORY_LABELS: Record<string, string> = {
  FREELANCE: 'Trabajo independiente',
  CONSULTING: 'Consultoría',
  RENTAL_INCOME: 'Alquiler cobrado',
  INVESTMENT: 'Inversiones',
  REFUND: 'Reembolso',
  COMMISSION: 'Comisiones',
  GRANT: 'Subsidio / Beca',
  GASTRO_SALON: 'Ventas de salón',
  GASTRO_FOOD: 'Consumo gastronómico',
  GASTRO_TIPS: 'Propinas',
  GASTRO_DELIVERY: 'Delivery',
  GASTRO_TAKEAWAY: 'Para llevar',
  OTHER_INCOME: 'Otros ingresos',
};

type BookingWithDetails = {
  totalPrice: Decimal | null;
  service: { name: string; price: Decimal } | null;
  employee: { name: string; id: string } | null;
};

function buildIncomeBreakdown(bookings: BookingWithDetails[]) {
  const bookingRevenue = bookings.reduce(
    (sum, b) => sum + (b.totalPrice ? Number(b.totalPrice) : Number(b.service?.price || 0)),
    0,
  );

  // Group by service
  const serviceMap = new Map<string, { total: number; count: number }>();
  for (const b of bookings) {
    const name = b.service?.name || 'Sin servicio';
    const amount = b.totalPrice ? Number(b.totalPrice) : Number(b.service?.price || 0);
    const existing = serviceMap.get(name) || { total: 0, count: 0 };
    existing.total += amount;
    existing.count += 1;
    serviceMap.set(name, existing);
  }
  const byService = Array.from(serviceMap.entries())
    .map(([service, data]) => ({ service, ...data }))
    .sort((a, b) => b.total - a.total);

  // Group by employee
  const employeeMap = new Map<string, { employeeId: string | null; total: number; count: number }>();
  for (const b of bookings) {
    const name = b.employee?.name || 'Sin asignar';
    const empId = b.employee?.id || null;
    const amount = b.totalPrice ? Number(b.totalPrice) : Number(b.service?.price || 0);
    const existing = employeeMap.get(name) || { employeeId: empId, total: 0, count: 0 };
    existing.total += amount;
    existing.count += 1;
    employeeMap.set(name, existing);
  }
  const byEmployee = Array.from(employeeMap.entries())
    .map(([employee, data]) => ({ employee, ...data }))
    .sort((a, b) => b.count - a.count);

  return { bookingRevenue, bookingCount: bookings.length, byService, byEmployee };
}

type OrderWithItems = {
  total: Decimal;
  items: { productName: string; totalPrice: Decimal; quantity: number }[];
};

function buildOrderBreakdown(orders: OrderWithItems[]) {
  const orderRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);

  const productMap = new Map<string, { total: number; count: number }>();
  for (const o of orders) {
    for (const item of o.items) {
      const name = item.productName || 'Sin nombre';
      const existing = productMap.get(name) || { total: 0, count: 0 };
      existing.total += Number(item.totalPrice);
      existing.count += item.quantity;
      productMap.set(name, existing);
    }
  }
  const byProduct = Array.from(productMap.entries())
    .map(([product, data]) => ({ product, ...data }))
    .sort((a, b) => b.total - a.total);

  return { orderRevenue, orderCount: orders.length, byProduct };
}

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // ============ EXPENSE CRUD ============

  async getExpenses(tenantId: string, month?: number, year?: number) {
    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();

    return this.prisma.expense.findMany({
      where: { tenantId, type: 'EXPENSE', month: m, year: y },
      orderBy: { date: 'desc' },
    });
  }

  // ============ INCOME CRUD ============

  async getIncomes(tenantId: string, month?: number, year?: number) {
    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();

    return this.prisma.expense.findMany({
      where: { tenantId, type: 'INCOME', month: m, year: y },
      orderBy: { date: 'desc' },
    });
  }

  async createIncome(
    tenantId: string,
    data: {
      category: string;
      description?: string;
      amount: number;
      isRecurring?: boolean;
      recurringDay?: number;
      date?: string;
      month?: number;
      year?: number;
    },
  ) {
    const dateObj = data.date ? new Date(data.date) : new Date();
    const month = data.month ?? dateObj.getMonth() + 1;
    const year = data.year ?? dateObj.getFullYear();

    return this.prisma.expense.create({
      data: {
        tenantId,
        type: 'INCOME',
        category: data.category,
        description: data.description,
        amount: new Decimal(data.amount),
        isRecurring: data.isRecurring ?? false,
        recurringDay: data.recurringDay,
        date: dateObj,
        month,
        year,
      },
    });
  }

  async updateIncome(
    tenantId: string,
    incomeId: string,
    data: {
      category?: string;
      description?: string;
      amount?: number;
      isRecurring?: boolean;
      recurringDay?: number;
      date?: string;
    },
  ) {
    const income = await this.prisma.expense.findFirst({
      where: { id: incomeId, tenantId, type: 'INCOME' },
    });
    if (!income) throw new NotFoundException('Ingreso no encontrado');

    const updateData: any = {};
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = new Decimal(data.amount);
    if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring;
    if (data.recurringDay !== undefined) updateData.recurringDay = data.recurringDay;
    if (data.date !== undefined) {
      const dateObj = new Date(data.date);
      updateData.date = dateObj;
      updateData.month = dateObj.getMonth() + 1;
      updateData.year = dateObj.getFullYear();
    }

    return this.prisma.expense.update({
      where: { id: incomeId },
      data: updateData,
    });
  }

  async deleteIncome(tenantId: string, incomeId: string) {
    const income = await this.prisma.expense.findFirst({
      where: { id: incomeId, tenantId, type: 'INCOME' },
    });
    if (!income) throw new NotFoundException('Ingreso no encontrado');

    await this.prisma.expense.delete({ where: { id: incomeId } });
    return { success: true };
  }

  async createExpense(
    tenantId: string,
    data: {
      category: string;
      description?: string;
      amount: number;
      isRecurring?: boolean;
      recurringDay?: number;
      date?: string;
      month?: number;
      year?: number;
    },
  ) {
    const dateObj = data.date ? new Date(data.date) : new Date();
    const month = data.month ?? dateObj.getMonth() + 1;
    const year = data.year ?? dateObj.getFullYear();

    return this.prisma.expense.create({
      data: {
        tenantId,
        type: 'EXPENSE',
        category: data.category,
        description: data.description,
        amount: new Decimal(data.amount),
        isRecurring: data.isRecurring ?? false,
        recurringDay: data.recurringDay,
        date: dateObj,
        month,
        year,
      },
    });
  }

  async updateExpense(
    tenantId: string,
    expenseId: string,
    data: {
      category?: string;
      description?: string;
      amount?: number;
      isRecurring?: boolean;
      recurringDay?: number;
      date?: string;
    },
  ) {
    const expense = await this.prisma.expense.findFirst({
      where: { id: expenseId, tenantId },
    });
    if (!expense) throw new NotFoundException('Gasto no encontrado');

    const updateData: any = {};
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = new Decimal(data.amount);
    if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring;
    if (data.recurringDay !== undefined) updateData.recurringDay = data.recurringDay;
    if (data.date !== undefined) {
      const dateObj = new Date(data.date);
      updateData.date = dateObj;
      updateData.month = dateObj.getMonth() + 1;
      updateData.year = dateObj.getFullYear();
    }

    return this.prisma.expense.update({
      where: { id: expenseId },
      data: updateData,
    });
  }

  async deleteExpense(tenantId: string, expenseId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id: expenseId, tenantId },
    });
    if (!expense) throw new NotFoundException('Gasto no encontrado');

    await this.prisma.expense.delete({ where: { id: expenseId } });
    return { success: true };
  }

  // ============ FINANCE SUMMARY ============

  async getSummary(tenantId: string, month?: number, year?: number): Promise<FinanceSummary> {
    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();

    // Period dates for booking revenue
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    // Get booking revenue (COMPLETED bookings in this period)
    const bookings = await this.prisma.booking.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        date: { gte: startDate, lte: endDate },
      },
      select: {
        totalPrice: true,
        service: { select: { name: true, price: true } },
        employee: { select: { id: true, name: true } },
      },
    });

    const income = buildIncomeBreakdown(bookings);

    // Get order revenue (DELIVERED orders in this period)
    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        status: 'DELIVERED',
        updatedAt: { gte: startDate, lte: endDate },
      },
      select: {
        total: true,
        items: { select: { productName: true, totalPrice: true, quantity: true } },
      },
    });
    const orderIncome = buildOrderBreakdown(orders);

    // Get manual income entries
    const manualIncomes = await this.prisma.expense.findMany({
      where: { tenantId, type: 'INCOME', month: m, year: y },
    });
    const manualIncomeTotal = manualIncomes.reduce(
      (sum, i) => sum + Number(i.amount),
      0,
    );

    // Group manual income by category
    const incomeCategoryMap = new Map<string, { total: number; count: number }>();
    for (const inc of manualIncomes) {
      const cat = inc.category;
      const existing = incomeCategoryMap.get(cat) || { total: 0, count: 0 };
      existing.total += Number(inc.amount);
      existing.count += 1;
      incomeCategoryMap.set(cat, existing);
    }
    const byIncomeCategory = Array.from(incomeCategoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.total - a.total);

    // Get expenses (type = EXPENSE only)
    const expenses = await this.prisma.expense.findMany({
      where: { tenantId, type: 'EXPENSE', month: m, year: y },
    });

    const expenseTotal = expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );

    // Group expenses by category
    const categoryMap = new Map<string, { total: number; count: number }>();
    for (const exp of expenses) {
      const cat = exp.category;
      const existing = categoryMap.get(cat) || { total: 0, count: 0 };
      existing.total += Number(exp.amount);
      existing.count += 1;
      categoryMap.set(cat, existing);
    }

    const byCategory = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.total - a.total);

    const totalIncome = income.bookingRevenue + orderIncome.orderRevenue + manualIncomeTotal;
    const profit = totalIncome - expenseTotal;
    const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

    const monthLabel = new Date(y, m - 1).toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric',
    });

    return {
      period: { month: m, year: y, label: monthLabel },
      income: {
        total: totalIncome,
        bookings: income.bookingRevenue,
        bookingCount: income.bookingCount,
        orders: orderIncome.orderRevenue,
        orderCount: orderIncome.orderCount,
        manual: manualIncomeTotal,
        manualCount: manualIncomes.length,
        byService: income.byService,
        byProduct: orderIncome.byProduct,
        byEmployee: income.byEmployee,
        byIncomeCategory,
      },
      expenses: { total: expenseTotal, byCategory },
      profit,
      profitMargin: Math.round(profitMargin * 10) / 10,
    };
  }

  // ============ RANGE SUMMARY ============

  async getSummaryByRange(tenantId: string, startDate: string, endDate: string): Promise<FinanceSummary> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const bookings = await this.prisma.booking.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        date: { gte: start, lte: end },
      },
      select: {
        totalPrice: true,
        service: { select: { name: true, price: true } },
        employee: { select: { id: true, name: true } },
      },
    });

    const income = buildIncomeBreakdown(bookings);

    // Get order revenue (DELIVERED orders in this range)
    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        status: 'DELIVERED',
        updatedAt: { gte: start, lte: end },
      },
      select: {
        total: true,
        items: { select: { productName: true, totalPrice: true, quantity: true } },
      },
    });
    const orderIncome = buildOrderBreakdown(orders);

    // Manual income
    const manualIncomes = await this.prisma.expense.findMany({
      where: { tenantId, type: 'INCOME', date: { gte: start, lte: end } },
    });
    const manualIncomeTotal = manualIncomes.reduce((sum, i) => sum + Number(i.amount), 0);

    const incomeCategoryMap = new Map<string, { total: number; count: number }>();
    for (const inc of manualIncomes) {
      const existing = incomeCategoryMap.get(inc.category) || { total: 0, count: 0 };
      existing.total += Number(inc.amount);
      existing.count += 1;
      incomeCategoryMap.set(inc.category, existing);
    }
    const byIncomeCategory = Array.from(incomeCategoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.total - a.total);

    const expenses = await this.prisma.expense.findMany({
      where: { tenantId, type: 'EXPENSE', date: { gte: start, lte: end } },
    });

    const expenseTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const categoryMap = new Map<string, { total: number; count: number }>();
    for (const exp of expenses) {
      const existing = categoryMap.get(exp.category) || { total: 0, count: 0 };
      existing.total += Number(exp.amount);
      existing.count += 1;
      categoryMap.set(exp.category, existing);
    }

    const byCategory = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.total - a.total);

    const totalIncome = income.bookingRevenue + orderIncome.orderRevenue + manualIncomeTotal;
    const profit = totalIncome - expenseTotal;
    const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

    const label = `${start.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}`;

    return {
      period: { month: start.getMonth() + 1, year: start.getFullYear(), label },
      income: {
        total: totalIncome,
        bookings: income.bookingRevenue,
        bookingCount: income.bookingCount,
        orders: orderIncome.orderRevenue,
        orderCount: orderIncome.orderCount,
        manual: manualIncomeTotal,
        manualCount: manualIncomes.length,
        byService: income.byService,
        byProduct: orderIncome.byProduct,
        byEmployee: income.byEmployee,
        byIncomeCategory,
      },
      expenses: { total: expenseTotal, byCategory },
      profit,
      profitMargin: Math.round(profitMargin * 10) / 10,
    };
  }

  // ============ MONTHLY COMPARISON ============

  async getMonthlyComparison(
    tenantId: string,
    months: number = 6,
  ): Promise<MonthlyComparison> {
    const now = new Date();
    const result: MonthlyComparison['months'] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = date.getMonth() + 1;
      const y = date.getFullYear();
      const endDate = new Date(y, m, 0, 23, 59, 59);

      // Income from bookings
      const bookings = await this.prisma.booking.findMany({
        where: {
          tenantId,
          status: 'COMPLETED',
          date: { gte: date, lte: endDate },
        },
        select: { totalPrice: true, service: { select: { price: true } } },
      });
      const bookingIncome = bookings.reduce((s, b) => s + (b.totalPrice ? Number(b.totalPrice) : Number(b.service?.price || 0)), 0);

      // Income from orders (DELIVERED)
      const orderAgg = await this.prisma.order.aggregate({
        where: {
          tenantId,
          status: 'DELIVERED',
          updatedAt: { gte: date, lte: endDate },
        },
        _sum: { total: true },
      });
      const orderIncome = Number(orderAgg._sum.total || 0);

      // Manual income
      const manualIncomeAgg = await this.prisma.expense.aggregate({
        where: { tenantId, type: 'INCOME', month: m, year: y },
        _sum: { amount: true },
      });
      const manualIncome = Number(manualIncomeAgg._sum.amount || 0);
      const totalIncome = bookingIncome + orderIncome + manualIncome;

      // Expenses
      const expenseAgg = await this.prisma.expense.aggregate({
        where: { tenantId, type: 'EXPENSE', month: m, year: y },
        _sum: { amount: true },
      });
      const expenseTotal = Number(expenseAgg._sum.amount || 0);

      result.push({
        month: m,
        year: y,
        label: date.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
        income: totalIncome,
        expenses: expenseTotal,
        profit: totalIncome - expenseTotal,
      });
    }

    return { months: result };
  }

  // ============ EXPENSE CATEGORIES ============

  getCategories() {
    return Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
      value,
      label,
    }));
  }

  getIncomeCategories() {
    return Object.entries(INCOME_CATEGORY_LABELS).map(([value, label]) => ({
      value,
      label,
    }));
  }

  // ============ PROJECTIONS ============

  async getProjection(tenantId: string, months: number = 3) {
    // Use last 6 months as historical base
    const comparison = await this.getMonthlyComparison(tenantId, 6);
    const historical = comparison.months;

    if (historical.length === 0) {
      return { historical: [], projected: [] };
    }

    // Weighted moving average — recent months weigh more
    const weights = historical.map((_, i) => i + 1);
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    const avgIncome = historical.reduce((sum, m, i) => sum + m.income * weights[i], 0) / totalWeight;
    const avgExpenses = historical.reduce((sum, m, i) => sum + m.expenses * weights[i], 0) / totalWeight;

    // Calculate trend (slope) from linear regression
    const n = historical.length;
    const xMean = (n - 1) / 2;
    const incomeSlopeNum = historical.reduce((sum, m, i) => sum + (i - xMean) * (m.income - avgIncome), 0);
    const expenseSlopeNum = historical.reduce((sum, m, i) => sum + (i - xMean) * (m.expenses - avgExpenses), 0);
    const slopeDenom = historical.reduce((sum, _, i) => sum + (i - xMean) ** 2, 0);
    const incomeSlope = slopeDenom > 0 ? incomeSlopeNum / slopeDenom : 0;
    const expenseSlope = slopeDenom > 0 ? expenseSlopeNum / slopeDenom : 0;

    const projected: MonthlyComparison['months'] = [];
    const lastMonth = historical[historical.length - 1];
    const lastDate = new Date(lastMonth.year, lastMonth.month - 1, 1);

    for (let i = 1; i <= months; i++) {
      const projDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + i, 1);
      const projIncome = Math.max(0, avgIncome + incomeSlope * (n + i - 1 - xMean));
      const projExpenses = Math.max(0, avgExpenses + expenseSlope * (n + i - 1 - xMean));

      projected.push({
        month: projDate.getMonth() + 1,
        year: projDate.getFullYear(),
        label: projDate.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
        income: Math.round(projIncome * 100) / 100,
        expenses: Math.round(projExpenses * 100) / 100,
        profit: Math.round((projIncome - projExpenses) * 100) / 100,
      });
    }

    return { historical, projected };
  }

  // ============ BUDGETS CRUD ============

  async getBudgets(tenantId: string, month: number, year: number) {
    return this.prisma.budget.findMany({
      where: { tenantId, month, year },
      orderBy: { category: 'asc' },
    });
  }

  async setBudget(tenantId: string, data: { category: string; amount: number; month: number; year: number }) {
    return this.prisma.budget.upsert({
      where: {
        tenantId_category_month_year: {
          tenantId,
          category: data.category,
          month: data.month,
          year: data.year,
        },
      },
      update: { amount: new Decimal(data.amount) },
      create: {
        tenantId,
        category: data.category,
        amount: new Decimal(data.amount),
        month: data.month,
        year: data.year,
      },
    });
  }

  async deleteBudget(tenantId: string, budgetId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id: budgetId, tenantId },
    });
    if (!budget) throw new NotFoundException('Presupuesto no encontrado');
    await this.prisma.budget.delete({ where: { id: budgetId } });
    return { success: true };
  }

  async getBudgetVsActual(tenantId: string, month: number, year: number) {
    const [budgets, expenses] = await Promise.all([
      this.prisma.budget.findMany({ where: { tenantId, month, year } }),
      this.prisma.expense.findMany({ where: { tenantId, type: 'EXPENSE', month, year } }),
    ]);

    // Group actual expenses by category
    const actualMap = new Map<string, number>();
    for (const exp of expenses) {
      actualMap.set(exp.category, (actualMap.get(exp.category) || 0) + Number(exp.amount));
    }

    return budgets.map((b) => {
      const actual = actualMap.get(b.category) || 0;
      const budgetAmount = Number(b.amount);
      return {
        id: b.id,
        category: b.category,
        budget: budgetAmount,
        actual,
        remaining: budgetAmount - actual,
        percentUsed: budgetAmount > 0 ? Math.round((actual / budgetAmount) * 1000) / 10 : 0,
      };
    });
  }

  // ============ REVENUE GOALS CRUD ============

  async getRevenueGoal(tenantId: string, month: number, year: number) {
    return this.prisma.revenueGoal.findUnique({
      where: {
        tenantId_month_year: { tenantId, month, year },
      },
    });
  }

  async setRevenueGoal(tenantId: string, data: { amount: number; month: number; year: number }) {
    return this.prisma.revenueGoal.upsert({
      where: {
        tenantId_month_year: {
          tenantId,
          month: data.month,
          year: data.year,
        },
      },
      update: { amount: new Decimal(data.amount) },
      create: {
        tenantId,
        amount: new Decimal(data.amount),
        month: data.month,
        year: data.year,
      },
    });
  }

  async deleteRevenueGoal(tenantId: string, goalId: string) {
    const goal = await this.prisma.revenueGoal.findFirst({
      where: { id: goalId, tenantId },
    });
    if (!goal) throw new NotFoundException('Meta no encontrada');
    await this.prisma.revenueGoal.delete({ where: { id: goalId } });
    return { success: true };
  }

  async getGoalProgress(tenantId: string, month: number, year: number) {
    const [goal, summary] = await Promise.all([
      this.getRevenueGoal(tenantId, month, year),
      this.getSummary(tenantId, month, year),
    ]);

    if (!goal) return null;

    const goalAmount = Number(goal.amount);
    const actual = summary.income.total;

    return {
      id: goal.id,
      goal: goalAmount,
      actual,
      remaining: goalAmount - actual,
      percentAchieved: goalAmount > 0 ? Math.round((actual / goalAmount) * 1000) / 10 : 0,
    };
  }

  // ============ EXPENSE ALERTS CRUD ============

  async getExpenseAlerts(tenantId: string) {
    return this.prisma.expenseAlert.findMany({
      where: { tenantId },
      orderBy: { category: 'asc' },
    });
  }

  async setExpenseAlert(tenantId: string, data: { category: string; threshold: number; isActive?: boolean }) {
    return this.prisma.expenseAlert.upsert({
      where: {
        tenantId_category: { tenantId, category: data.category },
      },
      update: {
        threshold: new Decimal(data.threshold),
        isActive: data.isActive ?? true,
      },
      create: {
        tenantId,
        category: data.category,
        threshold: new Decimal(data.threshold),
        isActive: data.isActive ?? true,
      },
    });
  }

  async deleteExpenseAlert(tenantId: string, alertId: string) {
    const alert = await this.prisma.expenseAlert.findFirst({
      where: { id: alertId, tenantId },
    });
    if (!alert) throw new NotFoundException('Alerta no encontrada');
    await this.prisma.expenseAlert.delete({ where: { id: alertId } });
    return { success: true };
  }

  async checkAlerts(tenantId: string, month: number, year: number) {
    const [alerts, expenses] = await Promise.all([
      this.prisma.expenseAlert.findMany({ where: { tenantId, isActive: true } }),
      this.prisma.expense.findMany({ where: { tenantId, type: 'EXPENSE', month, year } }),
    ]);

    // Group actual expenses by category
    const actualMap = new Map<string, number>();
    let totalExpenses = 0;
    for (const exp of expenses) {
      const amount = Number(exp.amount);
      actualMap.set(exp.category, (actualMap.get(exp.category) || 0) + amount);
      totalExpenses += amount;
    }

    return alerts.map((a) => {
      const actual = a.category === 'TOTAL' ? totalExpenses : (actualMap.get(a.category) || 0);
      const threshold = Number(a.threshold);
      return {
        id: a.id,
        category: a.category,
        threshold,
        actual,
        percentUsed: threshold > 0 ? Math.round((actual / threshold) * 1000) / 10 : 0,
        triggered: actual >= threshold,
      };
    });
  }

  // ============ COPY RECURRING EXPENSES ============

  async copyRecurringExpenses(tenantId: string, toMonth: number, toYear: number) {
    // Find recurring expenses from any previous month (both EXPENSE and INCOME)
    const recurring = await this.prisma.expense.findMany({
      where: { tenantId, isRecurring: true },
      distinct: ['type', 'category', 'description', 'amount'],
      orderBy: { date: 'desc' },
    });

    // Check which already exist in the target month
    const existing = await this.prisma.expense.findMany({
      where: { tenantId, month: toMonth, year: toYear, isRecurring: true },
    });

    const existingKeys = new Set(
      existing.map((e) => `${e.type}|${e.category}|${e.description}|${Number(e.amount)}`),
    );

    const toCreate = recurring.filter(
      (r) => !existingKeys.has(`${r.type}|${r.category}|${r.description}|${Number(r.amount)}`),
    );

    if (toCreate.length === 0) return { created: 0 };

    await this.prisma.expense.createMany({
      data: toCreate.map((r) => ({
        tenantId,
        type: r.type,
        category: r.category,
        description: r.description,
        amount: r.amount,
        isRecurring: true,
        recurringDay: r.recurringDay,
        date: new Date(toYear, toMonth - 1, r.recurringDay || 1),
        month: toMonth,
        year: toYear,
      })),
    });

    return { created: toCreate.length };
  }
}
