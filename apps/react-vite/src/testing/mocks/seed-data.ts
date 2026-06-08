/** Marker team ID used to detect whether demo seed data has already been applied. */
export const DEMO_TEAM_ID = 'demo-team-acme';

export const DEMO_PASSWORD = 'password123';

const BASE_TIMESTAMP = 1_700_000_000_000;

export const demoTeam = {
  id: DEMO_TEAM_ID,
  name: 'Acme Product Team',
  description:
    'Cross-functional team building collaboration features for the Bulletproof React demo.',
  createdAt: BASE_TIMESTAMP,
};

export const demoUsers = [
  {
    id: 'demo-user-admin',
    firstName: 'Morgan',
    lastName: 'Chen',
    email: 'admin@demo.com',
    role: 'ADMIN',
    teamId: DEMO_TEAM_ID,
    bio: 'Product lead and team admin for the Acme Product Team.',
    createdAt: BASE_TIMESTAMP + 1_000,
  },
  {
    id: 'demo-user-jane',
    firstName: 'Jane',
    lastName: 'Rivera',
    email: 'jane@demo.com',
    role: 'USER',
    teamId: DEMO_TEAM_ID,
    bio: 'Frontend engineer focused on design systems and accessibility.',
    createdAt: BASE_TIMESTAMP + 2_000,
  },
  {
    id: 'demo-user-alex',
    firstName: 'Alex',
    lastName: 'Patel',
    email: 'alex@demo.com',
    role: 'USER',
    teamId: DEMO_TEAM_ID,
    bio: 'Backend engineer working on API contracts and data modeling.',
    createdAt: BASE_TIMESTAMP + 3_000,
  },
  {
    id: 'demo-user-sam',
    firstName: 'Sam',
    lastName: 'Nguyen',
    email: 'sam@demo.com',
    role: 'USER',
    teamId: DEMO_TEAM_ID,
    bio: 'QA engineer keeping releases stable and user flows polished.',
    createdAt: BASE_TIMESTAMP + 4_000,
  },
] as const;

export const demoDiscussions = [
  {
    id: 'demo-discussion-onboarding',
    title: 'Improving new member onboarding',
    body: 'We should streamline the first-week experience for new teammates. Ideas: a welcome checklist, team glossary, and a short intro discussion thread.',
    authorId: 'demo-user-admin',
    teamId: DEMO_TEAM_ID,
    priority: 'MEDIUM',
    createdAt: BASE_TIMESTAMP + 10_000,
  },
  {
    id: 'demo-discussion-design-review',
    title: 'Design review for dashboard refresh',
    body: 'The updated dashboard layout adds stat cards and recent activity. Please share feedback on information hierarchy before we ship.',
    authorId: 'demo-user-jane',
    teamId: DEMO_TEAM_ID,
    priority: 'HIGH',
    createdAt: BASE_TIMESTAMP + 20_000,
  },
  {
    id: 'demo-discussion-api-versioning',
    title: 'API versioning strategy',
    body: 'Proposal: version public endpoints under /v1 and document breaking changes in release notes. Open question: do we need sunset headers?',
    authorId: 'demo-user-alex',
    teamId: DEMO_TEAM_ID,
    priority: 'URGENT',
    createdAt: BASE_TIMESTAMP + 30_000,
  },
  {
    id: 'demo-discussion-release-checklist',
    title: 'Release checklist for v1.2',
    body: 'Before release: run smoke tests, verify role permissions, confirm discussion pagination, and validate comment deletion flows.',
    authorId: 'demo-user-sam',
    teamId: DEMO_TEAM_ID,
    priority: 'HIGH',
    createdAt: BASE_TIMESTAMP + 40_000,
  },
  {
    id: 'demo-discussion-retrospective',
    title: 'Sprint retrospective notes',
    body: 'What went well: faster PR reviews and fewer flaky tests. What to improve: earlier design alignment and clearer acceptance criteria.',
    authorId: 'demo-user-admin',
    teamId: DEMO_TEAM_ID,
    priority: 'LOW',
    createdAt: BASE_TIMESTAMP + 50_000,
  },
] as const;

export const demoComments = [
  {
    id: 'demo-comment-onboarding-1',
    body: 'Love the checklist idea. We could auto-assign it when someone joins the team.',
    authorId: 'demo-user-jane',
    discussionId: 'demo-discussion-onboarding',
    createdAt: BASE_TIMESTAMP + 11_000,
  },
  {
    id: 'demo-comment-onboarding-2',
    body: 'I can draft the glossary from our existing docs in Confluence.',
    authorId: 'demo-user-alex',
    discussionId: 'demo-discussion-onboarding',
    createdAt: BASE_TIMESTAMP + 12_000,
  },
  {
    id: 'demo-comment-design-1',
    body: 'Stat cards look great. Can we add a quick link to open the latest discussion?',
    authorId: 'demo-user-sam',
    discussionId: 'demo-discussion-design-review',
    createdAt: BASE_TIMESTAMP + 21_000,
  },
  {
    id: 'demo-comment-api-1',
    body: 'Sunset headers would help clients migrate safely. I can prototype middleware support.',
    authorId: 'demo-user-admin',
    discussionId: 'demo-discussion-api-versioning',
    createdAt: BASE_TIMESTAMP + 31_000,
  },
  {
    id: 'demo-comment-release-1',
    body: 'I will run the smoke suite tonight and post results here.',
    authorId: 'demo-user-sam',
    discussionId: 'demo-discussion-release-checklist',
    createdAt: BASE_TIMESTAMP + 41_000,
  },
] as const;
