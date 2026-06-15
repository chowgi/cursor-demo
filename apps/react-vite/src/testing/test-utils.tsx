import type { ReactElement } from 'react';
import {
  render as rtlRender,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Cookies from 'js-cookie';
import { nanoid } from 'nanoid';
import { RouterProvider, createMemoryRouter } from 'react-router';

import { AppProvider } from '@/app/provider';
import {
  AUTH_COOKIE,
  authenticate,
  hash,
  toAuthorSnapshot,
} from '../../server/auth';
import {
  getDiscussionsCollection,
  getTeamsCollection,
  getUsersCollection,
} from '../../server/db';
import type { UserDocument } from '../../server/types';

import {
  createDiscussion as generateDiscussion,
  createUser as generateUser,
} from './data-generators';

type TestUserOverrides = Partial<ReturnType<typeof generateUser>> & {
  role?: UserDocument['role'];
};

export const createUser = async (userProperties?: TestUserOverrides) => {
  const user = generateUser(userProperties);
  const userId = nanoid();
  const teamId = userProperties?.teamId ?? nanoid();
  const role = userProperties?.role ?? 'ADMIN';

  const teams = getTeamsCollection();
  const users = getUsersCollection();

  const existingTeam = await teams.findOne({ _id: teamId });
  if (!existingTeam) {
    await teams.insertOne({
      _id: teamId,
      name: user.teamName,
      description: '',
      createdAt: Date.now(),
    });
  }

  const userDoc: UserDocument = {
    _id: userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: hash(user.password),
    teamId,
    role,
    bio: user.bio,
    createdAt: user.createdAt,
  };

  await users.insertOne(userDoc);

  return { ...user, id: userId, teamId, role };
};

type DiscussionOverrides = Partial<ReturnType<typeof generateDiscussion>> & {
  authorId?: string;
  teamId?: string;
};

export const createDiscussion = async (
  discussionProperties?: DiscussionOverrides,
) => {
  const discussion = generateDiscussion(discussionProperties);
  const teamId = discussionProperties?.teamId;

  if (!teamId) {
    throw new Error('createDiscussion requires teamId');
  }

  const users = getUsersCollection();
  let author: UserDocument | null = null;

  if (discussionProperties?.authorId) {
    author = await users.findOne({ _id: discussionProperties.authorId });
  } else {
    author = await users.findOne({ teamId });
  }

  if (!author) {
    throw new Error('createDiscussion requires an author on the team');
  }

  await getDiscussionsCollection().insertOne({
    _id: discussion.id,
    title: discussion.title,
    body: discussion.body,
    teamId,
    author: toAuthorSnapshot(author),
    createdAt: discussion.createdAt,
  });

  return discussion;
};

export const loginAsUser = async (user: {
  email: string;
  password: string;
}) => {
  const authUser = await authenticate(user);
  Cookies.set(AUTH_COOKIE, authUser.jwt);
  return authUser;
};

export const waitForLoadingToFinish = () =>
  waitForElementToBeRemoved(
    () => [
      ...screen.queryAllByTestId(/loading/i),
      ...screen.queryAllByText(/loading/i),
    ],
    { timeout: 4000 },
  );

const initializeUser = async (
  user: TestUserOverrides | null | undefined,
) => {
  if (typeof user === 'undefined') {
    const newUser = await createUser();
    return loginAsUser(newUser);
  }

  if (user) {
    if (!user.email || !user.password) {
      throw new Error('renderApp user override requires email and password');
    }
    return loginAsUser({ email: user.email, password: user.password });
  }

  return null;
};

export const renderApp = async (
  ui: ReactElement,
  {
    user,
    url = '/',
    path = '/',
    ...renderOptions
  }: Record<string, unknown> = {},
) => {
  const initializedUser = await initializeUser(
    user as TestUserOverrides | null | undefined,
  );

  const router = createMemoryRouter(
    [
      {
        path: path as string,
        element: ui,
      },
    ],
    {
      initialEntries: [(url as string) || '/'],
      initialIndex: 0,
    },
  );

  const returnValue = {
    ...rtlRender(<RouterProvider router={router} />, {
      wrapper: ({ children }) => <AppProvider>{children}</AppProvider>,
      ...renderOptions,
    }),
    user: initializedUser,
    router,
  };

  await waitForLoadingToFinish();

  return returnValue;
};

export * from '@testing-library/react';
export { userEvent, rtlRender };
