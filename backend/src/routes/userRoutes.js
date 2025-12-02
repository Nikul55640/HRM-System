import express from 'express';
import userController from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

/**
 * User Management Routes
 * All routes require SuperAdmin authentication
 */

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  SuperAdmin only
 * @requirements 11.1, 11.2
 */
router.post(
  '/',
  authenticate,
  authorize('SuperAdmin'),
  userController.createUser,
);

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and filtering
 * @access  SuperAdmin only
 * @requirements 11.1, 11.2, 11.5
 */
router.get(
  '/',
  authenticate,
  authorize('SuperAdmin'),
  userController.getUsers,
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  SuperAdmin only
 * @requirements 11.1, 11.2
 */
router.get(
  '/:id',
  authenticate,
  authorize('SuperAdmin'),
  userController.getUserById,
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  SuperAdmin only
 * @requirements 11.1, 11.2, 11.3
 */
router.put(
  '/:id',
  authenticate,
  authorize('SuperAdmin'),
  userController.updateUser,
);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Change user role
 * @access  SuperAdmin only
 * @requirements 11.1, 11.2, 11.3, 11.5
 */
router.patch(
  '/:id/role',
  authenticate,
  authorize('SuperAdmin'),
  userController.changeUserRole,
);

/**
 * @route   PATCH /api/users/:id/activate
 * @desc    Activate user
 * @access  SuperAdmin only
 * @requirements 11.1, 11.2, 11.5
 */
router.patch(
  '/:id/activate',
  authenticate,
  authorize('SuperAdmin'),
  userController.activateUser,
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Deactivate user
 * @access  SuperAdmin only
 * @requirements 11.1, 11.2, 11.3, 11.4, 11.5
 */
router.delete(
  '/:id',
  authenticate,
  authorize('SuperAdmin'),
  userController.deactivateUser,
);

export default router;
