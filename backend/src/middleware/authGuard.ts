import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.userId) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }
  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.userId) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required',
      code: 'ADMIN_REQUIRED'
    });
  }
  next();
};

export const isAuthenticated = (req: AuthRequest): req is AuthRequest & { 
  user: NonNullable<AuthRequest['user']>;
  userId: string;
} => {
  return req.user !== undefined && req.userId !== undefined;
};

export const getUserId = (req: AuthRequest): string => {
  if (!req.userId) {
    throw new Error('User ID not available');
  }
  return req.userId;
}; 