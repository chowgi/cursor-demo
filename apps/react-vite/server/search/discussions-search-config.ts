/**
 * Atlas Search fuzzy options for autocomplete and text operators.
 *
 * @see https://www.mongodb.com/docs/atlas/atlas-search/autocomplete/#fuzzy
 * @see https://www.mongodb.com/docs/atlas/atlas-search/text/#fuzzy
 */
export const DISCUSSIONS_SEARCH_FUZZY = {
  maxEdits: 1,
  prefixLength: 1,
} as const;
