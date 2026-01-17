import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('media')
@Controller('media')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload an image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async upload(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    return this.mediaService.upload(user.tenantId!, file, folder);
  }

  @Get()
  @ApiOperation({ summary: 'Get all media' })
  async findAll(
    @CurrentUser() user: User,
    @Query('folder') folder?: string,
  ) {
    return this.mediaService.findAll(user.tenantId!, folder);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media' })
  async delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.mediaService.delete(user.tenantId!, id);
  }
}
