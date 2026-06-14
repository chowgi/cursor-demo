import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = 'cursor-demo';

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is required');
  process.exit(1);
}

async function checkSearchIndex() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(DATABASE_NAME);
    const collection = db.collection('discussions');

    console.log('\nChecking for search indexes on discussions collection...\n');

    const indexes = await collection.listSearchIndexes().toArray();

    if (indexes.length === 0) {
      console.log('❌ No search indexes found!');
      console.log('\nTo create the required index, run:');
      console.log('  yarn vite-node scripts/create-search-index.ts');
      process.exit(1);
    }

    console.log(`Found ${indexes.length} search index(es):\n`);

    for (const index of indexes) {
      const status = index.status || 'UNKNOWN';
      const emoji = status === 'READY' ? '✅' : '⏳';

      console.log(`${emoji} Index: ${index.name}`);
      console.log(`   Status: ${status}`);
      console.log(`   Type: ${index.type || 'search'}`);

      if (status !== 'READY') {
        console.log(
          '   ⚠️  Index is still building. This may take a few minutes.',
        );
      }

      console.log('');
    }

    const hasRequiredIndex = indexes.some(
      (idx) => idx.name === 'discussions_search',
    );

    if (!hasRequiredIndex) {
      console.log('❌ Required index "discussions_search" not found!');
      console.log('\nTo create it, run:');
      console.log('  yarn vite-node scripts/create-search-index.ts');
      process.exit(1);
    }

    const requiredIndex = indexes.find(
      (idx) => idx.name === 'discussions_search',
    );

    if (requiredIndex?.status !== 'READY') {
      console.log(
        '⏳ Index "discussions_search" is building. Wait a few minutes and try again.',
      );
      process.exit(1);
    }

    console.log('✅ All required search indexes are ready!');
  } catch (error) {
    console.error('Error checking search indexes:', error);
    throw error;
  } finally {
    await client.close();
  }
}

checkSearchIndex()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  });
