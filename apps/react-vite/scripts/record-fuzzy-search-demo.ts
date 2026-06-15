import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import { chromium } from '@playwright/test';

const BASE_URL = process.env.DEMO_BASE_URL ?? 'http://localhost:3000';
const OUTPUT_PATH =
  process.env.DEMO_VIDEO_PATH ??
  '/opt/cursor/artifacts/videos/fuzzy-search-discussions-demo.webm';

const DEMO_DISCUSSION_TITLE = 'Design review for dashboard refresh';
const TYPO_QUERY = 'desgn';

async function runDemoFlow(recordVideoDir?: string): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(
    recordVideoDir
      ? {
          recordVideo: {
            dir: recordVideoDir,
            size: { width: 1280, height: 720 },
          },
        }
      : {},
  );
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/auth/login`);
  await page.locator('input[type="email"]').fill('admin@demo.com');
  await page.locator('input[type="password"]').fill('password123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL('**/app**', { timeout: 15_000 });
  await page.waitForTimeout(2000);

  await page.goto(`${BASE_URL}/app/discussions`);
  await page.waitForTimeout(2500);

  const searchInput = page.getByRole('combobox', { name: 'Search discussions' });
  await searchInput.click();
  await searchInput.pressSequentially(TYPO_QUERY, { delay: 90 });

  const suggestion = page.getByRole('option', {
    name: new RegExp(DEMO_DISCUSSION_TITLE, 'i'),
  });
  await suggestion.waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Submit search' }).click();
  await page.getByText(/Showing results for:/i).waitFor({ timeout: 15_000 });
  await page.getByText(`"${TYPO_QUERY}"`).waitFor({ timeout: 15_000 });
  await page
    .getByRole('cell', { name: new RegExp(DEMO_DISCUSSION_TITLE, 'i') })
    .waitFor({ timeout: 15_000 });
  await page.waitForTimeout(1500);

  const rows = page.getByRole('row').filter({
    has: page.getByRole('cell', { name: new RegExp(DEMO_DISCUSSION_TITLE, 'i') }),
  });
  if ((await rows.count()) !== 1) {
    throw new Error(`Expected exactly 1 matching row, found ${await rows.count()}`);
  }

  await page.waitForTimeout(5000);

  if (recordVideoDir) {
    const video = page.video();
    if (!video) {
      throw new Error('Playwright did not produce a video recording');
    }

    await page.close();
    mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
    await video.saveAs(OUTPUT_PATH);
    await context.close();
    await browser.close();
  } else {
    await context.close();
    await browser.close();
  }
}

async function main(): Promise<void> {
  const mode = process.argv.includes('--record') ? 'record' : 'rehearse';

  if (mode === 'rehearse') {
    await runDemoFlow();
    process.stdout.write('Rehearsal passed.\n');
    return;
  }

  const videoDir = '/tmp/fuzzy-search-demo-video';
  mkdirSync(videoDir, { recursive: true });
  await runDemoFlow(videoDir);

  const { statSync } = await import('node:fs');
  const stats = statSync(OUTPUT_PATH);
  if (stats.size < 500_000) {
    throw new Error(`Video too small (${stats.size} bytes); expected >= 500 KB`);
  }

  process.stdout.write(`Demo video saved to ${OUTPUT_PATH} (${stats.size} bytes)\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
