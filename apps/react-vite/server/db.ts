import { MongoClient, type Collection, type Db } from 'mongodb';

import { serverEnv } from './env';
import type {
  CommentDocument,
  DiscussionDocument,
  TeamDocument,
  UserDocument,
} from './types';

let client: MongoClient | null = null;
let db: Db | null = null;

const userValidator = {
  $jsonSchema: {
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
  },
};

const teamValidator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['_id', 'name', 'description', 'createdAt'],
    properties: {
      _id: { bsonType: 'string' },
      name: { bsonType: 'string' },
      description: { bsonType: 'string' },
      createdAt: { bsonType: ['int', 'long', 'double'] },
    },
  },
};

const discussionValidator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['_id', 'title', 'body', 'teamId', 'author', 'createdAt'],
    properties: {
      _id: { bsonType: 'string' },
      title: { bsonType: 'string' },
      body: { bsonType: 'string' },
      teamId: { bsonType: 'string' },
      author: { bsonType: 'object' },
      createdAt: { bsonType: ['int', 'long', 'double'] },
    },
  },
};

const commentValidator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['_id', 'body', 'discussionId', 'author', 'createdAt'],
    properties: {
      _id: { bsonType: 'string' },
      body: { bsonType: 'string' },
      discussionId: { bsonType: 'string' },
      author: { bsonType: 'object' },
      createdAt: { bsonType: ['int', 'long', 'double'] },
    },
  },
};

async function ensureCollection(
  database: Db,
  name: string,
  validator: object,
): Promise<void> {
  const existing = await database.listCollections({ name }).toArray();
  if (existing.length === 0) {
    await database.createCollection(name, {
      validator,
      validationLevel: 'moderate',
      validationAction: 'warn',
    });
  }
}

async function bootstrapCollections(database: Db): Promise<void> {
  await ensureCollection(database, 'users', userValidator);
  await ensureCollection(database, 'teams', teamValidator);
  await ensureCollection(database, 'discussions', discussionValidator);
  await ensureCollection(database, 'comments', commentValidator);

  await database.collection('users').createIndex({ email: 1 }, { unique: true });
  await database
    .collection('discussions')
    .createIndex({ teamId: 1, createdAt: -1 });
  await database
    .collection('comments')
    .createIndex({ discussionId: 1, createdAt: 1 });
}

export async function connectDb(): Promise<Db> {
  if (db) {
    return db;
  }

  client = new MongoClient(serverEnv.MONGODB_URI);
  await client.connect();
  db = client.db(serverEnv.DATABASE_NAME);
  await bootstrapCollections(db);
  return db;
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

function getDb(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectDb() first.');
  }
  return db;
}

export function getUsersCollection(): Collection<UserDocument> {
  return getDb().collection<UserDocument>('users');
}

export function getTeamsCollection(): Collection<TeamDocument> {
  return getDb().collection<TeamDocument>('teams');
}

export function getDiscussionsCollection(): Collection<DiscussionDocument> {
  return getDb().collection<DiscussionDocument>('discussions');
}

export function getCommentsCollection(): Collection<CommentDocument> {
  return getDb().collection<CommentDocument>('comments');
}
