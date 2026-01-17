import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: User) {
    const fullUser = await this.usersService.findById(user.id);
    if (!fullUser) {
      return null;
    }
    const { password: _, ...result } = fullUser;
    return result;
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateProfileDto,
  ) {
    const updated = await this.usersService.update(user.id, updateDto);
    const { password: _, ...result } = updated;
    return result;
  }

  // Admin endpoints
  @Get()
  @Roles('SUPER_ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'List all users (admin only)' })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.usersService.findAll(page, limit);
  }
}
