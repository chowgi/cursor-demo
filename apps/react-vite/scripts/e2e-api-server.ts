import { MongoMemoryServer } from 'mongodb-memory-server';

const port = Number(process.env.APP_MOCK_API_PORT ?? 8080);

async function main(): Promise<void> {
  const memoryServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = memoryServer.getUri('cursor-demo-e2e');
  process.env.DATABASE_NAME = 'cursor-demo-e2e';
  process.env.ENABLE_DEMO_SEEDING = 'false';
  process.env.APP_MOCK_API_PORT = String(port);

  const { startApiServer } = await import('../server/start-server');
  await startApiServer(port);

  process.stdout.write(
    `E2E API server started at http://localhost:${port}/api\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  process.stderr.write(`Failed to start E2E API server: ${message}\n`);
  process.exit(1);
});
