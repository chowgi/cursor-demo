import {
  DEMO_PASSWORD,
  DEMO_TEAM_ID,
  demoComments,
  demoDiscussions,
  demoTeam,
  demoUsers,
} from '../src/testing/mocks/seed-data';

import { hash, toAuthorSnapshot } from './auth';
import {
  getCommentsCollection,
  getDiscussionsCollection,
  getTeamsCollection,
  getUsersCollection,
} from './db';
import type { UserDocument } from './types';

export async function isDemoSeedPresent(): Promise<boolean> {
  const teams = getTeamsCollection();
  const existing = await teams.findOne({ _id: DEMO_TEAM_ID });
  return existing !== null;
}

export async function seedDemoData(): Promise<void> {
  if (await isDemoSeedPresent()) {
    return;
  }

  const hashedPassword = hash(DEMO_PASSWORD);
  const teams = getTeamsCollection();
  const users = getUsersCollection();
  const discussions = getDiscussionsCollection();
  const comments = getCommentsCollection();

  await teams.updateOne(
    { _id: demoTeam.id },
    {
      $set: {
        _id: demoTeam.id,
        name: demoTeam.name,
        description: demoTeam.description,
        createdAt: demoTeam.createdAt,
      },
    },
    { upsert: true },
  );

  const userDocs: UserDocument[] = demoUsers.map((user) => ({
    _id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    teamId: user.teamId,
    bio: user.bio,
    createdAt: user.createdAt,
    password: hashedPassword,
  }));

  for (const user of userDocs) {
    await users.updateOne({ _id: user._id }, { $set: user }, { upsert: true });
  }

  const userById = new Map(userDocs.map((user) => [user._id, user]));

  for (const discussion of demoDiscussions) {
    const author = userById.get(discussion.authorId);
    if (!author) {
      continue;
    }

    await discussions.updateOne(
      { _id: discussion.id },
      {
        $set: {
          _id: discussion.id,
          title: discussion.title,
          body: discussion.body,
          teamId: discussion.teamId,
          author: toAuthorSnapshot(author),
          createdAt: discussion.createdAt,
        },
      },
      { upsert: true },
    );
  }

  for (const comment of demoComments) {
    const author = userById.get(comment.authorId);
    if (!author) {
      continue;
    }

    await comments.updateOne(
      { _id: comment.id },
      {
        $set: {
          _id: comment.id,
          body: comment.body,
          discussionId: comment.discussionId,
          author: toAuthorSnapshot(author),
          createdAt: comment.createdAt,
        },
      },
      { upsert: true },
    );
  }
}
