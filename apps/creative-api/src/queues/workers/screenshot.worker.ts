import { Job } from 'bullmq';
import { PrismaClient } from '../../prisma';
import { takeScreenshot, ScreenshotOptions } from '../../services/screenshot.service';
import { createWorker, QUEUE_NAMES } from '../setup';

const prisma = new PrismaClient();

export function startScreenshotWorker() {
  return createWorker(QUEUE_NAMES.SCREENSHOT, async (job: Job) => {
    const { creativeId, options } = job.data as {
      creativeId: string;
      options: ScreenshotOptions;
    };

    await prisma.creative.update({
      where: { id: creativeId },
      data: { status: 'processing' },
    });

    try {
      const result = await takeScreenshot(options);

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
  }, 1); // concurrency 1 for screenshots (heavy)
}
