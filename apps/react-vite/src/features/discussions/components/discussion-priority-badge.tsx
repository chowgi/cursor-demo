import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

import { DiscussionPriority } from '@/types/api';
import { cn } from '@/utils/cn';

import { PRIORITY_LABELS } from '../types/discussion-priority';

export interface DiscussionPriorityBadgeProps {
  priority: DiscussionPriority;
}

const PRIORITY_STYLES: Record<
  DiscussionPriority,
  { className: string; Icon: typeof ArrowDown }
> = {
  LOW: {
    className: 'bg-green-100 text-green-800',
    Icon: ArrowDown,
  },
  MEDIUM: {
    className: 'bg-amber-100 text-amber-800',
    Icon: Minus,
  },
  HIGH: {
    className: 'bg-red-100 text-red-800',
    Icon: ArrowUp,
  },
};

export const DiscussionPriorityBadge = ({
  priority,
}: DiscussionPriorityBadgeProps) => {
  const label = PRIORITY_LABELS[priority];
  const { className, Icon } = PRIORITY_STYLES[priority];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        className,
      )}
      aria-label={`Priority: ${label}`}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
};
