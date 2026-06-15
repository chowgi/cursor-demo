# Discussions Search Setup

This document explains how to set up and verify the MongoDB Atlas Search functionality for the discussions feature.

## Prerequisites

- MongoDB Atlas cluster (M0 or higher)
- `MONGODB_URI` environment variable set in `.env` file (cloud agents connect to Atlas directly — no mock backend)
- `ENABLE_DEMO_SEEDING=true` in `.env` for the demo discussions dataset (do not commit `.env`)
- Atlas Search is only available on Atlas clusters (not local MongoDB)

## Quick Setup

### 1. Check if the index exists

```bash
yarn search:check-index
```

This will check if the `discussions_search` index exists and is ready.

### 2. Create the index (if needed)

```bash
yarn search:create-index
```

This will create the Atlas Search index with the following configuration:

- **Index name**: `discussions_search`
- **Fields**:
  - `title`: autocomplete field for typeahead search
  - `body`: full-text string search
  - `teamId`: filter field for team scoping

### 3. Wait for index to build

After creating the index, it may take 1-5 minutes to build depending on your data size. Run the check command again:

```bash
yarn search:check-index
```

Wait until you see: `✅ All required search indexes are ready!`

## Manual Setup via Atlas UI

If you prefer to create the index manually:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to your cluster
3. Click on the **Search** tab
4. Click **Create Search Index**
5. Choose **JSON Editor**
6. Select database: `cursor-demo`
7. Select collection: `discussions`
8. Paste this index definition:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "title": [
        { "type": "string" },
        {
          "type": "autocomplete",
          "tokenization": "edgeGram",
          "minGrams": 2,
          "maxGrams": 15,
          "foldDiacritics": true
        }
      ],
      "body": { "type": "string" },
      "teamId": { "type": "string" }
    }
  }
}
```

The `title` field uses **multi-type indexing** per MongoDB docs: `string` for full-text and `autocomplete` with `edgeGram` for prefix prediction as you type.

9. Name the index: `discussions_search`
10. Click **Create Search Index**

## Verify Search Works

Once the index is ready, test the search. Cloud agents: use the **start-demo** skill (both servers required).

1. Start the API and frontend:

   ```bash
   yarn dev:server   # :8080
   yarn dev          # :3000
   ```

2. Make a search request (API only):

   ```bash
   curl 'http://localhost:8080/api/discussions?q=design' \
     -H 'Cookie: token=YOUR_TOKEN'
   ```

3. Or test in the browser:
   - Log in as `admin@demo.com` / `password123`
   - Navigate to `/app/discussions`
   - Type a search query in the search box (e.g. `onboard` or `design`)
   - Confirm autocomplete suggestions and filtered results

## User-Facing Behavior

The discussions page stores search state in the URL so results can be shared or refreshed:

```text
/app/discussions?q=design&page=1
```

- Typing at least 2 trimmed characters opens the autocomplete dropdown.
- Suggestions are fetched after a 200 ms debounce and return up to 5 team-scoped discussions.
- Pressing Enter searches for the typed value, or the highlighted suggestion if one is selected.
- Clicking a suggestion searches for that discussion title; it does not navigate directly to the discussion.
- The Clear action removes both `q` and `page` from the URL.
- Search results are scoped to the signed-in user's team and paginated at 10 discussions per page.

## How Search Works

### Backend (Express/MongoDB)

The authenticated `GET /discussions` endpoint supports list search and autocomplete suggestions:

```bash
# Filtered discussions list
curl 'http://localhost:8080/api/discussions?q=design&page=1' \
  -H 'Cookie: token=YOUR_TOKEN'

# Autocomplete suggestions
curl 'http://localhost:8080/api/discussions?suggestions=true&q=des' \
  -H 'Cookie: token=YOUR_TOKEN'
```

When a search query is provided, it uses MongoDB's `$search` aggregation stage. Pipelines live in `server/search/discussions-search-pipelines.ts`:

```javascript
{
  $search: {
    index: 'discussions_search',
    compound: {
      should: [
        {
          autocomplete: {
            query: searchQuery,
            path: 'title',
            tokenOrder: 'any'
          }
        },
        {
          text: {
            query: searchQuery,
            path: ['title', 'body']  // suggestions pipeline; list search uses path: 'body'
          }
        }
      ],
      minimumShouldMatch: 1,
      filter: [
        {
          text: {
            query: user.teamId,
            path: 'teamId'
          }
        }
      ]
    }
  }
}
```

If Atlas Search returns no hits, the API falls back to case-insensitive regex substring matching via `server/search/discussions-search-fallback.ts`.

### Frontend (React/React Query)

The search state is managed via URL query parameters:

```typescript
// URL: /app/discussions?q=design&page=1
const searchQuery = searchParams.get('q');
const { data } = useDiscussions({ q: searchQuery, page });
```

### Features

- **Autocomplete**: Prefix and text match on title (and body for suggestions) as you type
- **Fuzzy matching (planned, BEN-11)**: Typo tolerance (e.g. `desgn` → "design") requires `fuzzy: { maxEdits: 1 }` on the `autocomplete` and `text` operators in the search pipelines — not yet implemented
- **Regex fallback**: Substring match when Atlas Search succeeds but returns no hits; does **not** tolerate typos and is not a substitute for `$search` support
- **Team scoping**: Only shows discussions from your team
- **Pagination**: Results are paginated (10 per page)

## Troubleshooting

### "No search indexes found"

**Cause**: The search index hasn't been created yet.

**Solution**: Run `yarn search:create-index`

### "Index is still building"

**Cause**: The index is being built by Atlas (this is normal).

**Solution**: Wait 1-5 minutes and run `yarn search:check-index` again.

### "Search returns no results"

**Possible causes**:

1. No discussions contain the search term
2. Discussions belong to a different team
3. Index is not fully built yet

**Solutions**:

- Try a different search term (e.g., "discussion", "design", "api")
- Verify you're logged in and have discussions in your team
- Run `yarn search:check-index` to verify index status

### "Server error when searching"

**Cause**: MongoDB Atlas Search is not available on local MongoDB or Community Edition, or the `discussions_search` index is missing.

**Solution**: Ensure you're connecting to a MongoDB Atlas cluster (M0 or higher), then run `yarn search:check-index` and create the index if needed.

## Testing

The search functionality includes:

- **Integration tests**: Real Express API against MongoDB Atlas via `MONGODB_URI` and `src/testing/test-server.ts`
- **Regex fallback**: Used when Atlas Search returns no hits (not a substitute for typo matching)
- **Type checking**: TypeScript ensures type safety

Run tests:

```bash
yarn check-types
yarn test --run
```

Requires `MONGODB_URI` in `.env` (same Atlas cluster as dev).

## Environment Requirements

Search behavior by environment:

- ✅ **MongoDB Atlas** (M0+): Full Atlas Search autocomplete and text search; fuzzy matching after BEN-11 pipeline work
- ✅ **Vitest / E2E**: Real MongoDB via `MONGODB_URI`; search specs require Atlas Search support and the `discussions_search` index
- ⚠️ **Local MongoDB** (non-Atlas): Basic CRUD and unfiltered discussion lists can work, but `q` search and `suggestions=true` requests fail because `$search` is unsupported
- ❌ **MongoDB Community Server without `$search`**: Not supported for the Atlas Search workflow

The regex fallback only runs after an Atlas `$search` query completes with zero hits. It covers newly created or not-yet-indexed discussions; it does not catch unsupported `$search` errors.
