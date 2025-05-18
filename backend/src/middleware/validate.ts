import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateAuth = {
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/\d/)
      .withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*]/)
      .withMessage('Password must contain at least one special character'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  ],
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  forgotPassword: [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  ],
  resetPassword: [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/\d/)
      .withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*]/)
      .withMessage('Password must contain at least one special character'),
  ],
};

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: typeof error === 'object' && 'path' in error ? error.path : 'unknown',
      message: typeof error === 'object' && 'msg' in error ? error.msg : 'Invalid value'
    }));

    return res.status(400).json({ 
      status: 'error',
      errors: formattedErrors
    });
  }
  next();
}; 