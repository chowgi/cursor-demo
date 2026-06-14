import { mkdir, rename } from 'fs/promises';
import path from 'path';

import { type Locator, chromium } from '@playwright/test';

const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';
const ARTIFACTS_DIR =
  process.env.DEMO_ARTIFACTS_DIR ?? '/opt/cursor/artifacts/videos';
const DEMO_VIDEO_NAME = 'fuzzy-search-discussions-demo.webm';

const typeSlowly = async (
  locator: Locator,
  text: string,
  delayMs = 120,
): Promise<void> => {
  for (const char of text) {
    await locator.press(char, { delay: delayMs });
  }
};

const recordDemo = async (): Promise<string> => {
  await mkdir(ARTIFACTS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: ARTIFACTS_DIR,
      size: { width: 1280, height: 720 },
    },
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  await page.goto(`${APP_URL}/auth/login`);
  await page.getByLabel('Email Address').fill('admin@demo.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL(`${APP_URL}/app`);

  await page.goto(`${APP_URL}/app/discussions`);
  await page.getByText('Design review for dashboard refresh').waitFor();

  const searchInput = page.getByRole('combobox', {
    name: 'Search discussions',
  });

  await searchInput.click();
  await typeSlowly(searchInput, 'desgn');

  await page
    .getByRole('option', { name: /Design review for dashboard refresh/i })
    .waitFor({ timeout: 5000 });

  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Submit search' }).click();

  await page.getByText('Showing results for:').waitFor();
  await page.getByText('Design review for dashboard refresh').waitFor();
  await page.waitForTimeout(1200);

  const video = page.video();
  await context.close();
  await browser.close();

  if (!video) {
    throw new Error('Playwright did not produce a video recording.');
  }

  const recordedPath = await video.path();
  const finalPath = path.join(ARTIFACTS_DIR, DEMO_VIDEO_NAME);
  await rename(recordedPath, finalPath);

  return finalPath;
};

recordDemo()
  .then((videoPath) => {
    process.stdout.write(`${videoPath}\n`);
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exit(1);
  });
