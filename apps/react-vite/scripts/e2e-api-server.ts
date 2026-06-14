import dotenv from 'dotenv';

dotenv.config();

const port = Number(process.env.APP_MOCK_API_PORT ?? 8080);

async function main(): Promise<void> {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is required for the E2E API server. Copy .env.example to .env and set MONGODB_URI.',
    );
  }

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
