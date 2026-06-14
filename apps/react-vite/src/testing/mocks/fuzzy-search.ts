const DEFAULT_MAX_EDITS = 1;

const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) {
    return b.length;
  }

  if (b.length === 0) {
    return a.length;
  }

  const previousRow = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 0; i < a.length; i += 1) {
    let previousDiagonal = previousRow[0];
    previousRow[0] = i + 1;

    for (let j = 0; j < b.length; j += 1) {
      const temp = previousRow[j + 1];
      const substitutionCost = a[i] === b[j] ? 0 : 1;

      previousRow[j + 1] = Math.min(
        previousRow[j + 1] + 1,
        previousRow[j] + 1,
        previousDiagonal + substitutionCost,
      );
      previousDiagonal = temp;
    }
  }

  return previousRow[b.length];
};

const fuzzyMatchesText = (
  text: string,
  query: string,
  maxEdits: number,
): boolean => {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (lowerText.includes(lowerQuery)) {
    return true;
  }

  const words = lowerText.split(/\s+/);

  for (const word of words) {
    if (levenshteinDistance(word, lowerQuery) <= maxEdits) {
      return true;
    }

    const minLength = Math.max(1, lowerQuery.length - maxEdits);
    const maxLength = lowerQuery.length + maxEdits;

    for (let length = minLength; length <= Math.min(word.length, maxLength); length += 1) {
      const slice = word.slice(0, length);
      if (levenshteinDistance(slice, lowerQuery) <= maxEdits) {
        return true;
      }
    }
  }

  return false;
};

export const fuzzyMatchesDiscussion = (
  title: string,
  body: string,
  query: string,
  maxEdits = DEFAULT_MAX_EDITS,
): boolean =>
  fuzzyMatchesText(title, query, maxEdits) ||
  fuzzyMatchesText(body, query, maxEdits);

export const matchesTitlePrefix = (title: string, query: string): boolean => {
  const lowerQuery = query.toLowerCase();
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.startsWith(lowerQuery)) {
    return true;
  }

  return lowerTitle
    .split(/\s+/)
    .some((word) => word.startsWith(lowerQuery));
};

export const matchesDiscussionSearch = (
  title: string,
  body: string,
  query: string,
): boolean =>
  matchesTitlePrefix(title, query) ||
  title.toLowerCase().includes(query.toLowerCase()) ||
  body.toLowerCase().includes(query.toLowerCase()) ||
  fuzzyMatchesDiscussion(title, body, query);
