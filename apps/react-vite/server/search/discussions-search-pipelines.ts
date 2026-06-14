import { DISCUSSIONS_SEARCH_INDEX_NAME } from './discussions-search-index';
import { DISCUSSIONS_SEARCH_FUZZY } from './discussions-search-config';

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

const titleAutocompleteClause = (searchQuery: string) => ({
  autocomplete: {
    query: searchQuery,
    path: 'title',
    tokenOrder: 'any',
    fuzzy: DISCUSSIONS_SEARCH_FUZZY,
  },
});

const titleBodyTextClause = (searchQuery: string, paths: string | string[]) => ({
  text: {
    query: searchQuery,
    path: paths,
    fuzzy: { maxEdits: DISCUSSIONS_SEARCH_FUZZY.maxEdits },
  },
});

/**
 * Typeahead suggestions: fuzzy autocomplete on title + fuzzy text on title/body.
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
          titleAutocompleteClause(searchQuery),
          titleBodyTextClause(searchQuery, ['title', 'body']),
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
 * Full search pipeline for the discussions list (fuzzy title autocomplete + body text).
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
          titleAutocompleteClause(searchQuery),
          titleBodyTextClause(searchQuery, 'body'),
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
