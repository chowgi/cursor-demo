/**
 * Records a demo video of fuzzy typo search on discussions.
 * Usage:
 *   yarn record:search-demo --rehearse   # verify flow without recording
 *   yarn record:search-demo              # record to artifacts path
 */
import { mkdirSync, readdirSync, renameSync, rmSync, statSync } from 'fs';
import { dirname, join } from 'path';

import { chromium, type Page } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:3000';
const OUTPUT_PATH =
  '/opt/cursor/artifacts/videos/fuzzy-search-discussions-demo.webm';
const OUTPUT_DIR = dirname(OUTPUT_PATH);
const REHEARSE = process.argv.includes('--rehearse');

const pause = (page: Page, ms: number) => page.waitForTimeout(ms);

const clearOutputDir = () => {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  for (const file of readdirSync(OUTPUT_DIR)) {
    if (file.endsWith('.webm')) {
      rmSync(join(OUTPUT_DIR, file));
    }
  }
};

const verifyVideo = (path: string) => {
  const stats = statSync(path);
  if (stats.size < 500_000) {
    throw new Error(`Video too small (${stats.size} bytes). Minimum is 500KB.`);
  }
};

const login = async (page: Page) => {
  await page.goto(`${BASE_URL}/auth/login`);
  await pause(page, 1500);
  await page.getByLabel('Email').fill('admin@demo.com');
  await page.getByLabel('Password').fill('password123');
  await pause(page, 500);
  await page.getByRole('button', { name: /log in/i }).click();
  await page.waitForURL('**/app**');
  await pause(page, 2000);
};

const runDemoFlow = async (page: Page) => {
  await page.goto(`${BASE_URL}/app/discussions`);
  await page.getByRole('heading', { name: /discussions/i }).waitFor();
  await page.getByRole('row').nth(1).waitFor();
  await pause(page, 2500);

  const searchInput = page.getByRole('combobox', {
    name: /search discussions/i,
  });
  await searchInput.click();
  await searchInput.pressSequentially('desgn', { delay: 100 });

  const suggestion = page.getByRole('option', {
    name: /design review for dashboard refresh/i,
  });
  await suggestion.waitFor({ state: 'visible', timeout: 10000 });
  await pause(page, 2000);

  await page.getByRole('button', { name: /submit search/i }).click();
  await page.getByText(/showing results for:/i).waitFor();
  await page.getByText('"desgn"').waitFor();
  await page.getByText(/1 result/i).waitFor();
  await page
    .getByRole('cell', { name: /design review for dashboard refresh/i })
    .waitFor();
  await pause(page, 2500);
  await pause(page, 3000);
};

const main = async () => {
  if (!REHEARSE) {
    clearOutputDir();
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(
    REHEARSE
      ? { viewport: { width: 1280, height: 720 } }
      : {
          viewport: { width: 1280, height: 720 },
          recordVideo: {
            dir: OUTPUT_DIR,
            size: { width: 1280, height: 720 },
          },
        },
  );
  const page = await context.newPage();

  try {
    await login(page);
    await runDemoFlow(page);
  } finally {
    await context.close();
    await browser.close();
  }

  if (!REHEARSE) {
    const recorded = readdirSync(OUTPUT_DIR).find((f) => f.endsWith('.webm'));
    if (!recorded) {
      throw new Error('No video file was recorded.');
    }
    const recordedPath = join(OUTPUT_DIR, recorded);
    renameSync(recordedPath, OUTPUT_PATH);
    verifyVideo(OUTPUT_PATH);
    process.stdout.write(`Demo recorded: ${OUTPUT_PATH} (size OK)\n`);
  } else {
    process.stdout.write('Rehearsal passed.\n');
  }
};

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
