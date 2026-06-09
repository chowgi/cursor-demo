import { DiscussionPriority } from '@/types/api';

export type { DiscussionPriority };

export const DISCUSSION_PRIORITIES: DiscussionPriority[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
];

export const PRIORITY_LABELS: Record<DiscussionPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const PRIORITY_OPTIONS = DISCUSSION_PRIORITIES.map((priority) => ({
  label: PRIORITY_LABELS[priority],
  value: priority,
}));
