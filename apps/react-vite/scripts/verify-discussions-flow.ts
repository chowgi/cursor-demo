import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.VITE_APP_API_URL ?? 'http://localhost:8080/api';
const ADMIN_EMAIL = 'admin@demo.com';
const ADMIN_PASSWORD = 'password123';
const SEARCH_TERM = 'dashboard';
const DEMO_DISCUSSION_TITLE = 'Design review for dashboard refresh';

type ApiResponse<T> = {
  data?: T;
  meta?: { total: number; page: number; totalPages: number };
  message?: string;
};

type Discussion = {
  id: string;
  title: string;
  body: string;
};

let authCookie = '';

function logStep(step: string, ok: boolean, detail?: string): void {
  const status = ok ? 'PASS' : 'FAIL';
  process.stdout.write(`[verify-flow] ${step}: ${status}`);
  if (detail) {
    process.stdout.write(` — ${detail}`);
  }
  process.stdout.write('\n');
}

function extractCookie(setCookieHeader: string | null): string {
  if (!setCookieHeader) {
    throw new Error('Missing Set-Cookie header from login response');
  }

  const cookie = setCookieHeader.split(';')[0];
  authCookie = cookie;
  return cookie;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ response: Response; body: ApiResponse<T> | T }> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (authCookie) {
    headers.set('Cookie', authCookie);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const body = (await response.json()) as ApiResponse<T> | T;
  return { response, body };
}

async function waitForSearchResult(
  title: string,
  maxAttempts = 5,
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const { response, body } = await apiFetch<Discussion[]>(
      `/discussions?q=${encodeURIComponent(SEARCH_TERM)}`,
    );

    if (!response.ok) {
      throw new Error(`Search request failed with status ${response.status}`);
    }

    const discussions = (body as ApiResponse<Discussion[]>).data ?? [];
    if (discussions.some((discussion) => discussion.title === title)) {
      return true;
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return false;
}

async function main(): Promise<void> {
  process.stdout.write('[verify-flow] Starting discussions flow verification\n');
  process.stdout.write(`[verify-flow] API URL: ${API_URL}\n`);

  const health = await fetch(`${API_URL}/healthcheck`);
  logStep('API healthcheck', health.ok);

  if (!health.ok) {
    process.exitCode = 1;
    return;
  }

  const loginResponse = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  const loginBody = (await loginResponse.json()) as { jwt?: string };
  logStep(
    'Login as admin@demo.com',
    loginResponse.ok && Boolean(loginBody.jwt),
  );

  if (!loginResponse.ok) {
    process.exitCode = 1;
    return;
  }

  extractCookie(loginResponse.headers.get('set-cookie'));

  const discussionTitle = `[verify-flow] ${Date.now()}`;
  const createResult = await apiFetch<Discussion>('/discussions', {
    method: 'POST',
    body: JSON.stringify({
      title: discussionTitle,
      body: 'Temporary discussion created by verify-discussions-flow script.',
    }),
  });

  const createdDiscussion = createResult.body as Discussion;
  logStep(
    'Create discussion',
    createResult.response.ok && Boolean(createdDiscussion.id),
  );

  if (!createResult.response.ok || !createdDiscussion.id) {
    process.exitCode = 1;
    return;
  }

  const listResult = await apiFetch<Discussion[]>('/discussions');
  const listDiscussions = (listResult.body as ApiResponse<Discussion[]>).data ?? [];
  logStep(
    'Appears in full list',
    listDiscussions.some((discussion) => discussion.id === createdDiscussion.id),
  );

  const searchFound = await waitForSearchResult(DEMO_DISCUSSION_TITLE);
  logStep(
    `Atlas Search for "${SEARCH_TERM}"`,
    searchFound,
    searchFound ? `found "${DEMO_DISCUSSION_TITLE}"` : 'demo discussion not indexed yet',
  );

  const suggestionsResult = await apiFetch<Discussion[]>(
    `/discussions?suggestions=true&q=${encodeURIComponent(SEARCH_TERM.slice(0, 4))}`,
  );
  const suggestions =
    (suggestionsResult.body as ApiResponse<Discussion[]>).data ?? [];
  logStep(
    'Autocomplete suggestions',
    suggestionsResult.response.ok && suggestions.length > 0,
    `${suggestions.length} suggestion(s)`,
  );

  const deleteResult = await apiFetch<Discussion>(
    `/discussions/${createdDiscussion.id}`,
    { method: 'DELETE' },
  );
  logStep('Delete discussion', deleteResult.response.ok);

  const afterDeleteResult = await apiFetch<Discussion[]>('/discussions');
  const afterDeleteDiscussions =
    (afterDeleteResult.body as ApiResponse<Discussion[]>).data ?? [];
  logStep(
    'Removed from list',
    !afterDeleteDiscussions.some(
      (discussion) => discussion.id === createdDiscussion.id,
    ),
  );

  if (
    !searchFound ||
    !deleteResult.response.ok ||
    afterDeleteDiscussions.some(
      (discussion) => discussion.id === createdDiscussion.id,
    )
  ) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  process.stderr.write(`[verify-flow] Error: ${message}\n`);
  process.exit(1);
});
