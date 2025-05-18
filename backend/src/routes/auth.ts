import express from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/authController';
import { validateAuth, validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { sanitizeInput } from '../middleware/security';

const router = express.Router();

router.post('/register', 
  sanitizeInput,
  validateAuth.register,
  validate,
  register
);

router.post('/login',
  authLimiter,
  sanitizeInput,
  validateAuth.login,
  validate,
  login
);

router.post('/forgot-password',
  authLimiter,
  sanitizeInput,
  validateAuth.forgotPassword,
  validate,
  forgotPassword
);

router.post('/reset-password',
  authLimiter,
  sanitizeInput,
  validateAuth.resetPassword,
  validate,
  resetPassword
);

export default router; 