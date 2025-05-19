import dotenv from 'dotenv';
import path from 'path';
import net from 'net';

// Ensure environment variables are loaded
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Configuration validation
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'] as const;
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(
    '\x1b[33m%s\x1b[0m',
    `Warning: Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
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

// Function to check if a port is available
const isPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        server.close();
        resolve(true);
      })
      .listen(port);
  });
};

// Function to find an available port
const findAvailablePort = async (startPort: number, maxAttempts: number = 10): Promise<number> => {
  for (let port = startPort; port < startPort + maxAttempts; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available ports found between ${startPort} and ${startPort + maxAttempts - 1}`);
};

// Get initial port number from environment or default
const getInitialPort = (): number => {
  const envPort = process.env.PORT;
  if (envPort) {
    const port = parseInt(envPort, 10);
    if (!isNaN(port) && port > 0) {
      return port;
    }
  }
  return 5000; // default port
};

export const config = {
  port: getInitialPort(),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: getMongoUri(),
  jwtSecret: process.env.JWT_SECRET || 'taskify_dev_secret_2024',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  mongooseOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
    connectTimeoutMS: 30000,
    heartbeatFrequencyMS: 2000,
    retryReads: true,
    maxPoolSize: 10,
    minPoolSize: 1
  },
  findAvailablePort
} as const;

// Log configuration (but hide sensitive data)
console.log('\nServer Configuration:');
console.log('- Environment:', config.nodeEnv);
console.log('- Initial Port:', config.port);
console.log('- MongoDB:', config.mongoUri.includes('localhost') ? '(local)' : '(remote)');
console.log('- Frontend URL:', config.frontendUrl);

// Validate configuration
if (config.nodeEnv === 'production') {
  if (config.jwtSecret === 'taskify_dev_secret_2024') {
    console.warn(
      '\x1b[31m%s\x1b[0m',
      'WARNING: Using default JWT secret in production environment!'
    );
  }
  if (config.mongoUri.includes('localhost')) {
    console.warn(
      '\x1b[31m%s\x1b[0m',
      'WARNING: Using local MongoDB in production environment!'
    );
  }
} 