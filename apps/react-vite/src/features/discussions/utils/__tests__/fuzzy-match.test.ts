import { describe, expect, it } from 'vitest';

import { matchesFuzzyDiscussionSearch } from '../fuzzy-match';

describe('matchesFuzzyDiscussionSearch', () => {
  it('matches exact substrings in title or body', () => {
    expect(
      matchesFuzzyDiscussionSearch(
        'Design review for dashboard refresh',
        'Feedback welcome',
        'design',
      ),
    ).toBe(true);
  });

  it('matches title prefixes', () => {
    expect(
      matchesFuzzyDiscussionSearch(
        'Improving new member onboarding',
        'Checklist ideas',
        'onb',
      ),
    ).toBe(true);
  });

  it('tolerates one-character typos in autocomplete queries', () => {
    expect(
      matchesFuzzyDiscussionSearch(
        'Design review for dashboard refresh',
        'Feedback welcome',
        'desgn',
      ),
    ).toBe(true);
  });

  it('returns false when the query is too far from any indexed word', () => {
    expect(
      matchesFuzzyDiscussionSearch(
        'Design review for dashboard refresh',
        'Feedback welcome',
        'xyznotfound',
      ),
    ).toBe(false);
  });
});
