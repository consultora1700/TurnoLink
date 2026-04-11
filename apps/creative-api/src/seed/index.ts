import { seedDeviceFrames } from './device-frames';
import { seedTemplates } from './templates';

async function main() {
  console.log('Starting Creative API seed...');

  await seedDeviceFrames();
  await seedTemplates();

  console.log('Seed complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
