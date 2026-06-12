import { nanoid } from 'nanoid';
import { Router } from 'express';

import {
  authenticate,
  clearAuthCookie,
  decode,
  hash,
  sanitizeUser,
  setAuthCookie,
  AUTH_COOKIE,
} from '../auth';
import { getTeamsCollection, getUsersCollection } from '../db';
import { createTeam } from '../seed';
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

authRouter.post('/register', async (req, res) => {
  try {
    const userObject = req.body as RegisterBody;
    const existingUser = await getUsersCollection().findOne({
      email: userObject.email,
    });

    if (existingUser) {
      res.status(400).json({ message: 'The user already exists' });
      return;
    }

    let teamId: string;
    let role: UserDocument['role'];

    if (!userObject.teamId) {
      teamId = await createTeam(userObject.teamName ?? `${userObject.firstName} Team`);
      role = 'ADMIN';
    } else {
      const existingTeam = await getTeamsCollection().findOne({
        _id: userObject.teamId,
      });

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

    await getUsersCollection().insertOne(user);

    const result = authenticate(user, userObject.password);
    setAuthCookie(res, result.jwt);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const credentials = req.body as LoginBody;
    const user = await getUsersCollection().findOne({ email: credentials.email });

    if (!user) {
      res.status(500).json({ message: 'Invalid username or password' });
      return;
    }

    const result = authenticate(user, credentials.password);
    setAuthCookie(res, result.jwt);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});

authRouter.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
});

authRouter.get('/me', async (req, res) => {
  try {
    const encodedToken = req.cookies[AUTH_COOKIE] as string | undefined;

    if (!encodedToken) {
      res.json({ data: null });
      return;
    }

    const decodedToken = decode<{ id: string }>(encodedToken);
    const user = await getUsersCollection().findOne({ _id: decodedToken.id });
    res.json({ data: user ? sanitizeUser(user) : null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});
