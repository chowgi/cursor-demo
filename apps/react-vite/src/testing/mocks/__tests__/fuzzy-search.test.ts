import { describe, expect, it } from 'vitest';

import { fuzzyMatchesText } from '../fuzzy-search';

describe('fuzzyMatchesText', () => {
  it('matches exact substrings', () => {
    expect(fuzzyMatchesText('Design review for dashboard refresh', 'design')).toBe(
      true,
    );
  });

  it('matches typo desgn against design word with one edit', () => {
    expect(fuzzyMatchesText('Design review for dashboard refresh', 'desgn')).toBe(
      true,
    );
  });

  it('does not match unrelated queries', () => {
    expect(fuzzyMatchesText('API versioning strategy', 'desgn')).toBe(false);
  });
});
