import { Router } from 'express';

import {
  requireAdmin,
  requireAuthUser,
  toAuthorSnapshot,
} from '../auth';
import {
  getCommentsCollection,
  getDiscussionsCollection,
  getUsersCollection,
} from '../db';
import { serializeUserRead, serializeUserWrite } from '../serialize';

type ProfileBody = {
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
};

export const usersRouter = Router();

usersRouter.get('/users', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req);
    if (error) {
      res.status(401).json({ message: error });
      return;
    }

    const users = getUsersCollection();
    const result = await users.find({ teamId: user!.teamId }).toArray();
    res.json({ data: result.map(serializeUserRead) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

usersRouter.patch('/users/profile', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req);
    if (error) {
      res.status(401).json({ message: error });
      return;
    }

    const data = req.body as ProfileBody;
    const users = getUsersCollection();
    const discussions = getDiscussionsCollection();
    const comments = getCommentsCollection();

    const updated = await users.findOneAndUpdate(
      { _id: user!.id },
      { $set: data },
      { returnDocument: 'after' },
    );

    if (!updated) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const authorSnapshot = toAuthorSnapshot(updated);
    await discussions.updateMany(
      { 'author.id': user!.id },
      { $set: { author: authorSnapshot } },
    );
    await comments.updateMany(
      { 'author.id': user!.id },
      { $set: { author: authorSnapshot } },
    );

    res.json(serializeUserWrite(updated));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

usersRouter.delete('/users/:userId', async (req, res) => {
  try {
    const { user, error } = await requireAuthUser(req);
    if (error) {
      res.status(401).json({ message: error });
      return;
    }

    requireAdmin(user!);

    const users = getUsersCollection();
    const deleted = await users.findOneAndDelete({
      _id: req.params.userId,
      teamId: user!.teamId,
    });

    if (!deleted) {
      throw new Error('User not found');
    }

    res.json(serializeUserWrite(deleted));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});
