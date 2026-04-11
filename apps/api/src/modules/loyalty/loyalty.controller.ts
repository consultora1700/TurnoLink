import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireAnyFeature } from '../../common/decorators/require-feature.decorator';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyTiersService } from './loyalty-tiers.service';
import { LoyaltyRewardsService } from './loyalty-rewards.service';
import { UpdateLoyaltyProgramDto } from './dto/update-loyalty-program.dto';
import { AdjustPointsDto } from './dto/adjust-points.dto';
import { CreateTierDto } from './dto/create-tier.dto';
import { CreateRewardDto } from './dto/create-reward.dto';

@ApiTags('loyalty')
@Controller('loyalty')
@ApiBearerAuth()
@RequireAnyFeature('loyalty_program', 'advanced_reports', 'complete_reports')
export class LoyaltyController {
  constructor(
    private readonly loyaltyService: LoyaltyService,
    private readonly tiersService: LoyaltyTiersService,
    private readonly rewardsService: LoyaltyRewardsService,
  ) {}

  // Program
  @Get('program')
  @ApiOperation({ summary: 'Get loyalty program config' })
  async getProgram(@CurrentUser() user: any) {
    return this.loyaltyService.getProgram(user.tenantId);
  }

  @Post('program')
  @ApiOperation({ summary: 'Create/activate loyalty program' })
  async createProgram(@CurrentUser() user: any) {
    return this.loyaltyService.createProgram(user.tenantId);
  }

  @Put('program')
  @ApiOperation({ summary: 'Update loyalty program config' })
  async updateProgram(@CurrentUser() user: any, @Body() dto: UpdateLoyaltyProgramDto) {
    return this.loyaltyService.updateProgram(user.tenantId, dto);
  }

  // Balances
  @Get('balances')
  @ApiOperation({ summary: 'List customer balances' })
  async getBalances(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.loyaltyService.getBalances(user.tenantId, Number(page) || 1, Number(limit) || 20, search);
  }

  @Get('balances/:customerId')
  @ApiOperation({ summary: 'Get customer balance detail' })
  async getBalance(@CurrentUser() user: any, @Param('customerId') customerId: string) {
    const [balance, transactions] = await Promise.all([
      this.loyaltyService.getBalance(user.tenantId, customerId),
      this.loyaltyService.getTransactions(user.tenantId, 1, 50, customerId),
    ]);
    return { balance, transactions: transactions.data };
  }

  // Transactions
  @Get('transactions')
  @ApiOperation({ summary: 'List all transactions' })
  async getTransactions(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ) {
    return this.loyaltyService.getTransactions(user.tenantId, Number(page) || 1, Number(limit) || 20, undefined, type);
  }

  // Adjust
  @Post('adjust')
  @ApiOperation({ summary: 'Manually adjust customer points' })
  async adjustPoints(@CurrentUser() user: any, @Body() dto: AdjustPointsDto) {
    return this.loyaltyService.adjustPoints(user.tenantId, dto);
  }

  // Metrics
  @Get('metrics')
  @ApiOperation({ summary: 'Get loyalty metrics' })
  async getMetrics(@CurrentUser() user: any) {
    return this.loyaltyService.getMetrics(user.tenantId);
  }

  // Tiers
  @Get('tiers')
  async getTiers(@CurrentUser() user: any) {
    return this.tiersService.getTiers(user.tenantId);
  }

  @Post('tiers')
  async createTier(@CurrentUser() user: any, @Body() dto: CreateTierDto) {
    return this.tiersService.createTier(user.tenantId, dto);
  }

  @Put('tiers/:id')
  async updateTier(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: Partial<CreateTierDto>) {
    return this.tiersService.updateTier(user.tenantId, id, dto);
  }

  @Delete('tiers/:id')
  async deleteTier(@CurrentUser() user: any, @Param('id') id: string) {
    return this.tiersService.deleteTier(user.tenantId, id);
  }

  // Rewards
  @Get('rewards')
  async getRewards(@CurrentUser() user: any) {
    return this.rewardsService.getRewards(user.tenantId);
  }

  @Post('rewards')
  async createReward(@CurrentUser() user: any, @Body() dto: CreateRewardDto) {
    return this.rewardsService.createReward(user.tenantId, dto);
  }

  @Put('rewards/:id')
  async updateReward(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: Partial<CreateRewardDto>) {
    return this.rewardsService.updateReward(user.tenantId, id, dto);
  }

  @Delete('rewards/:id')
  async deleteReward(@CurrentUser() user: any, @Param('id') id: string) {
    return this.rewardsService.deleteReward(user.tenantId, id);
  }

  // Redemptions
  @Get('redemptions')
  async getRedemptions(@CurrentUser() user: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.rewardsService.getRedemptions(user.tenantId, Number(page) || 1, Number(limit) || 20);
  }
}
