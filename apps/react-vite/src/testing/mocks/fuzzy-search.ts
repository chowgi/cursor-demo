/** Mirrors Atlas Search fuzzy maxEdits: 1 for MSW mock mode. */
export const FUZZY_MAX_EDITS = 1;

const levenshteinDistance = (a: string, b: string): number => {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(0),
  );

  for (let i = 0; i < rows; i += 1) {
    matrix[i][0] = i;
  }
  for (let j = 0; j < cols; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
};

const fuzzyWordMatches = (word: string, query: string): boolean => {
  if (word.includes(query)) {
    return true;
  }

  if (Math.abs(word.length - query.length) > FUZZY_MAX_EDITS) {
    return false;
  }

  return levenshteinDistance(word, query) <= FUZZY_MAX_EDITS;
};

/**
 * Returns true when query matches text via substring or fuzzy word match (max 1 edit).
 */
export const fuzzyMatchesText = (text: string, query: string): boolean => {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (lowerText.includes(lowerQuery)) {
    return true;
  }

  return lowerText.split(/\s+/).some((word) => fuzzyWordMatches(word, lowerQuery));
};
