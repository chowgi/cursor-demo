import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { Link } from '@/components/ui/link';
import { Spinner } from '@/components/ui/spinner';
import { Table } from '@/components/ui/table';
import { paths } from '@/config/paths';
import { formatDate } from '@/utils/format';

import { getDiscussionQueryOptions } from '../api/get-discussion';
import { useDiscussions } from '../api/get-discussions';

import { DeleteDiscussion } from './delete-discussion';

export type DiscussionsListProps = {
  onDiscussionPrefetch?: (id: string) => void;
};

export const DiscussionsList = ({
  onDiscussionPrefetch,
}: DiscussionsListProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get('q') || '',
  );

  const discussionsQuery = useDiscussions({
    page: +(searchParams.get('page') || 1),
    q: searchParams.get('q') || undefined,
  });
  const queryClient = useQueryClient();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchValue) {
      newParams.set('q', searchValue);
    } else {
      newParams.delete('q');
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    newParams.delete('page');
    setSearchParams(newParams);
  };

  if (discussionsQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const discussions = discussionsQuery.data?.data;
  const meta = discussionsQuery.data?.meta;

  if (!discussions) return null;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search discussions..."
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Search discussions"
        />
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Submit search"
        >
          Search
        </button>
        {searchParams.get('q') && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </form>
      <Table
        data={discussions}
        columns={[
          {
            title: 'Title',
            field: 'title',
          },
          {
            title: 'Created At',
            field: 'createdAt',
            Cell({ entry: { createdAt } }) {
              return <span>{formatDate(createdAt)}</span>;
            },
          },
          {
            title: '',
            field: 'id',
            Cell({ entry: { id } }) {
              return (
                <Link
                  onMouseEnter={() => {
                    queryClient.prefetchQuery(getDiscussionQueryOptions(id));
                    onDiscussionPrefetch?.(id);
                  }}
                  to={paths.app.discussion.getHref(id)}
                >
                  View
                </Link>
              );
            },
          },
          {
            title: '',
            field: 'id',
            Cell({ entry: { id } }) {
              return <DeleteDiscussion id={id} />;
            },
          },
        ]}
        pagination={
          meta && {
            totalPages: meta.totalPages,
            currentPage: meta.page,
            rootUrl: '',
          }
        }
      />
    </div>
  );
};
