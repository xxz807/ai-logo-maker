import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!dbName) {
    throw new Error('Please define the MONGODB_DB_NAME environment variable inside .env.local');
}

// 缓存 MongoClient 实例
let cachedClient = null;
let cachedDb = null; 

export async function connectToDatabase() {
    if (cachedClient && cachedDb && cachedClient.topology?.isConnected()) {
        console.log("Reusing existing MongoDB connection.");
        return { client: cachedClient, db: cachedDb };
    }

    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
    });

    try {
        console.log("Establishing new MongoDB connection...");
        await client.connect();
        console.log("MongoDB connection established successfully.");
        const db = client.db(dbName);

        cachedClient = client;
        cachedDb = db;

        return { client, db };
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        cachedClient = null;
        cachedDb = null;
        throw error; 
    }
}