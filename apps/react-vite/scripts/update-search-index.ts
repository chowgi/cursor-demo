import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = 'cursor-demo';

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is required');
  process.exit(1);
}

async function updateSearchIndex() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(DATABASE_NAME);
    const collection = db.collection('discussions');

    console.log('Checking for existing search index...');
    const indexes = await collection.listSearchIndexes().toArray();
    const existingIndex = indexes.find(
      (idx) => idx.name === 'discussions_search',
    );

    if (existingIndex) {
      console.log('Found existing index "discussions_search"');
      console.log('Dropping old index...');
      await collection.dropSearchIndex('discussions_search');
      console.log('✅ Old index dropped');

      // Wait a moment for the drop to propagate
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log('Creating new search index "discussions_search"...');

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
    console.log('\nIndex definition:');
    console.log(
      JSON.stringify(
        {
          mappings: {
            dynamic: false,
            fields: {
              title: { type: 'string' },
              body: { type: 'string' },
              teamId: { type: 'string' },
            },
          },
        },
        null,
        2,
      ),
    );
    console.log(
      '\nNote: The index may take a few minutes to build. Check status with:',
    );
    console.log('yarn search:check-index');
  } catch (error) {
    console.error('Error updating search index:', error);
    throw error;
  } finally {
    await client.close();
  }
}

updateSearchIndex()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  });
