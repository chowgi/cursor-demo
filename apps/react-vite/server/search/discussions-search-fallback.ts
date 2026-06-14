import type { Collection } from 'mongodb';

import type { DiscussionDocument } from '../types';

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Case-insensitive substring match when Atlas Search has no hits yet
 * (e.g. newly created discussions before the index syncs).
 */
export const findDiscussionsByTextFallback = async ({
  collection,
  searchQuery,
  teamId,
  limit,
  skip = 0,
}: {
  collection: Collection<DiscussionDocument>;
  searchQuery: string;
  teamId: string;
  limit: number;
  skip?: number;
}): Promise<DiscussionDocument[]> => {
  const pattern = new RegExp(escapeRegex(searchQuery), 'i');

  return collection
    .find({
      teamId,
      $or: [{ title: pattern }, { body: pattern }],
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
};

export const countDiscussionsByTextFallback = async ({
  collection,
  searchQuery,
  teamId,
}: {
  collection: Collection<DiscussionDocument>;
  searchQuery: string;
  teamId: string;
}): Promise<number> => {
  const pattern = new RegExp(escapeRegex(searchQuery), 'i');

  return collection.countDocuments({
    teamId,
    $or: [{ title: pattern }, { body: pattern }],
  });
};
