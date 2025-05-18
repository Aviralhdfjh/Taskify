import dotenv from 'dotenv';
import path from 'path';

// Ensure environment variables are loaded
const envPath = path.join(__dirname, '../../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`Warning: No .env file found at ${envPath}, using default configuration`);
}

const getMongoUri = (): string => {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    const cleanUri = uri.trim().replace(/^["'](.+)["']$/, '$1');
    if (cleanUri.startsWith('mongodb://') || cleanUri.startsWith('mongodb+srv://')) {
      return cleanUri;
    }
  }
  // Default to local MongoDB if no valid URI is provided
  return 'mongodb://localhost:27017/taskify';
};

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: getMongoUri(),
  jwtSecret: process.env.JWT_SECRET || 'taskify_dev_secret_2024',
  mongooseOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true
  }
} as const;

// Log configuration (but hide sensitive data)
console.log('Server Configuration:');
console.log('- Port:', config.port);
console.log('- MongoDB:', config.mongoUri.includes('localhost') ? '(local)' : '(remote)');
console.log('- Environment:', process.env.NODE_ENV || 'development'); 