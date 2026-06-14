import type { Server } from 'http';

import { MongoMemoryServer } from 'mongodb-memory-server';

const TEST_API_PORT = 8081;

let memoryServer: MongoMemoryServer | null = null;
let httpServer: Server | null = null;

export const TEST_API_URL = `http://localhost:${TEST_API_PORT}/api`;

export async function startTestServer(): Promise<string> {
  if (httpServer) {
    return TEST_API_URL;
  }

  memoryServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = memoryServer.getUri('cursor-demo-test');
  process.env.DATABASE_NAME = 'cursor-demo-test';
  process.env.ENABLE_DEMO_SEEDING = 'false';
  process.env.APP_MOCK_API_PORT = String(TEST_API_PORT);
  process.env.APP_URL = 'http://localhost:3000';

  const { closeDb } = await import('../../server/db');
  const { startApiServer } = await import('../../server/start-server');

  httpServer = await startApiServer(TEST_API_PORT);

  return TEST_API_URL;
}

export async function stopTestServer(): Promise<void> {
  if (httpServer) {
    await new Promise<void>((resolve, reject) => {
      httpServer!.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
    httpServer = null;
  }

  const { closeDb } = await import('../../server/db');
  await closeDb();

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

export async function resetTestServerDatabase(): Promise<void> {
  const { resetDatabase } = await import('../../server/reset-db');
  await resetDatabase();
}
