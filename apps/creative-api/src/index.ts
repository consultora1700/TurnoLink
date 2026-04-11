import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { adminAuth } from './middleware/admin-auth';
import { ensureAllDirs } from './utils/storage';

// Routes
import screenshotsRouter from './routes/screenshots';
import mockupsRouter from './routes/mockups';
import compositionsRouter from './routes/compositions';
import templatesRouter from './routes/templates';
import aiCopyRouter from './routes/ai-copy';
import animationsRouter from './routes/animations';
import exportsRouter from './routes/exports';
import assetsRouter from './routes/assets';
import jobsRouter from './routes/jobs';
import tenantsRouter from './routes/tenants';
import marketingRouter from './routes/marketing';

// Workers
import { startScreenshotWorker } from './queues/workers/screenshot.worker';
import { startMockupWorker } from './queues/workers/mockup.worker';
import { startCompositionWorker } from './queues/workers/composition.worker';
import { startAnimationWorker } from './queues/workers/animation.worker';
import { startExportWorker } from './queues/workers/export.worker';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve generated files statically
app.use('/files', express.static(config.storagePath));

// Health check (no auth required)
app.get('/api/creative/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// All routes require admin auth
app.use('/api/creative', adminAuth);

// Mount routes
app.use('/api/creative/screenshots', screenshotsRouter);
app.use('/api/creative/mockups', mockupsRouter);
app.use('/api/creative/compositions', compositionsRouter);
app.use('/api/creative/templates', templatesRouter);
app.use('/api/creative/ai-copy', aiCopyRouter);
app.use('/api/creative/animations', animationsRouter);
app.use('/api/creative/exports', exportsRouter);
app.use('/api/creative/assets', assetsRouter);
app.use('/api/creative/jobs', jobsRouter);
app.use('/api/creative/tenants', tenantsRouter);
app.use('/api/creative/marketing', marketingRouter);

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

async function start() {
  // Ensure storage directories exist
  ensureAllDirs();

  // Start workers
  console.log('Starting workers...');
  startScreenshotWorker();
  startMockupWorker();
  startCompositionWorker();
  startAnimationWorker();
  startExportWorker();
  console.log('All workers started');

  // Start server
  app.listen(config.port, () => {
    console.log(`Creative API running on port ${config.port}`);
    console.log(`Storage path: ${config.storagePath}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
}

start().catch((err) => {
  console.error('Failed to start Creative API:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  const { closeSharedBrowser } = await import('./utils/browser-pool');
  const { closeQueues } = await import('./queues/setup');
  await closeSharedBrowser();
  await closeQueues();
  process.exit(0);
});
