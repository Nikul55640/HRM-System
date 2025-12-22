import express from 'express';
import authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { logoutRateLimit, authRateLimit } from '../middleware/rateLimiter.js';
import {
  validate,
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validators/authValidator.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (for initial setup)
 * @access  Public
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authRateLimit, validate(loginSchema), authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', validate(refreshSchema), authController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', logoutRateLimit, authenticate, authController.logout);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password (for authenticated users)
 * @access  Private
 */
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

export default router;
