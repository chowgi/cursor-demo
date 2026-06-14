import dotenv from 'dotenv';

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const serverEnv = {
  get MONGODB_URI(): string {
    return required('MONGODB_URI');
  },
  get APP_URL(): string {
    return process.env.APP_URL ?? 'http://localhost:3000';
  },
  get APP_MOCK_API_PORT(): number {
    return Number(process.env.APP_MOCK_API_PORT ?? 8080);
  },
  get ENABLE_DEMO_SEEDING(): boolean {
    return process.env.ENABLE_DEMO_SEEDING !== 'false';
  },
  get DATABASE_NAME(): string {
    return process.env.DATABASE_NAME ?? 'cursor-demo';
  },
};
