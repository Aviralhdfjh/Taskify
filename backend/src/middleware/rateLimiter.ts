import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
  type: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      status: 'error',
      type: options.type,
      message: options.message,
      retryAfter: Math.ceil(options.windowMs / 1000 / 60), // minutes
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      const forwardedFor = req.headers['x-forwarded-for'];
      const ip = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) || req.ip;
      return ip || req.socket.remoteAddress || 'unknown';
    },
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        status: 'error',
        type: options.type,
        message: options.message,
        retryAfter: Math.ceil(options.windowMs / 1000 / 60),
      });
    },
    skip: (req: Request) => {
      // Skip health check endpoint
      return req.path === '/health';
    },
  });
};

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts. Please try again after 15 minutes.',
  type: 'AUTH_RATE_LIMIT',
});

export const generalLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests
  message: 'Too many requests. Please try again later.',
  type: 'GENERAL_RATE_LIMIT',
}); 