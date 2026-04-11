import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { MediaService } from './media.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('cdn')
export class CdnController {
  constructor(private readonly mediaService: MediaService) {}

  @Public()
  @Get(':tenantId/:folder/:filename')
  async serve(
    @Param('tenantId') tenantId: string,
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    // Sanitize params to prevent path traversal
    const safeTenant = tenantId.replace(/[^a-zA-Z0-9-]/g, '');
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
    const safeFile = filename.replace(/[^a-zA-Z0-9._-]/g, '');

    const key = `${safeTenant}/${safeFolder}/${safeFile}`;
    const result = await this.mediaService.streamFromS3(key);

    if (!result) {
      throw new NotFoundException('File not found');
    }

    res.set({
      'Content-Type': result.contentType,
      'Content-Length': result.contentLength.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
    });

    result.stream.pipe(res);
  }
}
