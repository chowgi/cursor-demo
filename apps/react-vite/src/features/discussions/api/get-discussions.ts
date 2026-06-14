import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Discussion, Meta } from '@/types/api';

export const getDiscussions = ({
  page = 1,
  q,
}: {
  page?: number;
  q?: string;
}): Promise<{
  data: Discussion[];
  meta: Meta;
}> => {
  return api.get(`/discussions`, {
    params: {
      page,
      ...(q && { q }),
    },
  });
};

export const getDiscussionsQueryOptions = ({
  page,
  q,
}: {
  page?: number;
  q?: string;
} = {}) => {
  const params: { page?: number; q?: string } = {};
  if (page) params.page = page;
  if (q) params.q = q;

  return queryOptions({
    queryKey: ['discussions', params],
    queryFn: () => getDiscussions({ page, q }),
  });
};

type UseDiscussionsOptions = {
  page?: number;
  q?: string;
  queryConfig?: QueryConfig<typeof getDiscussionsQueryOptions>;
};

export const useDiscussions = ({
  queryConfig,
  page,
  q,
}: UseDiscussionsOptions = {}) => {
  return useQuery({
    ...getDiscussionsQueryOptions({ page, q }),
    ...queryConfig,
  });
};
