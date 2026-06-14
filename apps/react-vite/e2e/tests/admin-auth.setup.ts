import { test as setup, expect } from '@playwright/test';

import { AUTH_COOKIE } from '../../server/auth';
import { DEMO_PASSWORD } from '../../server/seed-data';

const authFile = 'e2e/.auth/admin.json';
const API_URL = 'http://localhost:8080/api';

setup('authenticate as demo admin', async ({ page, request }) => {
  const loginResponse = await request.post(`${API_URL}/auth/login`, {
    data: {
      email: 'admin@demo.com',
      password: DEMO_PASSWORD,
    },
  });

  expect(loginResponse.ok()).toBeTruthy();

  const { jwt } = (await loginResponse.json()) as { jwt: string };

  await page.context().addCookies([
    {
      name: AUTH_COOKIE,
      value: jwt,
      domain: 'localhost',
      path: '/',
    },
  ]);

  await page.goto('/app/discussions');
  await expect(
    page.getByRole('combobox', { name: 'Search discussions' }),
  ).toBeVisible({ timeout: 15_000 });

  await page.context().storageState({ path: authFile });
});
