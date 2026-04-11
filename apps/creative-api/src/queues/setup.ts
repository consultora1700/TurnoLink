import { Queue, Worker, Job } from 'bullmq';
import { config } from '../config';

let connection: any = null;

export function getRedisConnection(): any {
  if (!connection) {
    // Use ioredis from bullmq's dependency to avoid version conflicts
    const IORedis = require('ioredis');
    connection = new IORedis(config.redisUrl, {
      maxRetriesPerRequest: null,
    });
  }
  return connection;
}

// Queue names
export const QUEUE_NAMES = {
  SCREENSHOT: 'creative-screenshot',
  MOCKUP: 'creative-mockup',
  COMPOSITION: 'creative-composition',
  ANIMATION: 'creative-animation',
  EXPORT: 'creative-export',
  MARKETING: 'creative-marketing',
} as const;

// Queues
const queues: Record<string, Queue> = {};

export function getQueue(name: string): Queue {
  if (!queues[name]) {
    queues[name] = new Queue(name, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
        attempts: 2,
        backoff: { type: 'exponential', delay: 2000 },
      },
    });
  }
  return queues[name];
}

export function createWorker(
  queueName: string,
  processor: (job: Job) => Promise<any>,
  concurrency: number = 2
): Worker {
  const worker = new Worker(queueName, processor, {
    connection: getRedisConnection(),
    concurrency,
  });

  worker.on('failed', (job, err) => {
    console.error(`[${queueName}] Job ${job?.id} failed:`, err.message);
  });

  worker.on('completed', (job) => {
    console.log(`[${queueName}] Job ${job.id} completed`);
  });

  return worker;
}

export async function closeQueues(): Promise<void> {
  for (const queue of Object.values(queues)) {
    await queue.close();
  }
  if (connection) {
    connection.disconnect();
    connection = null;
  }
}
