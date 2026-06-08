export const DISCUSSION_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;

export type DiscussionPriority = (typeof DISCUSSION_PRIORITIES)[number];

export const DEFAULT_DISCUSSION_PRIORITY: DiscussionPriority = 'MEDIUM';

export const DISCUSSION_PRIORITY_LABELS: Record<DiscussionPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const DISCUSSION_PRIORITY_OPTIONS = DISCUSSION_PRIORITIES.map(
  (priority) => ({
    label: DISCUSSION_PRIORITY_LABELS[priority],
    value: priority,
  }),
);

export const normalizeDiscussionPriority = (
  priority: unknown,
): DiscussionPriority => {
  if (
    typeof priority === 'string' &&
    DISCUSSION_PRIORITIES.includes(priority as DiscussionPriority)
  ) {
    return priority as DiscussionPriority;
  }
  return DEFAULT_DISCUSSION_PRIORITY;
};
