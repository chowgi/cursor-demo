import { MongoClient, type Db } from 'mongodb';

import { DB_NAME, env } from './env';
import type {
  CommentDocument,
  DiscussionDocument,
  TeamDocument,
  UserDocument,
} from './types';

let client: MongoClient | null = null;
let database: Db | null = null;

const authorSchema = {
  bsonType: 'object',
  required: [
    'id',
    'firstName',
    'lastName',
    'email',
    'role',
    'teamId',
    'bio',
    'createdAt',
  ],
  properties: {
    id: { bsonType: 'string' },
    firstName: { bsonType: 'string' },
    lastName: { bsonType: 'string' },
    email: { bsonType: 'string' },
    role: { enum: ['ADMIN', 'USER'] },
    teamId: { bsonType: 'string' },
    bio: { bsonType: 'string' },
    createdAt: { bsonType: ['int', 'long', 'double'] },
  },
};

const createCollectionIfMissing = async (
  db: Db,
  name: string,
  validator: Record<string, unknown>,
): Promise<void> => {
  const existingCollections = await db
    .listCollections({ name }, { nameOnly: true })
    .toArray();

  if (existingCollections.length === 0) {
    await db.createCollection(name, {
      validator: {
        $jsonSchema: validator,
      },
      validationLevel: 'moderate',
      validationAction: 'warn',
    });
  }
};

export const connectDb = async (): Promise<Db> => {
  if (database) {
    return database;
  }

  client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  database = client.db(DB_NAME);

  await bootstrapCollections(database);

  return database;
};

export const bootstrapCollections = async (db: Db): Promise<void> => {
  await createCollectionIfMissing(db, 'users', {
    bsonType: 'object',
    required: [
      '_id',
      'firstName',
      'lastName',
      'email',
      'password',
      'teamId',
      'role',
      'bio',
      'createdAt',
    ],
    properties: {
      _id: { bsonType: 'string' },
      firstName: { bsonType: 'string' },
      lastName: { bsonType: 'string' },
      email: { bsonType: 'string' },
      password: { bsonType: 'string' },
      teamId: { bsonType: 'string' },
      role: { enum: ['ADMIN', 'USER'] },
      bio: { bsonType: 'string' },
      createdAt: { bsonType: ['int', 'long', 'double'] },
    },
  });

  await createCollectionIfMissing(db, 'teams', {
    bsonType: 'object',
    required: ['_id', 'name', 'description', 'createdAt'],
    properties: {
      _id: { bsonType: 'string' },
      name: { bsonType: 'string' },
      description: { bsonType: 'string' },
      createdAt: { bsonType: ['int', 'long', 'double'] },
    },
  });

  await createCollectionIfMissing(db, 'discussions', {
    bsonType: 'object',
    required: ['_id', 'title', 'body', 'teamId', 'author', 'createdAt'],
    properties: {
      _id: { bsonType: 'string' },
      title: { bsonType: 'string' },
      body: { bsonType: 'string' },
      teamId: { bsonType: 'string' },
      author: authorSchema,
      createdAt: { bsonType: ['int', 'long', 'double'] },
    },
  });

  await createCollectionIfMissing(db, 'comments', {
    bsonType: 'object',
    required: ['_id', 'body', 'discussionId', 'author', 'createdAt'],
    properties: {
      _id: { bsonType: 'string' },
      body: { bsonType: 'string' },
      discussionId: { bsonType: 'string' },
      author: authorSchema,
      createdAt: { bsonType: ['int', 'long', 'double'] },
    },
  });

  await db.collection<UserDocument>('users').createIndex({ email: 1 }, { unique: true });
  await db
    .collection<DiscussionDocument>('discussions')
    .createIndex({ teamId: 1, createdAt: -1 });
  await db
    .collection<CommentDocument>('comments')
    .createIndex({ discussionId: 1, createdAt: -1 });
};

export const getDb = (): Db => {
  if (!database) {
    throw new Error('Database has not been initialized');
  }

  return database;
};

export const getUsersCollection = () => getDb().collection<UserDocument>('users');
export const getTeamsCollection = () => getDb().collection<TeamDocument>('teams');
export const getDiscussionsCollection = () =>
  getDb().collection<DiscussionDocument>('discussions');
export const getCommentsCollection = () =>
  getDb().collection<CommentDocument>('comments');

export const closeDb = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
};
