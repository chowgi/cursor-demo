import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { db, persistDb } from '../db';
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

const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

const fuzzyMatches = (text: string, query: string, maxEdits = 1): boolean => {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (lowerText.includes(lowerQuery)) {
    return true;
  }

  const words = lowerText.split(/\s+/);
  return words.some((word) => {
    if (word.startsWith(lowerQuery)) {
      return true;
    }

    if (Math.abs(word.length - lowerQuery.length) > maxEdits) {
      return false;
    }

    return levenshteinDistance(word, lowerQuery) <= maxEdits;
  });
};

const matchesTitlePrefix = (title: string, query: string) => {
  return fuzzyMatches(title, query, 1);
};

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
          .filter(
            (discussion) =>
              fuzzyMatches(discussion.title, searchQuery, 1) ||
              fuzzyMatches(discussion.body, searchQuery, 1),
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
        allDiscussions = allDiscussions.filter(
          (d) =>
            fuzzyMatches(d.title, searchQuery, 1) ||
            fuzzyMatches(d.body, searchQuery, 1),
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
