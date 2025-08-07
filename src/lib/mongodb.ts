import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env');
}

const uri = process.env.MONGODB_URI;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db();
  return { db, client };
}

export async function initMongoDB() {
  try {
    const { db } = await connectToDatabase();

    await db.collection('favorites').createIndex(
      { userId: 1, mediaId: 1, mediaType: 1 },
      { unique: true }
    );

  } catch (error) {
    console.error('Error initializing MongoDB:', error);
    throw error;
  }
}

export async function resetIndexes() {
  const { db } = await connectToDatabase();
  
  await db.collection('favorites').dropIndexes();
  
  await db.collection('favorites').createIndex(
    { userId: 1, mediaId: 1, mediaType: 1 },
    { unique: true }
  );
}
