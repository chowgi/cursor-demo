import { config } from 'dotenv';
import * as z from 'zod';

config();

const EnvSchema = z.object({
  MONGODB_URI: z.string().min(1),
  APP_URL: z.string().optional().default('http://localhost:3000'),
  APP_MOCK_API_PORT: z.string().optional().default('8080'),
  ENABLE_DEMO_SEEDING: z
    .string()
    .optional()
    .transform((value) => value !== 'false'),
});

const parsedEnv = EnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid server env provided.
The following variables are missing or invalid:
${Object.entries(parsedEnv.error.flatten().fieldErrors)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}
`,
  );
}

export const env = parsedEnv.data;

export const DB_NAME = 'cursor-demo';
