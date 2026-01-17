import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TotpService } from './totp.service';
import { VerifyTotpDto, DisableTotpDto } from './dto/totp.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('auth/2fa')
@UseGuards(JwtAuthGuard)
export class TotpController {
  constructor(private readonly totpService: TotpService) {}

  @Get('status')
  async getStatus(@CurrentUser() user: User) {
    return this.totpService.getStatus(user.id);
  }

  @Post('setup')
  async setup(@CurrentUser() user: User) {
    return this.totpService.setup(user.id);
  }

  @Post('verify')
  async verify(@CurrentUser() user: User, @Body() dto: VerifyTotpDto) {
    return this.totpService.verify(user.id, dto.code);
  }

  @Post('disable')
  async disable(@CurrentUser() user: User, @Body() dto: DisableTotpDto) {
    return this.totpService.disable(user.id, dto.password, dto.code);
  }

  @Get('backup-codes/count')
  async getBackupCodesCount(@CurrentUser() user: User) {
    const count = await this.totpService.getRemainingBackupCodesCount(user.id);
    return { count };
  }

  @Post('backup-codes/regenerate')
  async regenerateBackupCodes(@CurrentUser() user: User, @Body() dto: VerifyTotpDto) {
    return this.totpService.regenerateBackupCodes(user.id, dto.code);
  }
}
