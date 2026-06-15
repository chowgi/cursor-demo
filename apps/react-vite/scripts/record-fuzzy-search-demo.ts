import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import dotenv from 'dotenv';
import { chromium, type Page } from 'playwright';

dotenv.config();

const BASE_URL = process.env.APP_URL ?? 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@demo.com';
const ADMIN_PASSWORD = 'password123';
const TYPO_QUERY = 'desgn';
const DEMO_DISCUSSION_TITLE = 'Design review for dashboard refresh';
const OUTPUT_PATH =
  process.env.DEMO_VIDEO_PATH ??
  '/opt/cursor/artifacts/videos/fuzzy-search-discussions-demo.webm';

async function login(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/auth/login`);
  await page.waitForTimeout(1000);
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL('**/app**', { timeout: 15_000 });
  await page.waitForTimeout(2000);
}

async function runDemoFlow(page: Page): Promise<void> {
  await login(page);

  await page.goto(`${BASE_URL}/app/discussions`);
  await page.waitForSelector('table tbody tr', { timeout: 15_000 });
  const initialRows = await page.locator('table tbody tr').count();
  if (initialRows < 2) {
    throw new Error(`Expected multiple discussion rows, found ${initialRows}`);
  }
  await page.waitForTimeout(2500);

  const searchInput = page.getByRole('combobox', { name: 'Search discussions' });
  await searchInput.click();
  await searchInput.pressSequentially(TYPO_QUERY, { delay: 90 });

  await page.getByRole('listbox').waitFor({ state: 'visible', timeout: 15_000 });
  await page.getByText(DEMO_DISCUSSION_TITLE).waitFor({
    state: 'visible',
    timeout: 15_000,
  });
  await page.waitForTimeout(2500);

  await page.getByRole('button', { name: 'Submit search' }).click();
  await page.getByText(/Showing results for:/i).waitFor({ timeout: 15_000 });
  await page.getByText(`"${TYPO_QUERY}"`).waitFor({ timeout: 15_000 });

  const matchingRows = page
    .locator('table tbody tr')
    .filter({ hasText: DEMO_DISCUSSION_TITLE });
  await matchingRows.first().waitFor({ state: 'visible', timeout: 15_000 });
  const rowCount = await matchingRows.count();
  if (rowCount !== 1) {
    throw new Error(
      `Expected exactly 1 matching row for "${TYPO_QUERY}", found ${rowCount}`,
    );
  }

  await page.waitForTimeout(2500);
  await page.waitForTimeout(4000);
}

async function recordDemo(): Promise<void> {
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: dirname(OUTPUT_PATH), size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();

  try {
    await runDemoFlow(page);
  } finally {
    const video = page.video();
    await context.close();

    if (!video) {
      await browser.close();
      throw new Error('Playwright did not produce a video recording');
    }

    await video.saveAs(OUTPUT_PATH);
    await browser.close();

    const { statSync } = await import('node:fs');
    const { size } = statSync(OUTPUT_PATH);
    if (size < 500_000) {
      throw new Error(`Demo video too small (${size} bytes); expected >= 500KB`);
    }

    process.stdout.write(`Demo video saved to ${OUTPUT_PATH} (${size} bytes)\n`);
  }
}

async function main(): Promise<void> {
  const mode = process.argv.includes('--rehearse') ? 'rehearse' : 'record';

  if (mode === 'rehearse') {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    try {
      await runDemoFlow(page);
      process.stdout.write('Rehearsal passed — all assertions succeeded\n');
    } finally {
      await browser.close();
    }
    return;
  }

  await recordDemo();
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  process.stderr.write(`[record-fuzzy-search-demo] Error: ${message}\n`);
  process.exit(1);
});
