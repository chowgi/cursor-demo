import { createApp } from './app';
import { serverEnv } from './env';
import { seedDemoData } from './seed';
import { listenOnPort } from './start-server';

async function start(): Promise<void> {
  const app = await createApp();

  if (serverEnv.ENABLE_DEMO_SEEDING) {
    await seedDemoData();
  }

  await listenOnPort(app, serverEnv.APP_MOCK_API_PORT);

  process.stdout.write(
    `MongoDB API server started at http://localhost:${serverEnv.APP_MOCK_API_PORT}/api\n`,
  );
}

start().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  process.stderr.write(`Failed to start server: ${message}\n`);
  process.exit(1);
});
