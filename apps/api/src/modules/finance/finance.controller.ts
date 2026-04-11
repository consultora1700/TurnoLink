import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequireAnyFeature } from '../../common/decorators/require-feature.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { FinanceService } from './finance.service';

@ApiTags('finance')
@Controller('finance')
@ApiBearerAuth()
@RequireAnyFeature('finance_module', 'advanced_reports', 'complete_reports')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ============ CATEGORIES ============

  @Get('categories')
  getCategories() {
    return this.financeService.getCategories();
  }

  @Get('income-categories')
  getIncomeCategories() {
    return this.financeService.getIncomeCategories();
  }

  // ============ SUMMARY ============

  @Get('summary')
  getSummary(
    @CurrentUser() user: User,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.financeService.getSummary(
      user.tenantId!,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Get('summary-range')
  getSummaryByRange(
    @CurrentUser() user: User,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate y endDate son requeridos');
    }
    return this.financeService.getSummaryByRange(user.tenantId!, startDate, endDate);
  }

  @Get('comparison')
  getComparison(
    @CurrentUser() user: User,
    @Query('months') months?: string,
  ) {
    return this.financeService.getMonthlyComparison(
      user.tenantId!,
      months ? parseInt(months) : 6,
    );
  }

  // ============ EXPENSES CRUD ============

  @Get('expenses')
  getExpenses(
    @CurrentUser() user: User,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.financeService.getExpenses(
      user.tenantId!,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Post('expenses')
  createExpense(
    @CurrentUser() user: User,
    @Body()
    body: {
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
    return this.financeService.createExpense(user.tenantId!, body);
  }

  @Patch('expenses/:id')
  updateExpense(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body()
    body: {
      category?: string;
      description?: string;
      amount?: number;
      isRecurring?: boolean;
      recurringDay?: number;
      date?: string;
    },
  ) {
    return this.financeService.updateExpense(user.tenantId!, id, body);
  }

  @Delete('expenses/:id')
  deleteExpense(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.financeService.deleteExpense(user.tenantId!, id);
  }

  // ============ INCOME CRUD ============

  @Get('incomes')
  getIncomes(
    @CurrentUser() user: User,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.financeService.getIncomes(
      user.tenantId!,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Post('incomes')
  createIncome(
    @CurrentUser() user: User,
    @Body()
    body: {
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
    return this.financeService.createIncome(user.tenantId!, body);
  }

  @Patch('incomes/:id')
  updateIncome(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body()
    body: {
      category?: string;
      description?: string;
      amount?: number;
      isRecurring?: boolean;
      recurringDay?: number;
      date?: string;
    },
  ) {
    return this.financeService.updateIncome(user.tenantId!, id, body);
  }

  @Delete('incomes/:id')
  deleteIncome(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.financeService.deleteIncome(user.tenantId!, id);
  }

  // ============ PROJECTIONS ============

  @Get('projection')
  getProjection(
    @CurrentUser() user: User,
    @Query('months') months?: string,
  ) {
    return this.financeService.getProjection(
      user.tenantId!,
      months ? parseInt(months) : 3,
    );
  }

  // ============ BUDGETS CRUD ============

  @Get('budgets')
  getBudgets(
    @CurrentUser() user: User,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    if (!month || !year) throw new BadRequestException('month y year son requeridos');
    return this.financeService.getBudgets(user.tenantId!, parseInt(month), parseInt(year));
  }

  @Post('budgets')
  setBudget(
    @CurrentUser() user: User,
    @Body() body: { category: string; amount: number; month: number; year: number },
  ) {
    return this.financeService.setBudget(user.tenantId!, body);
  }

  @Delete('budgets/:id')
  deleteBudget(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.financeService.deleteBudget(user.tenantId!, id);
  }

  @Get('budget-vs-actual')
  getBudgetVsActual(
    @CurrentUser() user: User,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    if (!month || !year) throw new BadRequestException('month y year son requeridos');
    return this.financeService.getBudgetVsActual(user.tenantId!, parseInt(month), parseInt(year));
  }

  // ============ REVENUE GOALS CRUD ============

  @Get('goals')
  getRevenueGoal(
    @CurrentUser() user: User,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    if (!month || !year) throw new BadRequestException('month y year son requeridos');
    return this.financeService.getRevenueGoal(user.tenantId!, parseInt(month), parseInt(year));
  }

  @Post('goals')
  setRevenueGoal(
    @CurrentUser() user: User,
    @Body() body: { amount: number; month: number; year: number },
  ) {
    return this.financeService.setRevenueGoal(user.tenantId!, body);
  }

  @Delete('goals/:id')
  deleteRevenueGoal(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.financeService.deleteRevenueGoal(user.tenantId!, id);
  }

  @Get('goal-progress')
  getGoalProgress(
    @CurrentUser() user: User,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    if (!month || !year) throw new BadRequestException('month y year son requeridos');
    return this.financeService.getGoalProgress(user.tenantId!, parseInt(month), parseInt(year));
  }

  // ============ EXPENSE ALERTS CRUD ============

  @Get('alerts')
  getExpenseAlerts(@CurrentUser() user: User) {
    return this.financeService.getExpenseAlerts(user.tenantId!);
  }

  @Post('alerts')
  setExpenseAlert(
    @CurrentUser() user: User,
    @Body() body: { category: string; threshold: number; isActive?: boolean },
  ) {
    return this.financeService.setExpenseAlert(user.tenantId!, body);
  }

  @Delete('alerts/:id')
  deleteExpenseAlert(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.financeService.deleteExpenseAlert(user.tenantId!, id);
  }

  @Get('alerts-check')
  checkAlerts(
    @CurrentUser() user: User,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    if (!month || !year) throw new BadRequestException('month y year son requeridos');
    return this.financeService.checkAlerts(user.tenantId!, parseInt(month), parseInt(year));
  }

  // ============ RECURRING ============

  @Post('expenses/copy-recurring')
  copyRecurring(
    @CurrentUser() user: User,
    @Body() body: { month: number; year: number },
  ) {
    return this.financeService.copyRecurringExpenses(
      user.tenantId!,
      body.month,
      body.year,
    );
  }
}
