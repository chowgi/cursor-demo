const levenshteinDistance = (left: string, right: string): number => {
  const rows = left.length + 1;
  const cols = right.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () =>
    Array<number>(cols).fill(0),
  );

  for (let row = 0; row < rows; row += 1) {
    matrix[row][0] = row;
  }

  for (let col = 0; col < cols; col += 1) {
    matrix[0][col] = col;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = left[row - 1] === right[col - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost,
      );
    }
  }

  return matrix[rows - 1][cols - 1];
};

const isWithinEditDistance = (
  candidate: string,
  query: string,
  maxEdits: number,
): boolean => {
  if (candidate === query) {
    return true;
  }

  if (Math.abs(candidate.length - query.length) > maxEdits) {
    return false;
  }

  return levenshteinDistance(candidate, query) <= maxEdits;
};

/**
 * Mirrors Atlas Search fuzzy behaviour for MSW/local dev:
 * substring match OR prefix match OR up to `maxEdits` typos per word.
 */
export const matchesFuzzyDiscussionSearch = (
  title: string,
  body: string,
  query: string,
  maxEdits = 1,
): boolean => {
  const lowerQuery = query.toLowerCase();
  const lowerTitle = title.toLowerCase();
  const lowerBody = body.toLowerCase();

  if (lowerTitle.includes(lowerQuery) || lowerBody.includes(lowerQuery)) {
    return true;
  }

  const titleWords = lowerTitle.split(/\s+/);
  const bodyWords = lowerBody.split(/\s+/);

  return [...titleWords, ...bodyWords].some((word) => {
    if (word.startsWith(lowerQuery)) {
      return true;
    }

    if (isWithinEditDistance(word, lowerQuery, maxEdits)) {
      return true;
    }

    if (lowerQuery.length >= 2 && word.length >= lowerQuery.length) {
      const prefix = word.slice(0, lowerQuery.length);
      return isWithinEditDistance(prefix, lowerQuery, maxEdits);
    }

    return false;
  });
};
