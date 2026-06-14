import {
  getCommentsCollection,
  getDiscussionsCollection,
  getTeamsCollection,
  getUsersCollection,
} from './db';

export async function resetDatabase(): Promise<void> {
  await Promise.all([
    getUsersCollection().deleteMany({}),
    getTeamsCollection().deleteMany({}),
    getDiscussionsCollection().deleteMany({}),
    getCommentsCollection().deleteMany({}),
  ]);
}
