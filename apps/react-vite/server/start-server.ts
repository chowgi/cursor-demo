import type { Server } from 'http';

import type { Express } from 'express';

import { serverEnv } from './env';

export function listenOnPort(app: Express, port: number): Promise<Server> {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      resolve(server);
    });
  });
}

export async function startApiServer(port: number): Promise<Server> {
  const { createApp } = await import('./app');
  const app = await createApp();
  return listenOnPort(app, port);
}

export function getDefaultApiPort(): number {
  return serverEnv.APP_MOCK_API_PORT;
}
