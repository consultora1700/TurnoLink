import { Job } from 'bullmq';
import { PrismaClient } from '../../prisma';
import { renderComposition, CompositionData } from '../../services/composition.service';
import { createWorker, QUEUE_NAMES } from '../setup';

const prisma = new PrismaClient();

export function startCompositionWorker() {
  return createWorker(QUEUE_NAMES.COMPOSITION, async (job: Job) => {
    const { creativeId, data, tenantId, format, quality } = job.data as {
      creativeId: string;
      data: CompositionData;
      tenantId: string;
      format: 'png' | 'jpg' | 'webp';
      quality: number;
    };

    await prisma.creative.update({
      where: { id: creativeId },
      data: { status: 'processing' },
    });

    try {
      const result = await renderComposition(data, tenantId, format, quality);

      await prisma.creative.update({
        where: { id: creativeId },
        data: {
          status: 'completed',
          outputPath: result.outputPath,
          outputUrl: result.outputUrl,
          width: result.width,
          height: result.height,
          fileSize: result.fileSize,
          format: result.format,
        },
      });

      return result;
    } catch (error: any) {
      await prisma.creative.update({
        where: { id: creativeId },
        data: {
          status: 'failed',
          errorMsg: error.message,
        },
      });
      throw error;
    }
  }, 2);
}
