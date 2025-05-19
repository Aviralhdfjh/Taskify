import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config';
import crypto from 'crypto';

// Helper function to create JWT token
const createToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwtSecret, { 
    expiresIn: '7d',
    algorithm: 'HS256'
  });
};

// Helper function to handle errors
const handleError = (res: Response, error: any, defaultMessage: string) => {
  console.error(`Auth Error: ${defaultMessage}`, error);
  
  // Handle specific MongoDB errors
  if (error.code === 11000) {
    return res.status(409).json({
      status: 'error',
      message: 'Email already registered',
      code: 'EMAIL_EXISTS'
    });
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: Object.values(error.errors).map((err: any) => err.message).join(', '),
      code: 'VALIDATION_ERROR'
    });
  }

  // Default error response
  res.status(500).json({
    status: 'error',
    message: defaultMessage,
    code: 'SERVER_ERROR'
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'Email already registered',
        code: 'EMAIL_EXISTS'
      });
    }

    // Create new user
    const user = new User({ email, password, name });
    await user.save();

    // Generate token
    const token = createToken(user._id.toString());

    // Send response
    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      }
    });
  } catch (error) {
    handleError(res, error, 'Error creating user');
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate token
    const token = createToken(user._id.toString());

    // Send response
    res.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      }
    });
  } catch (error) {
    handleError(res, error, 'Error during login');
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No account found with that email',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate reset token (simple implementation - you might want to use a more secure method)
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save({ validateBeforeSave: false });

    // TODO: Send reset email
    
    res.json({
      status: 'success',
      message: 'Reset token sent to email'
    });
  } catch (error) {
    handleError(res, error, 'Error processing password reset request');
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset token',
        code: 'INVALID_RESET_TOKEN'
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const authToken = createToken(user._id.toString());

    res.json({
      status: 'success',
      data: {
        token: authToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      }
    });
  } catch (error) {
    handleError(res, error, 'Error resetting password');
  }
}; 