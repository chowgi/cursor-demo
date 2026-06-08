import { DiscussionPriority } from '@/types/api';
import { cn } from '@/utils/cn';

import {
  formatDiscussionPriority,
  getPriorityTagClassName,
  normalizeDiscussionPriority,
} from '../constants/priority';

type PriorityBadgeProps = {
  priority?: DiscussionPriority | null | string;
};

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  const normalizedPriority = normalizeDiscussionPriority(priority);

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        getPriorityTagClassName(normalizedPriority),
      )}
    >
      {formatDiscussionPriority(normalizedPriority)}
    </span>
  );
};
