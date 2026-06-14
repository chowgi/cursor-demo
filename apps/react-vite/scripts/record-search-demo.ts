import { chromium, type Page } from '@playwright/test';
import { mkdir, readdir, rename, stat } from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';

const BASE_URL = process.env.DEMO_BASE_URL ?? 'http://127.0.0.1:3000';
const OUTPUT_PATH =
  process.env.DEMO_VIDEO_PATH ??
  '/opt/cursor/artifacts/videos/fuzzy-search-discussions-demo.webm';
const REHEARSE = process.argv.includes('--rehearse');
const TYPO_QUERY = 'desgn';
const TARGET_TITLE = 'Design review for dashboard refresh';
const MIN_DURATION_SEC = 15;
const MIN_SIZE_BYTES = 500_000;
const TYPING_DELAY_MS = 90;
const HOLD_MS = 2000;
const PAUSE_MS = 1500;

const assertVisible = async (
  page: Page,
  locator: ReturnType<Page['getByRole']>,
  label: string,
): Promise<void> => {
  try {
    await locator.waitFor({ state: 'visible', timeout: 15000 });
  } catch {
    throw new Error(`Demo assertion failed: ${label} is not visible`);
  }
};

const pause = async (page: Page, ms: number): Promise<void> => {
  await page.waitForTimeout(ms);
};

const runDemoFlow = async (page: Page): Promise<void> => {
  await page.goto(`${BASE_URL}/auth/login`);
  await assertVisible(page, page.getByLabel(/email address/i), 'Email field');

  await page.getByLabel(/email address/i).fill('admin@demo.com');
  await pause(page, 400);
  await page.getByLabel(/password/i).fill('password123');
  await pause(page, 400);
  await page.getByRole('button', { name: /log in/i }).click();
  await page.waitForURL(/\/app(\/|$)/, { timeout: 15000 });
  await pause(page, PAUSE_MS);

  await page.goto(`${BASE_URL}/app/discussions`);
  const searchInput = page.getByRole('combobox', {
    name: /search discussions/i,
  });
  await assertVisible(page, searchInput, 'Search discussions combobox');

  await assertVisible(
    page,
    page.getByRole('cell', { name: TARGET_TITLE }),
    'Full discussions list (design review row)',
  );
  await pause(page, PAUSE_MS);

  await searchInput.click();
  await searchInput.pressSequentially(TYPO_QUERY, { delay: TYPING_DELAY_MS });

  const suggestion = page.getByRole('option', {
    name: new RegExp(TARGET_TITLE, 'i'),
  });
  await assertVisible(page, suggestion, 'Autocomplete suggestion for typo query');
  await pause(page, PAUSE_MS);

  await page.getByRole('button', { name: /submit search/i }).click();

  await assertVisible(
    page,
    page.getByText(new RegExp(`Showing results for.*${TYPO_QUERY}`, 'i')),
    'Search results banner',
  );
  await assertVisible(
    page,
    page.getByRole('cell', { name: TARGET_TITLE }),
    'Filtered search result row',
  );

  const otherDiscussion = page.getByRole('cell', {
    name: 'API versioning strategy',
  });
  if (await otherDiscussion.isVisible()) {
    throw new Error(
      'Demo assertion failed: unrelated discussion still visible after search',
    );
  }

  await pause(page, HOLD_MS);
};

const getVideoDurationSeconds = (videoPath: string): number => {
  try {
    const output = execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${videoPath}"`,
      { encoding: 'utf8' },
    ).trim();
    return Number.parseFloat(output);
  } catch {
    return 0;
  }
};

const verifyRecordedVideo = async (videoPath: string): Promise<void> => {
  const fileStats = await stat(videoPath);

  if (fileStats.size < MIN_SIZE_BYTES) {
    throw new Error(
      `Recorded video too small (${fileStats.size} bytes; need ≥${MIN_SIZE_BYTES})`,
    );
  }

  const duration = getVideoDurationSeconds(videoPath);
  if (duration > 0 && duration < MIN_DURATION_SEC) {
    throw new Error(
      `Recorded video too short (${duration.toFixed(1)}s; need ≥${MIN_DURATION_SEC}s)`,
    );
  }
};

const runRehearsal = async (): Promise<void> => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });

  try {
    await runDemoFlow(page);
    process.stdout.write('Rehearsal passed: all demo assertions succeeded\n');
  } finally {
    await browser.close();
  }
};

const runRecording = async (): Promise<void> => {
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: path.dirname(OUTPUT_PATH),
      size: { width: 1280, height: 720 },
    },
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  try {
    await runDemoFlow(page);
  } finally {
    await context.close();
    await browser.close();

    const videosDir = path.dirname(OUTPUT_PATH);
    const entries = await readdir(videosDir);
    const latestVideo = entries.find((entry) => entry.endsWith('.webm'));

    if (!latestVideo) {
      throw new Error('Recording failed: no WebM file produced');
    }

    const tempPath = path.join(videosDir, latestVideo);
    if (tempPath !== OUTPUT_PATH) {
      await rename(tempPath, OUTPUT_PATH);
    }

    await verifyRecordedVideo(OUTPUT_PATH);
    process.stdout.write(`Demo video saved: ${OUTPUT_PATH}\n`);
  }
};

const main = async (): Promise<void> => {
  if (REHEARSE) {
    await runRehearsal();
    return;
  }

  await runRecording();
};

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
});
