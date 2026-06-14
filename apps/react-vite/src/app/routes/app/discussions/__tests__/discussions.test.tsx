import type { Mock } from 'vitest';

import { createDiscussion as generateDiscussion } from '@/testing/data-generators';
import {
  createDiscussion,
  createUser,
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
  'should create, render and delete discussions',
  { timeout: 10000 },
  async () => {
    await renderApp(<DiscussionsRoute />);

    const newDiscussion = generateDiscussion();

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

test(
  'should match discussions with fuzzy typo-tolerant search',
  { timeout: 15000 },
  async () => {
    const user = await createUser({ role: 'ADMIN' });
    const designDiscussionTitle = 'Design review for dashboard refresh';

    await createDiscussion({
      title: designDiscussionTitle,
      body: 'The updated dashboard layout adds stat cards and recent activity.',
      teamId: user.teamId,
      authorId: user.id,
    });

    await createDiscussion({
      title: 'API versioning strategy',
      body: 'Proposal: version public endpoints under /v1.',
      teamId: user.teamId,
      authorId: user.id,
    });

    await renderApp(<DiscussionsRoute />, { user });

    const searchInput = screen.getByRole('combobox', {
      name: /search discussions/i,
    });

    await userEvent.type(searchInput, 'desgn');

    expect(
      await screen.findByRole('option', {
        name: new RegExp(designDiscussionTitle, 'i'),
      }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /submit search/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole('cell', { name: designDiscussionTitle }),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('cell', { name: 'API versioning strategy' }),
    ).not.toBeInTheDocument();
  },
);
