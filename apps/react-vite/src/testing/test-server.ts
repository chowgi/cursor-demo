import type { Server } from 'http';

import dotenv from 'dotenv';

dotenv.config();

const TEST_API_PORT = 8081;

let httpServer: Server | null = null;

export const TEST_API_URL = `http://localhost:${TEST_API_PORT}/api`;

export async function startTestServer(): Promise<string> {
  if (httpServer) {
    return TEST_API_URL;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is required for integration tests. Copy .env.example to .env and set MONGODB_URI.',
    );
  }

  process.env.APP_MOCK_API_PORT = String(TEST_API_PORT);
  process.env.APP_URL = 'http://localhost:3000';
  process.env.ENABLE_DEMO_SEEDING = 'false';

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
}
