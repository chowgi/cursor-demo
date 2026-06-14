# Discussions Search Setup

This document explains how to set up and verify the MongoDB Atlas Search functionality for the discussions feature.

## Prerequisites

- MongoDB Atlas cluster (M0 or higher)
- `MONGODB_URI` environment variable set in `.env` file
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

Once the index is ready, test the search:

1. Start the dev server:
   ```bash
   yarn dev:server
   ```

2. Make a search request:
   ```bash
   curl 'http://localhost:8080/api/discussions?q=design' \
     -H 'Cookie: token=YOUR_TOKEN'
   ```

3. Or test in the browser:
   - Navigate to `/app/discussions`
   - Type a search query in the search box
   - Click "Search"

## How Search Works

### Backend (Express/MongoDB)

The `GET /discussions` endpoint accepts an optional `q` query parameter:

```typescript
GET /discussions?q=design&page=1
```

When a search query is provided, it uses MongoDB's `$search` aggregation stage with **fuzzy autocomplete** on `title` and fuzzy text search on `body`:

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
            tokenOrder: 'any',
            fuzzy: { maxEdits: 1, prefixLength: 1 }
          }
        },
        {
          text: {
            query: searchQuery,
            path: 'body',
            fuzzy: { maxEdits: 1 }
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

Typo example: `desgn` still matches **Design review for dashboard refresh** via Atlas fuzzy autocomplete.

### Frontend (React/React Query)

The search state is managed via URL query parameters:

```typescript
// URL: /app/discussions?q=design&page=1
const searchQuery = searchParams.get('q')
const { data } = useDiscussions({ q: searchQuery, page })
```

### Features

- **Autocomplete**: Matches partial words as you type (with fuzzy typo tolerance)
- **Fuzzy matching**: Tolerates up to 1 character edit on autocomplete and text search (`maxEdits: 1`)
- **Team scoping**: Only shows discussions from your team
- **Pagination**: Results are paginated (10 per page)
- **Fallback**: Works without search (shows all discussions)

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

**Cause**: MongoDB Atlas Search is not available on local MongoDB or Community Edition.

**Solution**: Ensure you're connecting to a MongoDB Atlas cluster (M0 or higher).

## Testing

The search functionality includes:

- **Unit tests**: MSW handlers simulate search filtering
- **Integration tests**: Test the full search flow with mock data
- **Type checking**: TypeScript ensures type safety

Run tests:
```bash
yarn check-types
yarn test --run
```

## Environment Requirements

Search will **only work** in these environments:

- ✅ MongoDB Atlas (M0 Free tier or higher)
- ✅ Production deployment connected to Atlas
- ❌ Local MongoDB (mongod)
- ❌ MongoDB Community Server
- ❌ MSW mock mode (uses simple text filtering instead)

For local development without Atlas, the app will work but search will be limited to the MSW mock implementation.
