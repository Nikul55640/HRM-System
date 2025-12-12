import express from 'express';
import userController from '../controllers/admin/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { checkPermission } from '../middleware/checkPermission.js';
import { MODULES } from '../config/rolePermissions.js';

const router = express.Router();

/**
 * User Management Routes
 * All routes require SuperAdmin authentication
 */

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  HR Admin, SuperAdmin
 * @requirements 11.1, 11.2
 * @permission USER.CREATE
 */
router.post(
  '/',
  authenticate,
  checkPermission(MODULES.USER.CREATE),
  userController.createUser,
);

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and filtering
 * @access  HR Admin, SuperAdmin
 * @requirements 11.1, 11.2, 11.5
 * @permission USER.VIEW
 */
router.get(
  '/',
  authenticate,
  checkPermission(MODULES.USER.VIEW),
  userController.getUsers,
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  HR Admin, SuperAdmin
 * @requirements 11.1, 11.2
 * @permission USER.VIEW
 */
router.get(
  '/:id',
  authenticate,
  checkPermission(MODULES.USER.VIEW),
  userController.getUserById,
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  HR Admin, SuperAdmin
 * @requirements 11.1, 11.2, 11.3
 * @permission USER.UPDATE
 */
router.put(
  '/:id',
  authenticate,
  checkPermission(MODULES.USER.UPDATE),
  userController.updateUser,
);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Change user role
 * @access  SuperAdmin only
 * @requirements 11.1, 11.2, 11.3, 11.5
 * @permission USER.CHANGE_ROLE
 */
router.patch(
  '/:id/role',
  authenticate,
  checkPermission(MODULES.USER.CHANGE_ROLE),
  userController.changeUserRole,
);

/**
 * @route   PATCH /api/users/:id/activate
 * @desc    Activate user
 * @access  HR Admin, SuperAdmin
 * @requirements 11.1, 11.2, 11.5
 * @permission USER.UPDATE
 */
router.patch(
  '/:id/activate',
  authenticate,
  checkPermission(MODULES.USER.UPDATE),
  userController.activateUser,
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Deactivate user
 * @access  SuperAdmin only
 * @requirements 11.1, 11.2, 11.3, 11.4, 11.5
 * @permission USER.DELETE
 */
router.delete(
  '/:id',
  authenticate,
  checkPermission(MODULES.USER.DELETE),
  userController.deactivateUser,
);

export default router;
