import { nanoid } from 'nanoid';
import { Router } from 'express';

import { requireAuthUser, requireAdmin, toAuthorSnapshot } from '../auth';
import { getDiscussionsCollection, getUsersCollection } from '../db';
import type { DiscussionDocument, SerializedUser } from '../types';

type DiscussionBody = {
  title: string;
  body: string;
};

const PAGE_SIZE = 10;

const getAuthenticatedUser = async (
  req: Parameters<typeof requireAuthUser>[0],
  res: Parameters<typeof requireAuthUser>[1],
): Promise<SerializedUser | null> =>
  requireAuthUser(req, res, async (id) => getUsersCollection().findOne({ _id: id }));

const serializeDiscussionForRead = (discussion: DiscussionDocument) => ({
  id: discussion._id,
  title: discussion.title,
  body: discussion.body,
  teamId: discussion.teamId,
  createdAt: discussion.createdAt,
  author: discussion.author,
});

const serializeDiscussionForWrite = (discussion: DiscussionDocument) => ({
  id: discussion._id,
  title: discussion.title,
  body: discussion.body,
  teamId: discussion.teamId,
  authorId: discussion.author.id,
  createdAt: discussion.createdAt,
});

export const discussionsRouter = Router();

discussionsRouter.get('/', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req, res);

    if (!user) {
      return;
    }

    const page = Number(req.query.page || 1);
    const filter = { teamId: user.teamId };
    const total = await getDiscussionsCollection().countDocuments(filter);
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const discussions = await getDiscussionsCollection()
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(PAGE_SIZE * (page - 1))
      .limit(PAGE_SIZE)
      .toArray();

    res.json({
      data: discussions.map(serializeDiscussionForRead),
      meta: {
        page,
        total,
        totalPages,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

discussionsRouter.get('/:discussionId', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req, res);

    if (!user) {
      return;
    }

    const discussion = await getDiscussionsCollection().findOne({
      _id: req.params.discussionId,
      teamId: user.teamId,
    });

    if (!discussion) {
      res.status(404).json({ message: 'Discussion not found' });
      return;
    }

    res.json({ data: serializeDiscussionForRead(discussion) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

discussionsRouter.post('/', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req, res);

    if (!user) {
      return;
    }

    requireAdmin(user);

    const userDocument = await getUsersCollection().findOne({ _id: user.id });

    if (!userDocument) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const data = req.body as DiscussionBody;
    const discussion: DiscussionDocument = {
      _id: nanoid(),
      title: data.title,
      body: data.body,
      teamId: user.teamId,
      author: toAuthorSnapshot(userDocument),
      createdAt: Date.now(),
    };

    await getDiscussionsCollection().insertOne(discussion);
    res.json(serializeDiscussionForWrite(discussion));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

discussionsRouter.patch('/:discussionId', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req, res);

    if (!user) {
      return;
    }

    requireAdmin(user);

    const data = req.body as DiscussionBody;
    const discussion = await getDiscussionsCollection().findOneAndUpdate(
      {
        _id: req.params.discussionId,
        teamId: user.teamId,
      },
      { $set: { title: data.title, body: data.body } },
      { returnDocument: 'after' },
    );

    if (!discussion) {
      res.status(404).json({ message: 'Discussion not found' });
      return;
    }

    res.json(serializeDiscussionForWrite(discussion));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

discussionsRouter.delete('/:discussionId', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req, res);

    if (!user) {
      return;
    }

    requireAdmin(user);

    const discussion = await getDiscussionsCollection().findOneAndDelete({
      _id: req.params.discussionId,
    });

    if (!discussion) {
      res.status(404).json({ message: 'Discussion not found' });
      return;
    }

    res.json(serializeDiscussionForWrite(discussion));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});
