import { Job } from 'bullmq';
import { PrismaClient } from '../../prisma';
import { createAnimation, AnimationOptions } from '../../services/animation.service';
import { createWorker, QUEUE_NAMES } from '../setup';

const prisma = new PrismaClient();

export function startAnimationWorker() {
  return createWorker(QUEUE_NAMES.ANIMATION, async (job: Job) => {
    const { creativeId, options } = job.data as {
      creativeId: string;
      options: AnimationOptions;
    };

    await prisma.creative.update({
      where: { id: creativeId },
      data: { status: 'processing' },
    });

    try {
      const result = await createAnimation(options);

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
  }, 1); // concurrency 1 for FFmpeg
}
