import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

import { DiscussionPriority } from '@/types/api';
import { cn } from '@/utils/cn';

import {
  DISCUSSION_PRIORITY_LABELS,
  DEFAULT_DISCUSSION_PRIORITY,
  normalizeDiscussionPriority,
} from '../types/discussion-priority';

export type DiscussionPriorityBadgeProps = {
  priority?: DiscussionPriority;
  showLabel?: boolean;
  className?: string;
};

const PRIORITY_ICONS: Record<
  DiscussionPriority,
  React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
> = {
  LOW: ArrowDown,
  MEDIUM: Minus,
  HIGH: ArrowUp,
};

const PRIORITY_STYLES: Record<DiscussionPriority, string> = {
  LOW: 'text-blue-600 bg-blue-50',
  MEDIUM: 'text-amber-600 bg-amber-50',
  HIGH: 'text-red-600 bg-red-50',
};

export const DiscussionPriorityBadge = ({
  priority = DEFAULT_DISCUSSION_PRIORITY,
  showLabel = false,
  className,
}: DiscussionPriorityBadgeProps) => {
  const resolvedPriority = normalizeDiscussionPriority(priority);
  const label = DISCUSSION_PRIORITY_LABELS[resolvedPriority];
  const Icon = PRIORITY_ICONS[resolvedPriority];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        PRIORITY_STYLES[resolvedPriority],
        className,
      )}
      aria-label={`Priority: ${label}`}
      title={`Priority: ${label}`}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden={true} />
      {showLabel && <span>{label}</span>}
    </span>
  );
};
