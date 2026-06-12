import { Router } from 'express';

import { requireAuthUser, requireAdmin, sanitizeUser } from '../auth';
import {
  getCommentsCollection,
  getDiscussionsCollection,
  getUsersCollection,
} from '../db';
import type { SerializedUser } from '../types';

type ProfileBody = {
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
};

const getAuthenticatedUser = async (
  req: Parameters<typeof requireAuthUser>[0],
  res: Parameters<typeof requireAuthUser>[1],
): Promise<SerializedUser | null> =>
  requireAuthUser(req, res, async (id) => getUsersCollection().findOne({ _id: id }));

export const usersRouter = Router();

usersRouter.get('/', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req, res);

    if (!user) {
      return;
    }

    const result = await getUsersCollection()
      .find({ teamId: user.teamId })
      .toArray();

    res.json({ data: result.map(sanitizeUser) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

usersRouter.patch('/profile', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req, res);

    if (!user) {
      return;
    }

    const data = req.body as ProfileBody;
    const updatedUser = await getUsersCollection().findOneAndUpdate(
      { _id: user.id },
      { $set: data },
      { returnDocument: 'after' },
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const authorSnapshot = sanitizeUser(updatedUser);

    await getDiscussionsCollection().updateMany(
      { 'author.id': user.id },
      { $set: { author: authorSnapshot } },
    );

    await getCommentsCollection().updateMany(
      { 'author.id': user.id },
      { $set: { author: authorSnapshot } },
    );

    res.json({
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      teamId: updatedUser.teamId,
      bio: updatedUser.bio,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

usersRouter.delete('/:userId', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req, res);

    if (!user) {
      return;
    }

    requireAdmin(user);

    const deletedUser = await getUsersCollection().findOneAndDelete({
      _id: req.params.userId,
      teamId: user.teamId,
    });

    if (!deletedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      id: deletedUser._id,
      firstName: deletedUser.firstName,
      lastName: deletedUser.lastName,
      email: deletedUser.email,
      role: deletedUser.role,
      teamId: deletedUser.teamId,
      bio: deletedUser.bio,
      createdAt: deletedUser.createdAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});
