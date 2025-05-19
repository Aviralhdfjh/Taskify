import dotenv from 'dotenv';
import path from 'path';
import http from 'http';

// Load environment variables before other imports
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth';
import todoRoutes from './routes/todos';
import { config } from './config';
import { errorHandler } from './middleware/error';
import { securityHeaders, addRequestId } from './middleware/security';
import { generalLimiter } from './middleware/rateLimiter';
import { devLogger, prodLogger } from './middleware/logger';

const app = express();
let server: http.Server | null = null;

// Security middleware
app.use(securityHeaders);
app.use(addRequestId);

// Request logging
if (config.nodeEnv === 'development') {
  app.use(devLogger);
} else {
  app.use(prodLogger);
}

// Rate limiting
app.use(generalLimiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://taskify-2z6j.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // 10 minutes
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Health check endpoint
app.get('/health', (req, res) => {  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';  res.status(200).json({     status: 'ok',    environment: config.nodeEnv,    timestamp: new Date().toISOString(),    mongo: mongoStatus,    uptime: process.uptime(),    memory: process.memoryUsage()  });});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

const shutdown = async (signal?: string) => {
  console.log(`\nReceived ${signal || 'shutdown'} signal`);
  
  if (server) {
    console.log('Shutting down server...');
    await new Promise<void>((resolve, reject) => {
      server!.close((err) => {
        if (err) {
          console.error('Error closing server:', err);
          reject(err);
        } else {
          resolve();
        }
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.log('Forcing server shutdown after timeout');
        resolve();
      }, 10000);
    });
  }

  if (mongoose.connection.readyState === 1) {
    console.log('Closing MongoDB connection...');
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed successfully');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
    }
  }

  console.log('Shutdown complete');
  process.exit(0);
};

const connectToMongoDB = async (retries = 3, delay = 5000): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (mongoose.connection.readyState === 1) {
        console.log('MongoDB already connected');
        return;
      }
      
      console.log(`Connecting to MongoDB (attempt ${attempt}/${retries})...`);
      await mongoose.connect(config.mongoUri, config.mongooseOptions);
      console.log('MongoDB connected successfully');
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt} failed:`, err);
      if (attempt === retries) {
        throw new Error(`Failed to connect to MongoDB after ${retries} attempts`);
      }
      console.log(`Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const startServer = async () => {
  try {
    // Connect to MongoDB with retries
    await connectToMongoDB();

    // Find an available port
    let port = config.port;
    try {
      port = await config.findAvailablePort(config.port);
      if (port !== config.port) {
        console.log(`Port ${config.port} is in use, using port ${port} instead`);
      }
    } catch (err) {
      console.error('Failed to find available port:', err);
      throw err;
    }

    // Start the server with connection testing
    return new Promise<void>((resolve, reject) => {
      server = app.listen(port, () => {
        console.log(`Server running in ${config.nodeEnv} mode on port ${port}`);
        console.log(`CORS: ${config.nodeEnv === 'development' ? 'All origins allowed' : `Restricted to ${config.frontendUrl}`}`);
        
        // Test the server connection
        const testConnection = () => {
          const req = http.request({
            hostname: 'localhost',
            port: port,
            path: '/health',
            method: 'GET',
            timeout: 5000
          }, (res) => {
            if (res.statusCode === 200) {
              console.log('Server health check passed');
              resolve();
            } else {
              reject(new Error(`Health check failed with status: ${res.statusCode}`));
            }
          });

          req.on('error', (err) => {
            reject(new Error(`Server health check failed: ${err.message}`));
          });

          req.end();
        };

        // Wait a bit before testing to ensure server is ready
        setTimeout(testConnection, 1000);
      });

      server.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          reject(new Error(`Port ${port} is already in use`));
        } else {
          reject(error);
        }
      });

      // Set server timeout
      server.timeout = 30000; // 30 seconds
      server.keepAliveTimeout = 65000; // slightly higher than 60 seconds
    });

  } catch (err) {
    console.error('Startup error:', err);
    await shutdown();
    process.exit(1);
  }
};

// Handle process signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  shutdown('UNHANDLED_REJECTION');
});

// Start the server
startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
}); 