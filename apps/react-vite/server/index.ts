import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import logger from 'pino-http';

import { connectDb } from './db';
import { serverEnv } from './env';
import { authRouter } from './routes/auth';
import { commentsRouter } from './routes/comments';
import { discussionsRouter } from './routes/discussions';
import { healthRouter } from './routes/health';
import { teamsRouter } from './routes/teams';
import { usersRouter } from './routes/users';
import { seedDemoData } from './seed';

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

async function start(): Promise<void> {
  await connectDb();

  if (serverEnv.ENABLE_DEMO_SEEDING) {
    await seedDemoData();
  }

  app.listen(serverEnv.APP_MOCK_API_PORT, () => {
    process.stdout.write(
      `MongoDB API server started at http://localhost:${serverEnv.APP_MOCK_API_PORT}/api\n`,
    );
  });
}

start().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  process.stderr.write(`Failed to start server: ${message}\n`);
  process.exit(1);
});
