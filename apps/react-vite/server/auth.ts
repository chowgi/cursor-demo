import type { Request } from 'express';

import type { UserDocument, SanitizedUser, AuthorSnapshot } from './types';
import { getUsersCollection } from './db';

export const AUTH_COOKIE = 'bulletproof_react_app_token';

export const encode = (obj: object): string =>
  Buffer.from(JSON.stringify(obj), 'binary').toString('base64');

export const decode = (str: string): { id: string } =>
  JSON.parse(Buffer.from(str, 'base64').toString('binary'));

export const hash = (str: string): string => {
  let hashValue = 5381;
  let i = str.length;

  while (i) {
    hashValue = (hashValue * 33) ^ str.charCodeAt(--i);
  }

  return String(hashValue >>> 0);
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

export const sanitizeUser = (user: UserDocument): SanitizedUser => {
  const { _id, password: _password, ...rest } = user;
  return { id: _id, ...rest };
};

export const toAuthorSnapshot = (user: UserDocument): AuthorSnapshot => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  teamId: user.teamId,
  bio: user.bio,
  createdAt: user.createdAt,
});

export const serializeUserWrite = (user: UserDocument) => {
  const { _id, ...rest } = user;
  return { id: _id, ...rest };
};

export async function authenticate({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ user: SanitizedUser; jwt: string }> {
  const users = getUsersCollection();
  const user = await users.findOne({ email });

  if (user?.password === hash(password)) {
    const sanitizedUser = sanitizeUser(user);
    const encodedToken = encode(sanitizedUser);
    return { user: sanitizedUser, jwt: encodedToken };
  }

  throw new Error('Invalid username or password');
}

export async function requireAuthUser(
  req: Request,
): Promise<{ user: SanitizedUser | null; error: string | null }> {
  try {
    const encodedToken = req.cookies[AUTH_COOKIE] as string | undefined;
    if (!encodedToken) {
      return { error: 'Unauthorized', user: null };
    }

    const decodedToken = decode(encodedToken);
    const users = getUsersCollection();
    const user = await users.findOne({ _id: decodedToken.id });

    if (!user) {
      return { error: 'Unauthorized', user: null };
    }

    return { user: sanitizeUser(user), error: null };
  } catch {
    return { error: 'Unauthorized', user: null };
  }
}

export function requireAdmin(user: SanitizedUser): void {
  if (user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
}

export const setAuthCookie = (jwt: string): string =>
  `${AUTH_COOKIE}=${jwt}; Path=/;`;

export const clearAuthCookie = (): string => `${AUTH_COOKIE}=; Path=/;`;
