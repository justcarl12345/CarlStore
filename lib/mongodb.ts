import mongoose from 'mongoose';

// Use environment variable if available, otherwise use hardcoded for development
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://carl123:carl122005@ecommerce-cluster.m6gipnv.mongodb.net/?appName=ecommerce-cluster';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

console.log('🔗 Using MongoDB connection...');

// Simple cache without complex types
let cached: {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
} = {
  conn: null,
  promise: null
};

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔄 Connecting to MongoDB...');
    
    // Add connection options for better performance
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ Connected to MongoDB successfully!');
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}