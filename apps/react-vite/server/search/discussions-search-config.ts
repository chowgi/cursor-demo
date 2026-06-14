/**
 * Query-time fuzzy options for Atlas Search autocomplete and text operators.
 * No index changes required — fuzzy is applied at query time.
 */
export const DISCUSSIONS_SEARCH_FUZZY_OPTIONS = {
  maxEdits: 1,
} as const;
