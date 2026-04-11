import { Job } from 'bullmq';
import { exportCreative, ExportOptions } from '../../services/export.service';
import { createWorker, QUEUE_NAMES } from '../setup';

export function startExportWorker() {
  return createWorker(QUEUE_NAMES.EXPORT, async (job: Job) => {
    const options = job.data as ExportOptions;
    return exportCreative(options);
  }, 3);
}
