import { render, screen } from '@/testing/test-utils';
import { DiscussionPriority } from '@/types/api';

import { DiscussionPriorityBadge } from '../discussion-priority-badge';

test('renders priority badge with accessible label for LOW priority', () => {
  render(<DiscussionPriorityBadge priority="LOW" />);

  expect(screen.getByLabelText('Priority: Low')).toBeInTheDocument();
});

test('renders priority badge with accessible label for MEDIUM priority', () => {
  render(<DiscussionPriorityBadge priority="MEDIUM" />);

  expect(screen.getByLabelText('Priority: Medium')).toBeInTheDocument();
});

test('renders priority badge with accessible label for HIGH priority', () => {
  render(<DiscussionPriorityBadge priority="HIGH" />);

  expect(screen.getByLabelText('Priority: High')).toBeInTheDocument();
});

test('renders visible label text when showLabel is true', () => {
  render(<DiscussionPriorityBadge priority="HIGH" showLabel />);

  expect(screen.getByText('High')).toBeInTheDocument();
});

test('defaults to MEDIUM priority when priority is omitted', () => {
  render(<DiscussionPriorityBadge />);

  expect(screen.getByLabelText('Priority: Medium')).toBeInTheDocument();
});

test('defaults to MEDIUM priority when priority is null or invalid', () => {
  render(<DiscussionPriorityBadge priority={null as unknown as DiscussionPriority} />);
  expect(screen.getByLabelText('Priority: Medium')).toBeInTheDocument();

  render(<DiscussionPriorityBadge priority={'BOGUS' as DiscussionPriority} />);
  expect(screen.getAllByLabelText('Priority: Medium').length).toBeGreaterThan(0);
});
