import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { db, persistDb } from '../db';
import { matchesDiscussionSearch } from '../fuzzy-search';
import {
  requireAuth,
  requireAdmin,
  sanitizeUser,
  networkDelay,
} from '../utils';

type DiscussionBody = {
  title: string;
  body: string;
};

const filterDiscussionsByTeam = (teamId: string | undefined) =>
  db.discussion.findMany({
    where: {
      teamId: {
        equals: teamId,
      },
    },
  });

const mapDiscussionWithAuthor = (discussion: {
  authorId: string;
  id: string;
  title: string;
  body: string;
  teamId: string;
  createdAt: number;
}) => {
  const { authorId, ...rest } = discussion;
  const author = db.user.findFirst({
    where: {
      id: {
        equals: authorId,
      },
    },
  });

  return {
    ...rest,
    author: author ? sanitizeUser(author) : {},
  };
};

export const discussionsHandlers = [
  http.get(`${env.API_URL}/discussions`, async ({ cookies, request }) => {
    await networkDelay();

    try {
      const { user, error } = requireAuth(cookies);
      if (error) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      const url = new URL(request.url);
      const searchQuery = url.searchParams.get('q')?.trim();
      const isSuggestions = url.searchParams.get('suggestions') === 'true';

      if (isSuggestions) {
        if (!searchQuery || searchQuery.length < 2) {
          return HttpResponse.json({ data: [] });
        }

        const suggestions = filterDiscussionsByTeam(user?.teamId)
          .filter((discussion) =>
            matchesDiscussionSearch(
              discussion.title,
              discussion.body,
              searchQuery,
            ),
          )
          .slice(0, 5)
          .map(mapDiscussionWithAuthor);

        return HttpResponse.json({ data: suggestions });
      }

      const page = Number(url.searchParams.get('page') || 1);

      let allDiscussions = db.discussion.findMany({
        where: {
          teamId: {
            equals: user?.teamId,
          },
        },
      });

      if (searchQuery) {
        allDiscussions = allDiscussions.filter((discussion) =>
          matchesDiscussionSearch(
            discussion.title,
            discussion.body,
            searchQuery,
          ),
        );
      }

      const total = allDiscussions.length;
      const totalPages = Math.ceil(total / 10);

      const result = allDiscussions
        .slice(10 * (page - 1), 10 * page)
        .map(mapDiscussionWithAuthor);

      return HttpResponse.json({
        data: result,
        meta: {
          page,
          total,
          totalPages,
        },
      });
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  http.get(
    `${env.API_URL}/discussions/:discussionId`,
    async ({ params, cookies }) => {
      await networkDelay();

      try {
        const { user, error } = requireAuth(cookies);
        if (error) {
          return HttpResponse.json({ message: error }, { status: 401 });
        }
        const discussionId = params.discussionId as string;
        const discussion = db.discussion.findFirst({
          where: {
            id: {
              equals: discussionId,
            },
            teamId: {
              equals: user?.teamId,
            },
          },
        });

        if (!discussion) {
          return HttpResponse.json(
            { message: 'Discussion not found' },
            { status: 404 },
          );
        }

        const author = db.user.findFirst({
          where: {
            id: {
              equals: discussion.authorId,
            },
          },
        });

        const result = {
          ...discussion,
          author: author ? sanitizeUser(author) : {},
        };

        return HttpResponse.json({ data: result });
      } catch (error: any) {
        return HttpResponse.json(
          { message: error?.message || 'Server Error' },
          { status: 500 },
        );
      }
    },
  ),

  http.post(`${env.API_URL}/discussions`, async ({ request, cookies }) => {
    await networkDelay();

    try {
      const { user, error } = requireAuth(cookies);
      if (error) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }
      const data = (await request.json()) as DiscussionBody;
      requireAdmin(user);
      const result = db.discussion.create({
        teamId: user?.teamId,
        authorId: user?.id,
        ...data,
      });
      await persistDb('discussion');
      return HttpResponse.json(result);
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  http.patch(
    `${env.API_URL}/discussions/:discussionId`,
    async ({ request, params, cookies }) => {
      await networkDelay();

      try {
        const { user, error } = requireAuth(cookies);
        if (error) {
          return HttpResponse.json({ message: error }, { status: 401 });
        }
        const data = (await request.json()) as DiscussionBody;
        const discussionId = params.discussionId as string;
        requireAdmin(user);
        const result = db.discussion.update({
          where: {
            teamId: {
              equals: user?.teamId,
            },
            id: {
              equals: discussionId,
            },
          },
          data,
        });
        await persistDb('discussion');
        return HttpResponse.json(result);
      } catch (error: any) {
        return HttpResponse.json(
          { message: error?.message || 'Server Error' },
          { status: 500 },
        );
      }
    },
  ),

  http.delete(
    `${env.API_URL}/discussions/:discussionId`,
    async ({ cookies, params }) => {
      await networkDelay();

      try {
        const { user, error } = requireAuth(cookies);
        if (error) {
          return HttpResponse.json({ message: error }, { status: 401 });
        }
        const discussionId = params.discussionId as string;
        requireAdmin(user);
        const result = db.discussion.delete({
          where: {
            id: {
              equals: discussionId,
            },
          },
        });
        await persistDb('discussion');
        return HttpResponse.json(result);
      } catch (error: any) {
        return HttpResponse.json(
          { message: error?.message || 'Server Error' },
          { status: 500 },
        );
      }
    },
  ),
];
