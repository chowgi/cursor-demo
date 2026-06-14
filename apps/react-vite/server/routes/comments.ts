import { Router } from 'express';
import { nanoid } from 'nanoid';

import { requireAuthUser, toAuthorSnapshot } from '../auth';
import { getCommentsCollection, getUsersCollection } from '../db';
import { serializeCommentRead, serializeCommentWrite } from '../serialize';
import type { CommentDocument } from '../types';

type CreateCommentBody = {
  body: string;
  discussionId: string;
};

const PAGE_SIZE = 10;

export const commentsRouter = Router();

commentsRouter.get('/comments', async (req, res) => {
  try {
    const { error } = await requireAuthUser(req);
    if (error) {
      res.status(401).json({ message: error });
      return;
    }

    const discussionId = String(req.query.discussionId ?? '');
    const page = Number(req.query.page ?? 1);
    const comments = getCommentsCollection();
    const filter = { discussionId };

    const total = await comments.countDocuments(filter);
    const totalPages = Math.ceil(total / PAGE_SIZE);

    const result = await comments
      .find(filter)
      .sort({ createdAt: 1 })
      .skip(PAGE_SIZE * (page - 1))
      .limit(PAGE_SIZE)
      .toArray();

    res.json({
      data: result.map(serializeCommentRead),
      meta: { page, total, totalPages },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

commentsRouter.post('/comments', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req);
    if (error) {
      res.status(401).json({ message: error });
      return;
    }

    const data = req.body as CreateCommentBody;
    const users = getUsersCollection();
    const authorDoc = await users.findOne({ _id: user!.id });

    if (!authorDoc) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const comment: CommentDocument = {
      _id: nanoid(),
      body: data.body,
      discussionId: data.discussionId,
      author: toAuthorSnapshot(authorDoc),
      createdAt: Date.now(),
    };

    const comments = getCommentsCollection();
    await comments.insertOne(comment);

    res.json(serializeCommentWrite(comment));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

commentsRouter.delete('/comments/:commentId', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req);
    if (error) {
      res.status(401).json({ message: error });
      return;
    }

    const comments = getCommentsCollection();
    const filter =
      user!.role === 'USER'
        ? { _id: req.params.commentId, 'author.id': user!.id }
        : { _id: req.params.commentId };

    const deleted = await comments.findOneAndDelete(filter);

    if (!deleted) {
      throw new Error('Comment not found');
    }

    res.json(serializeCommentWrite(deleted));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});
