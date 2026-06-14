export type UserRole = 'ADMIN' | 'USER';

export type AuthorSnapshot = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  teamId: string;
  bio: string;
  createdAt: number;
};

export type UserDocument = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  teamId: string;
  role: UserRole;
  bio: string;
  createdAt: number;
};

export type TeamDocument = {
  _id: string;
  name: string;
  description: string;
  createdAt: number;
};

export type DiscussionDocument = {
  _id: string;
  title: string;
  body: string;
  teamId: string;
  author: AuthorSnapshot;
  createdAt: number;
};

export type CommentDocument = {
  _id: string;
  body: string;
  discussionId: string;
  author: AuthorSnapshot;
  createdAt: number;
};

export type SanitizedUser = Omit<UserDocument, 'password'> & { id: string };
