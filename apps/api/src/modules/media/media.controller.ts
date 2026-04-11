import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('media')
@Controller('media')
@ApiBearerAuth()
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload an image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  async upload(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    // Check photo quota before upload
    const { hasReachedLimit, current, limit } = await this.subscriptionsService.checkLimit(user.tenantId!, 'photos');
    if (hasReachedLimit) {
      throw new ForbiddenException(
        `Llegaste al límite de ${limit} fotos (tenés ${current}). Podés liberar espacio borrando imágenes o mejorar tu plan.`,
      );
    }

    if (this.mediaService.storageDriver === 's3') {
      return this.mediaService.uploadToS3(user.tenantId!, file, folder);
    }
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
