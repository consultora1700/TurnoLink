import { Job } from 'bullmq';
import { PrismaClient } from '../../prisma';
import { generateMockup, MockupOptions } from '../../services/mockup.service';
import { createWorker, QUEUE_NAMES } from '../setup';

const prisma = new PrismaClient();

export function startMockupWorker() {
  return createWorker(QUEUE_NAMES.MOCKUP, async (job: Job) => {
    const { creativeId, options } = job.data as {
      creativeId: string;
      options: MockupOptions;
    };

    await prisma.creative.update({
      where: { id: creativeId },
      data: { status: 'processing' },
    });

    try {
      const result = await generateMockup(options);

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
