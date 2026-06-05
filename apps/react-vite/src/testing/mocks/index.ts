import { env } from '@/config/env';

export const enableMocking = async () => {
  if (env.ENABLE_API_MOCKING) {
    const { worker } = await import('./browser');
    const { initializeDb } = await import('./db');
    await initializeDb();

    if (env.ENABLE_DEMO_SEEDING) {
      const { seedDemoData } = await import('./seed-db');
      await seedDemoData();
    }

    return worker.start();
  }
};
