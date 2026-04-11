import { Controller, Get, Post, Param, Body, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyRewardsService } from './loyalty-rewards.service';
import { RedeemRewardDto } from './dto/redeem-reward.dto';

@ApiTags('public-loyalty')
@Controller('public/tenants/:slug')
export class PublicLoyaltyController {
  constructor(
    private readonly loyaltyService: LoyaltyService,
    private readonly rewardsService: LoyaltyRewardsService,
    private readonly prisma: PrismaService,
  ) {}

  private async getTenantId(slug: string): Promise<string> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });
    if (!tenant || tenant.status !== 'ACTIVE') throw new NotFoundException('Negocio no encontrado');
    return tenant.id;
  }

  @Public()
  @Get('loyalty/program')
  @ApiOperation({ summary: 'Public loyalty program info' })
  async getProgram(@Param('slug') slug: string) {
    const tenantId = await this.getTenantId(slug);
    const program = await this.loyaltyService.getProgram(tenantId);
    if (!program || !program.isActive) return null;
    return { programName: program.programName, isActive: program.isActive };
  }

  @Public()
  @Get('loyalty/rewards')
  @ApiOperation({ summary: 'Public rewards list' })
  async getRewards(@Param('slug') slug: string) {
    const tenantId = await this.getTenantId(slug);
    return this.rewardsService.getPublicRewards(tenantId);
  }

  @Public()
  @Post('loyalty/redeem')
  @ApiOperation({ summary: 'Redeem reward (public)' })
  async redeemReward(@Param('slug') slug: string, @Body() dto: RedeemRewardDto) {
    const tenantId = await this.getTenantId(slug);
    return this.rewardsService.redeemReward(tenantId, dto.rewardId, dto.phone, dto.email);
  }
}
