import { test, expect } from '@playwright/test';

import { createDiscussion } from '../../src/testing/data-generators';

const SEARCH_TERM = 'dashboard';
const DEMO_DISCUSSION_TITLE = 'Design review for dashboard refresh';

test.describe('Discussions search and CRUD', () => {
  test('searches discussions, creates a new entry, then deletes it', async ({
    page,
  }) => {
    test.setTimeout(120_000);

    const newDiscussion = createDiscussion({
      title: `[e2e-search] ${Date.now()}`,
      body: 'End-to-end test discussion for search and CRUD verification.',
    });

    await page.goto('/app/discussions');
    await expect(
      page.getByRole('combobox', { name: 'Search discussions' }),
    ).toBeVisible();

    const searchInput = page.getByRole('combobox', {
      name: 'Search discussions',
    });
    await searchInput.click();
    await searchInput.pressSequentially(SEARCH_TERM, { delay: 90 });

    await expect(page.getByRole('listbox')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(DEMO_DISCUSSION_TITLE)).toBeVisible();
    await page.waitForTimeout(1500);

    await page.getByRole('button', { name: 'Submit search' }).click();
    await expect(page.getByText(/Showing results for:/i)).toBeVisible();
    await expect(page.getByText(`"${SEARCH_TERM}"`)).toBeVisible();
    await expect(
      page.getByRole('cell', { name: new RegExp(DEMO_DISCUSSION_TITLE, 'i') }),
    ).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(1500);

    await page.getByText('Clear').click();
    await expect(page.getByText(/Showing results for:/i)).not.toBeVisible();

    await page.getByRole('button', { name: 'Create Discussion' }).click();
    await page.getByLabel('Title').fill(newDiscussion.title);
    await page.getByLabel('Body').fill(newDiscussion.body);
    await page.getByRole('button', { name: 'Submit' }).click();
    await page
      .getByLabel('Discussion Created')
      .getByRole('button', { name: 'Close' })
      .click();

    await expect(
      page.getByRole('cell', { name: newDiscussion.title }),
    ).toBeVisible({ timeout: 10_000 });

    const discussionRow = page
      .getByRole('row')
      .filter({ hasText: newDiscussion.title });
    await discussionRow
      .getByRole('button', { name: 'Delete Discussion' })
      .click();

    const confirmDialog = page.getByRole('dialog', { name: 'Delete Discussion' });
    await expect(confirmDialog).toBeVisible();
    await confirmDialog
      .getByRole('button', { name: 'Delete Discussion' })
      .click();
    await page
      .getByLabel('Discussion Deleted')
      .getByRole('button', { name: 'Close' })
      .click();

    await expect(
      page.getByRole('cell', { name: newDiscussion.title }),
    ).not.toBeVisible();
    await page.waitForTimeout(2000);
  });
});
