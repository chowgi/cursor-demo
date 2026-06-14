import { DISCUSSIONS_SEARCH_INDEX_NAME } from './discussions-search-index';

const SUGGESTION_LIMIT = 5;

type BuildSearchPipelineOptions = {
  searchQuery: string;
  teamId: string;
  page: number;
  pageSize: number;
};

type BuildSuggestionsPipelineOptions = {
  searchQuery: string;
  teamId: string;
  limit?: number;
};

const teamFilter = (teamId: string) => ({
  text: {
    query: teamId,
    path: 'teamId',
  },
});

/**
 * Typeahead suggestions: title prefix (autocomplete) + text match on title/body.
 */
export const buildDiscussionSuggestionsPipeline = ({
  searchQuery,
  teamId,
  limit = SUGGESTION_LIMIT,
}: BuildSuggestionsPipelineOptions): object[] => [
  {
    $search: {
      index: DISCUSSIONS_SEARCH_INDEX_NAME,
      compound: {
        should: [
          {
            autocomplete: {
              query: searchQuery,
              path: 'title',
              tokenOrder: 'any',
            },
          },
          {
            text: {
              query: searchQuery,
              path: ['title', 'body'],
            },
          },
        ],
        minimumShouldMatch: 1,
        filter: [teamFilter(teamId)],
      },
    },
  },
  {
    $addFields: {
      score: { $meta: 'searchScore' },
    },
  },
  { $limit: limit },
];

/**
 * Full search pipeline for the discussions list (title prefix + body text).
 */
export const buildDiscussionSearchPipeline = ({
  searchQuery,
  teamId,
  page,
  pageSize,
}: BuildSearchPipelineOptions): object[] => [
  {
    $search: {
      index: DISCUSSIONS_SEARCH_INDEX_NAME,
      compound: {
        should: [
          {
            autocomplete: {
              query: searchQuery,
              path: 'title',
              tokenOrder: 'any',
            },
          },
          {
            text: {
              query: searchQuery,
              path: 'body',
            },
          },
        ],
        minimumShouldMatch: 1,
        filter: [teamFilter(teamId)],
      },
    },
  },
  {
    $addFields: {
      score: { $meta: 'searchScore' },
    },
  },
  {
    $facet: {
      metadata: [{ $count: 'total' }],
      data: [{ $skip: pageSize * (page - 1) }, { $limit: pageSize }],
    },
  },
];
