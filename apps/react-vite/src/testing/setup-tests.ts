import '@testing-library/jest-dom/vitest';

import Cookies from 'js-cookie';

import { AUTH_COOKIE } from '../../server/auth';
import { startTestServer, stopTestServer } from '@/testing/test-server';

vi.mock('zustand');

beforeAll(async () => {
  await startTestServer();
}, 60_000);

afterAll(async () => {
  await stopTestServer();
});

beforeEach(async () => {
  const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  vi.stubGlobal('ResizeObserver', ResizeObserverMock);

  window.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
  window.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');

  Object.defineProperty(window, 'location', {
    value: new URL('http://localhost:3000/'),
    writable: true,
  });

  Cookies.remove(AUTH_COOKIE);
});
