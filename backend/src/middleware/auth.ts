import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
  token?: string;
  userId?: string;
}

export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      
      if (!decoded.userId) {
        throw new Error('Invalid token structure');
      }

      const user = await User.findById(decoded.userId)
        .select('-password')
        .lean()
        .exec();
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Attach user info to request
      req.token = token;
      req.user = user as IUser;
      req.userId = user.userId || user._id.toString();
      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          status: 'error',
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      if (jwtError instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token',
          code: 'TOKEN_INVALID'
        });
      }
      throw jwtError;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication'
    });
  }
}; 