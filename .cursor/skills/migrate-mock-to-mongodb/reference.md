# MongoDB Migration Reference

## Endpoint inventory (14 routes)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/healthcheck` | none | `{ ok: true }` |
| POST | `/api/auth/register` | none | Creates team if no teamId; sets cookie |
| POST | `/api/auth/login` | none | Sets cookie |
| POST | `/api/auth/logout` | none | Clears cookie |
| GET | `/api/auth/me` | optional | `{ data: user \| null }` |
| GET | `/api/teams` | none | All teams |
| GET | `/api/users` | required | Team-scoped list |
| PATCH | `/api/users/profile` | required | Cascade author snapshots |
| DELETE | `/api/users/:userId` | admin | Same team only |
| GET | `/api/discussions` | required | Paginated, team-scoped |
| GET | `/api/discussions/:id` | required | Team-scoped |
| POST | `/api/discussions` | admin | Returns authorId |
| PATCH | `/api/discussions/:id` | admin | Team-scoped |
| DELETE | `/api/discussions/:id` | admin | No team filter on delete |
| GET | `/api/comments` | required | `?discussionId=&page=` |
| POST | `/api/comments` | required | Returns authorId |
| DELETE | `/api/comments/:id` | required | USER: own comments only |

## JSON Schema validator bootstrap

Use on first collection create only (`validationLevel: moderate`, `validationAction: warn`):

```typescript
await db.createCollection('users', {
  validator: { $jsonSchema: { bsonType: 'object', required: ['_id', 'email', ...], properties: { ... } } },
  validationLevel: 'moderate',
  validationAction: 'warn',
});
```

## Demo seed ids (preserve for stable demos)

| Entity | Id |
|--------|-----|
| Team | `demo-team-acme` |
| Admin | `demo-user-admin` / admin@demo.com |
| Users | `demo-user-jane`, `demo-user-alex`, `demo-user-sam` |
| Password | `password123` (DJB2 hashed) |

## serialize helpers

```typescript
// Read path (discussions, comments list/detail)
{ id: doc._id, ...fields, author: doc.author }

// Write path (POST/PATCH/DELETE response)
{ id: doc._id, ...fields, authorId: doc.author.id }
```

## Dependencies added

```json
"mongodb", "cookie-parser", "dotenv"
"@types/cookie-parser", "@types/express"
```
