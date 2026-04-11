import { Router, Request, Response } from 'express';
import { PrismaClient } from '../prisma';
import { getQueue, QUEUE_NAMES } from '../queues/setup';

const router = Router();
const prisma = new PrismaClient();

// GET /api/creative/jobs/:id — Get job status
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;

    // Try to find the creative by jobId
    const creative = await prisma.creative.findFirst({
      where: { jobId },
    });

    if (!creative) {
      // Try to find the job directly in queues
      for (const queueName of Object.values(QUEUE_NAMES)) {
        const queue = getQueue(queueName);
        const job = await queue.getJob(jobId);
        if (job) {
          const state = await job.getState();
          res.json({
            jobId,
            queue: queueName,
            state,
            progress: job.progress,
            data: job.data,
            failedReason: job.failedReason,
            finishedOn: job.finishedOn,
            processedOn: job.processedOn,
          });
          return;
        }
      }

      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json({
      jobId,
      creativeId: creative.id,
      status: creative.status,
      type: creative.type,
      outputUrl: creative.outputUrl,
      errorMsg: creative.errorMsg,
      createdAt: creative.createdAt,
      updatedAt: creative.updatedAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
