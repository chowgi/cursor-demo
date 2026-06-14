/**
 * Atlas Search index definition for discussions.
 *
 * Per MongoDB docs, autocomplete fields need edgeGram tokenization with
 * minGrams/maxGrams for prefix prediction. Title is indexed as both string
 * (full-text) and autocomplete (typeahead). Fuzzy matching is applied at
 * query time via the autocomplete/text `fuzzy` option (maxEdits: 1).
 *
 * @see https://www.mongodb.com/docs/atlas/atlas-search/autocomplete/
 */
export const DISCUSSIONS_SEARCH_INDEX_NAME = 'discussions_search';

export const discussionsSearchIndexDefinition = {
  mappings: {
    dynamic: false,
    fields: {
      title: [
        {
          type: 'string',
        },
        {
          type: 'autocomplete',
          tokenization: 'edgeGram',
          minGrams: 2,
          maxGrams: 15,
          foldDiacritics: true,
        },
      ],
      body: {
        type: 'string',
      },
      teamId: {
        type: 'string',
      },
    },
  },
} as const;
