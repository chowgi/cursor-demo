import { DiscussionPriority } from '@/types/api';

export const DEFAULT_DISCUSSION_PRIORITY: DiscussionPriority = 'LOW';

export const DISCUSSION_PRIORITY_OPTIONS: {
  label: string;
  value: DiscussionPriority;
}[] = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
];

export const PRIORITY_TAG_CLASSNAME: Record<DiscussionPriority, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-amber-100 text-amber-800',
  URGENT: 'bg-red-100 text-red-800',
};

export const normalizeDiscussionPriority = (
  priority?: DiscussionPriority | null | string,
): DiscussionPriority => {
  if (
    priority === 'LOW' ||
    priority === 'MEDIUM' ||
    priority === 'HIGH' ||
    priority === 'URGENT'
  ) {
    return priority;
  }

  return DEFAULT_DISCUSSION_PRIORITY;
};

export const formatDiscussionPriority = (priority: DiscussionPriority) =>
  priority.charAt(0) + priority.slice(1).toLowerCase();

export const getPriorityTagClassName = (priority: DiscussionPriority) =>
  PRIORITY_TAG_CLASSNAME[priority];
