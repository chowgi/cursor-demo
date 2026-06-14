import type {
  CommentDocument,
  DiscussionDocument,
  TeamDocument,
  UserDocument,
} from './types';
import { sanitizeUser } from './auth';

export const serializeTeam = (doc: TeamDocument) => {
  const { _id, ...rest } = doc;
  return { id: _id, ...rest };
};

export const serializeUserRead = (doc: UserDocument) => sanitizeUser(doc);

export const serializeUserWrite = (doc: UserDocument) => {
  const { _id, ...rest } = doc;
  return { id: _id, ...rest };
};

export const serializeDiscussionRead = (doc: DiscussionDocument) => {
  const { _id, ...rest } = doc;
  return { id: _id, ...rest };
};

export const serializeDiscussionWrite = (doc: DiscussionDocument) => {
  const { _id, author, ...rest } = doc;
  return { id: _id, ...rest, authorId: author.id };
};

export const serializeCommentRead = (doc: CommentDocument) => {
  const { _id, ...rest } = doc;
  return { id: _id, ...rest };
};

export const serializeCommentWrite = (doc: CommentDocument) => {
  const { _id, author, ...rest } = doc;
  return { id: _id, ...rest, authorId: author.id };
};
