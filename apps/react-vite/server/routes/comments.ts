import { nanoid } from 'nanoid';
import { Router } from 'express';

import { requireAuthUser, toAuthorSnapshot } from '../auth';
import { getCommentsCollection, getUsersCollection } from '../db';
import type { CommentDocument, SerializedUser } from '../types';

type CreateCommentBody = {
  body: string;
  discussionId: string;
};

const PAGE_SIZE = 10;

const getAuthenticatedUser = async (
  req: Parameters<typeof requireAuthUser>[0],
  res: Parameters<typeof requireAuthUser>[1],
): Promise<SerializedUser | null> =>
  requireAuthUser(req, res, async (id) => getUsersCollection().findOne({ _id: id }));

const serializeCommentForRead = (comment: CommentDocument) => ({
  id: comment._id,
  body: comment.body,
  discussionId: comment.discussionId,
  createdAt: comment.createdAt,
  author: comment.author,
});

const serializeCommentForWrite = (comment: CommentDocument) => ({
  id: comment._id,
  body: comment.body,
  discussionId: comment.discussionId,
  authorId: comment.author.id,
  createdAt: comment.createdAt,
});

export const commentsRouter = Router();

commentsRouter.get('/', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req, res);

    if (!user) {
      return;
    }

    const discussionId = String(req.query.discussionId || '');
    const page = Number(req.query.page || 1);
    const filter = { discussionId };
    const total = await getCommentsCollection().countDocuments(filter);
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const comments = await getCommentsCollection()
      .find(filter)
      .sort({ createdAt: 1 })
      .skip(PAGE_SIZE * (page - 1))
      .limit(PAGE_SIZE)
      .toArray();

    res.json({
      data: comments.map(serializeCommentForRead),
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

commentsRouter.post('/', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req, res);

    if (!user) {
      return;
    }

    const userDocument = await getUsersCollection().findOne({ _id: user.id });

    if (!userDocument) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const data = req.body as CreateCommentBody;
    const comment: CommentDocument = {
      _id: nanoid(),
      body: data.body,
      discussionId: data.discussionId,
      author: toAuthorSnapshot(userDocument),
      createdAt: Date.now(),
    };

    await getCommentsCollection().insertOne(comment);
    res.json(serializeCommentForWrite(comment));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

commentsRouter.delete('/:commentId', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req, res);

    if (!user) {
      return;
    }

    const filter =
      user.role === 'USER'
        ? { _id: req.params.commentId, 'author.id': user.id }
        : { _id: req.params.commentId };

    const comment = await getCommentsCollection().findOneAndDelete(filter);

    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    res.json(serializeCommentForWrite(comment));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});
