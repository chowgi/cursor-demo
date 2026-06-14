import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Discussion } from '@/types/api';

export const getDiscussionSuggestions = ({
  q,
}: {
  q: string;
}): Promise<{ data: Discussion[] }> => {
  return api.get('/discussions', {
    params: { q, suggestions: true },
    skipErrorNotification: true,
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
    retry: false,
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
