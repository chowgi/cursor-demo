import { render, screen } from '@/testing/test-utils';

import { DiscussionPriorityBadge } from '../discussion-priority-badge';

test.each([
  { priority: 'LOW' as const, label: 'Low' },
  { priority: 'MEDIUM' as const, label: 'Medium' },
  { priority: 'HIGH' as const, label: 'High' },
])('renders $label priority badge with accessible label', ({ priority, label }) => {
  render(<DiscussionPriorityBadge priority={priority} />);

  expect(screen.getByText(label)).toBeInTheDocument();
  expect(screen.getByLabelText(`Priority: ${label}`)).toBeInTheDocument();
});
