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
  MONGODB_URI: required('MONGODB_URI'),
  APP_URL: process.env.APP_URL ?? 'http://localhost:3000',
  APP_MOCK_API_PORT: Number(process.env.APP_MOCK_API_PORT ?? 8080),
  ENABLE_DEMO_SEEDING: process.env.ENABLE_DEMO_SEEDING !== 'false',
  DATABASE_NAME: 'cursor-demo',
};
