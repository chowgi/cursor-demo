import type { Mock } from 'vitest';

import { createDiscussion } from '@/testing/data-generators';
import { seedDemoData } from '@/testing/mocks/seed-db';
import {
  renderApp,
  screen,
  userEvent,
  waitFor,
  within,
} from '@/testing/test-utils';
import { formatDate } from '@/utils/format';

import { default as DiscussionsRoute } from '../discussions';

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as Mock).mockRestore();
});

test(
  'should fuzzy match typo desgn to Design review discussion',
  { timeout: 10000 },
  async () => {
    await seedDemoData();

    await renderApp(<DiscussionsRoute />, {
      user: { email: 'admin@demo.com', password: 'password123' },
    });

    const searchInput = screen.getByRole('combobox', {
      name: /search discussions/i,
    });

    await userEvent.type(searchInput, 'desgn');

    const suggestion = await screen.findByRole('option', {
      name: /design review for dashboard refresh/i,
    });
    expect(suggestion).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /submit search/i }),
    );

    await screen.findByText(/showing results for:/i);
    expect(screen.getByText('"desgn"')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/1 result/i)).toBeInTheDocument();
    });

    expect(
      screen.getByRole('cell', {
        name: /design review for dashboard refresh/i,
      }),
    ).toBeInTheDocument();
  },
);

test(
  'should create, render and delete discussions',
  { timeout: 10000 },
  async () => {
    await renderApp(<DiscussionsRoute />);

    const newDiscussion = createDiscussion();

    expect(await screen.findByText(/no entries/i)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /create discussion/i }),
    );

    const drawer = await screen.findByRole('dialog', {
      name: /create discussion/i,
    });

    const titleField = within(drawer).getByText(/title/i);
    const bodyField = within(drawer).getByText(/body/i);

    await userEvent.type(titleField, newDiscussion.title);
    await userEvent.type(bodyField, newDiscussion.body);

    const submitButton = within(drawer).getByRole('button', {
      name: /submit/i,
    });

    await userEvent.click(submitButton);

    await waitFor(() => expect(drawer).not.toBeInTheDocument());

    const row = await screen.findByRole(
      'row',
      {
        name: `${newDiscussion.title} ${formatDate(newDiscussion.createdAt)} View Delete Discussion`,
      },
      { timeout: 5000 },
    );

    expect(
      within(row).getByRole('cell', {
        name: newDiscussion.title,
      }),
    ).toBeInTheDocument();

    await userEvent.click(
      within(row).getByRole('button', {
        name: /delete discussion/i,
      }),
    );

    const confirmationDialog = await screen.findByRole('dialog', {
      name: /delete discussion/i,
    });

    const confirmationDeleteButton = within(confirmationDialog).getByRole(
      'button',
      {
        name: /delete discussion/i,
      },
    );

    await userEvent.click(confirmationDeleteButton);

    await screen.findByText(/discussion deleted/i);

    expect(
      within(row).queryByRole('cell', {
        name: newDiscussion.title,
      }),
    ).not.toBeInTheDocument();
  },
);
