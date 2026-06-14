import { Router } from 'express';
import { nanoid } from 'nanoid';

import { requireAdmin, requireAuthUser, toAuthorSnapshot } from '../auth';
import { getDiscussionsCollection, getUsersCollection } from '../db';
import {
  serializeDiscussionRead,
  serializeDiscussionWrite,
} from '../serialize';
import type { DiscussionDocument } from '../types';

type DiscussionBody = {
  title: string;
  body: string;
};

const PAGE_SIZE = 10;

export const discussionsRouter = Router();

discussionsRouter.get('/discussions', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req);
    if (error) {
      res.status(401).json({ message: error });
      return;
    }

    const page = Number(req.query.page ?? 1);
    const discussions = getDiscussionsCollection();
    const filter = { teamId: user!.teamId };

    const total = await discussions.countDocuments(filter);
    const totalPages = Math.ceil(total / PAGE_SIZE);

    const result = await discussions
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(PAGE_SIZE * (page - 1))
      .limit(PAGE_SIZE)
      .toArray();

    res.json({
      data: result.map(serializeDiscussionRead),
      meta: { page, total, totalPages },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

discussionsRouter.get('/discussions/:discussionId', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req);
    if (error) {
      res.status(401).json({ message: error });
      return;
    }

    const discussions = getDiscussionsCollection();
    const discussion = await discussions.findOne({
      _id: req.params.discussionId,
      teamId: user!.teamId,
    });

    if (!discussion) {
      res.status(404).json({ message: 'Discussion not found' });
      return;
    }

    res.json({ data: serializeDiscussionRead(discussion) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

discussionsRouter.post('/discussions', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req);
    if (error) {
      res.status(401).json({ message: error });
      return;
    }

    requireAdmin(user!);

    const data = req.body as DiscussionBody;
    const users = getUsersCollection();
    const authorDoc = await users.findOne({ _id: user!.id });

    if (!authorDoc) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const discussion: DiscussionDocument = {
      _id: nanoid(),
      title: data.title,
      body: data.body,
      teamId: user!.teamId,
      author: toAuthorSnapshot(authorDoc),
      createdAt: Date.now(),
    };

    const discussions = getDiscussionsCollection();
    await discussions.insertOne(discussion);

    res.json(serializeDiscussionWrite(discussion));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

discussionsRouter.patch('/discussions/:discussionId', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req);
    if (error) {
      res.status(401).json({ message: error });
      return;
    }

    requireAdmin(user!);

    const data = req.body as DiscussionBody;
    const discussions = getDiscussionsCollection();
    const updated = await discussions.findOneAndUpdate(
      { _id: req.params.discussionId, teamId: user!.teamId },
      { $set: { title: data.title, body: data.body } },
      { returnDocument: 'after' },
    );

    if (!updated) {
      throw new Error('Discussion not found');
    }

    res.json(serializeDiscussionWrite(updated));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

discussionsRouter.delete('/discussions/:discussionId', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req);
    if (error) {
      res.status(401).json({ message: error });
      return;
    }

    requireAdmin(user!);

    const discussions = getDiscussionsCollection();
    const deleted = await discussions.findOneAndDelete({
      _id: req.params.discussionId,
    });

    if (!deleted) {
      throw new Error('Discussion not found');
    }

    res.json(serializeDiscussionWrite(deleted));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});
