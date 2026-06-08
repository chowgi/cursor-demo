import { db, persistDb } from './db';
import {
  DEMO_PASSWORD,
  DEMO_TEAM_ID,
  demoComments,
  demoDiscussions,
  demoTeam,
  demoUsers,
} from './seed-data';
import { hash } from './utils';

const migrateDemoDiscussionPriorities = async () => {
  let updated = false;

  demoDiscussions.forEach((demoDiscussion) => {
    const discussion = db.discussion.findFirst({
      where: {
        id: {
          equals: demoDiscussion.id,
        },
      },
    });

    if (discussion && discussion.priority !== demoDiscussion.priority) {
      db.discussion.update({
        where: {
          id: {
            equals: demoDiscussion.id,
          },
        },
        data: {
          priority: demoDiscussion.priority,
        },
      });
      updated = true;
    }
  });

  if (updated) {
    await persistDb('discussion');
  }
};

export const isDemoSeedPresent = () =>
  db.team.findFirst({
    where: {
      id: {
        equals: DEMO_TEAM_ID,
      },
    },
  }) !== null;

export const seedDemoData = async () => {
  if (isDemoSeedPresent()) {
    await migrateDemoDiscussionPriorities();
    return;
  }

  const hashedPassword = hash(DEMO_PASSWORD);

  db.team.create(demoTeam);

  demoUsers.forEach((user) => {
    db.user.create({
      ...user,
      password: hashedPassword,
    });
  });

  demoDiscussions.forEach((discussion) => {
    db.discussion.create(discussion);
  });

  demoComments.forEach((comment) => {
    db.comment.create(comment);
  });

  await persistDb('team');
  await persistDb('user');
  await persistDb('discussion');
  await persistDb('comment');
};
