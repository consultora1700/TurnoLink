import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3005', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  adminApiKey: process.env.ADMIN_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  storagePath: process.env.STORAGE_PATH || '/var/www/turnolink/creative-storage',
  baseUrl: process.env.BASE_URL || 'http://localhost:3005',

  paths: {
    screenshots: '',
    mockups: '',
    compositions: '',
    animations: '',
    exports: '',
    assets: '',
    deviceFrames: '',
    marketing: '',
  },
};

// Build storage paths
const sp = config.storagePath;
config.paths = {
  screenshots: path.join(sp, 'screenshots'),
  mockups: path.join(sp, 'mockups'),
  compositions: path.join(sp, 'compositions'),
  animations: path.join(sp, 'animations'),
  exports: path.join(sp, 'exports'),
  assets: path.join(sp, 'assets'),
  deviceFrames: path.join(sp, 'device-frames'),
  marketing: path.join(sp, 'marketing'),
};
