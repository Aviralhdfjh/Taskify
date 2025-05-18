import dotenv from 'dotenv';
import path from 'path';

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

// Security middleware
app.use(securityHeaders);
app.use(addRequestId);

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(devLogger);
} else {
  app.use(prodLogger);
}

// Rate limiting
app.use(generalLimiter);

// CORS configuration
const allowedOrigins = [
  'https://taskify-2z6j.vercel.app',  // Vercel deployment
  'http://localhost:5173',            // Vite dev server
  'http://localhost:3000'             // Alternative local development
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
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

const connectWithRetry = async () => {
  try {
    await mongoose.connect(config.mongoUri, config.mongooseOptions);
    console.log('MongoDB connected successfully');
  
    app.listen(config.port, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${config.port}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

connectWithRetry(); 