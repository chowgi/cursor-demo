import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Discussion } from '@/types/api';

export const getDiscussionSuggestions = ({
  q,
}: {
  q: string;
}): Promise<{ data: Discussion[] }> => {
  return api.get('/discussions/suggestions', {
    params: { q },
  });
};

export const getDiscussionSuggestionsQueryOptions = ({
  q,
}: {
  q: string;
}) => {
  return queryOptions({
    queryKey: ['discussions', 'suggestions', { q }],
    queryFn: () => getDiscussionSuggestions({ q }),
    enabled: q.length >= 2,
  });
};

type UseDiscussionSuggestionsOptions = {
  q: string;
  queryConfig?: QueryConfig<typeof getDiscussionSuggestionsQueryOptions>;
};

export const useDiscussionSuggestions = ({
  q,
  queryConfig,
}: UseDiscussionSuggestionsOptions) => {
  return useQuery({
    ...getDiscussionSuggestionsQueryOptions({ q }),
    ...queryConfig,
  });
};
