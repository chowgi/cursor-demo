import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import logger from 'pino-http';

import { connectDb } from './db';
import { serverEnv } from './env';
import { authRouter } from './routes/auth';
import { commentsRouter } from './routes/comments';
import { discussionsRouter } from './routes/discussions';
import { healthRouter } from './routes/health';
import { teamsRouter } from './routes/teams';
import { usersRouter } from './routes/users';

export async function createApp(): Promise<Express> {
  await connectDb();

  const app = express();

  app.use(
    cors({
      origin: serverEnv.APP_URL,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(cookieParser());
  app.use(logger());

  app.use('/api', healthRouter);
  app.use('/api', authRouter);
  app.use('/api', teamsRouter);
  app.use('/api', usersRouter);
  app.use('/api', discussionsRouter);
  app.use('/api', commentsRouter);

  return app;
}
