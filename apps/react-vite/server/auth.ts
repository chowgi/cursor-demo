import type { NextFunction, Request, Response } from 'express';

import type { SerializedUser, UserDocument } from './types';

export const AUTH_COOKIE = 'bulletproof_react_app_token';

export const encode = (value: unknown): string =>
  Buffer.from(JSON.stringify(value)).toString('base64');

export const decode = <T>(value: string): T =>
  JSON.parse(Buffer.from(value, 'base64').toString('binary')) as T;

export const hash = (value: string): string => {
  let hashedValue = 5381;
  let index = value.length;

  while (index) {
    hashedValue = (hashedValue * 33) ^ value.charCodeAt(--index);
  }

  return String(hashedValue >>> 0);
};

const omit = <T extends object>(obj: T, keys: string[]): T => {
  const result = {} as T;

  for (const key in obj) {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
  }

  return result;
};

export const sanitizeUser = (user: UserDocument): SerializedUser => {
  const { _id, ...rest } = omit(user, ['password', 'iat']);

  return {
    id: _id,
    ...rest,
  };
};

export const toAuthorSnapshot = (user: UserDocument) => sanitizeUser(user);

export const authenticate = (
  user: UserDocument,
  password: string,
): { user: SerializedUser; jwt: string } => {
  if (user.password !== hash(password)) {
    throw new Error('Invalid username or password');
  }

  const sanitizedUser = sanitizeUser(user);
  const jwt = encode(sanitizedUser);

  return { user: sanitizedUser, jwt };
};

export const setAuthCookie = (res: Response, jwt: string): void => {
  res.setHeader('Set-Cookie', `${AUTH_COOKIE}=${jwt}; Path=/;`);
};

export const clearAuthCookie = (res: Response): void => {
  res.setHeader('Set-Cookie', `${AUTH_COOKIE}=; Path=/;`);
};

export type AuthenticatedRequest = Request & {
  user?: SerializedUser;
};

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const encodedToken = req.cookies[AUTH_COOKIE] as string | undefined;

  if (!encodedToken) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const decodedToken = decode<{ id: string }>(encodedToken);
    req.user = decodedToken as SerializedUser;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export const requireAuthUser = async (
  req: AuthenticatedRequest,
  res: Response,
  getUserById: (id: string) => Promise<UserDocument | null>,
): Promise<SerializedUser | null> => {
  const encodedToken = req.cookies[AUTH_COOKIE] as string | undefined;

  if (!encodedToken) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }

  try {
    const decodedToken = decode<{ id: string }>(encodedToken);
    const user = await getUserById(decodedToken.id);

    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return null;
    }

    return sanitizeUser(user);
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }
};

export const requireAdmin = (user: SerializedUser): void => {
  if (user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
};
