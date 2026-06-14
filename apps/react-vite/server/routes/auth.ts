import { Router } from 'express';
import { nanoid } from 'nanoid';

import {
  authenticate,
  clearAuthCookie,
  hash,
  requireAuthUser,
  setAuthCookie,
} from '../auth';
import { getTeamsCollection, getUsersCollection } from '../db';
import { serializeUserWrite } from '../serialize';
import type { UserDocument } from '../types';

type RegisterBody = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  teamId?: string;
  teamName?: string;
};

type LoginBody = {
  email: string;
  password: string;
};

export const authRouter = Router();

authRouter.post('/auth/register', async (req, res) => {
  try {
    const userObject = req.body as RegisterBody;
    const users = getUsersCollection();
    const teams = getTeamsCollection();

    const existingUser = await users.findOne({ email: userObject.email });
    if (existingUser) {
      res.status(400).json({ message: 'The user already exists' });
      return;
    }

    let teamId: string;
    let role: UserDocument['role'];

    if (!userObject.teamId) {
      teamId = nanoid();
      const team = {
        _id: teamId,
        name: userObject.teamName ?? `${userObject.firstName} Team`,
        description: '',
        createdAt: Date.now(),
      };
      await teams.insertOne(team);
      role = 'ADMIN';
    } else {
      const existingTeam = await teams.findOne({ _id: userObject.teamId });
      if (!existingTeam) {
        res.status(400).json({
          message: 'The team you are trying to join does not exist!',
        });
        return;
      }
      teamId = userObject.teamId;
      role = 'USER';
    }

    const user: UserDocument = {
      _id: nanoid(),
      firstName: userObject.firstName,
      lastName: userObject.lastName,
      email: userObject.email,
      password: hash(userObject.password),
      teamId,
      role,
      bio: '',
      createdAt: Date.now(),
    };

    await users.insertOne(user);

    const result = await authenticate({
      email: userObject.email,
      password: userObject.password,
    });

    res.setHeader('Set-Cookie', setAuthCookie(result.jwt));
    res.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

authRouter.post('/auth/login', async (req, res) => {
  try {
    const credentials = req.body as LoginBody;
    const result = await authenticate(credentials);

    res.setHeader('Set-Cookie', setAuthCookie(result.jwt));
    res.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

authRouter.post('/auth/logout', (_req, res) => {
  res.setHeader('Set-Cookie', clearAuthCookie());
  res.json({ message: 'Logged out' });
});

authRouter.get('/auth/me', async (req, res) => {
  try {
    const { user } = await requireAuthUser(req);
    res.json({ data: user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});
