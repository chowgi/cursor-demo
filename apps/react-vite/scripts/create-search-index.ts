import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = 'cursor-demo';

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is required');
  process.exit(1);
}

async function createSearchIndex() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(DATABASE_NAME);
    const collection = db.collection('discussions');

    console.log('Creating search index "discussions_search"...');

    const result = await collection.createSearchIndex({
      name: 'discussions_search',
      definition: {
        mappings: {
          dynamic: false,
          fields: {
            title: {
              type: 'autocomplete',
            },
            body: {
              type: 'string',
            },
            teamId: {
              type: 'string',
            },
          },
        },
      },
    });

    console.log('✅ Search index created successfully!');
    console.log('Index name:', result);
    console.log(
      '\nNote: The index may take a few minutes to build. Check status with:',
    );
    console.log('db.discussions.getSearchIndexes()');
  } catch (error) {
    console.error('Error creating search index:', error);
    throw error;
  } finally {
    await client.close();
  }
}

createSearchIndex()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  });
