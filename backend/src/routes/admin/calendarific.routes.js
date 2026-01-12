/**
 * Calendarific API Routes
 * Routes for managing Calendarific holiday integration
 */

import express from 'express';
import { body, query } from 'express-validator';
import {
  testConnection,
  getSupportedCountries,
  previewHolidays,
  syncHolidays,
  getSyncStatus,
  getHolidayStats,
  bulkSyncHolidays
} from '../../controllers/admin/calendarific.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/requireRoles.js';

const router = express.Router();

// Apply authentication and role-based access control
router.use(authenticateToken);
router.use(requireRoles(['SuperAdmin', 'HR', 'HR_Manager']));

/**
 * @route GET /api/admin/calendarific/test-connection
 * @desc Test Calendarific API connection
 * @access HR, HR_Manager, SuperAdmin
 */
router.get('/test-connection', testConnection);

/**
 * @route GET /api/admin/calendarific/countries
 * @desc Get supported countries from Calendarific
 * @access HR, HR_Manager, SuperAdmin
 */
router.get('/countries', getSupportedCountries);

/**
 * @route GET /api/admin/calendarific/preview
 * @desc Preview holidays from Calendarific (without saving)
 * @access HR, HR_Manager, SuperAdmin
 */
router.get('/preview', [
  query('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be 2 characters (ISO 3166-1 alpha-2)'),
  query('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  query('type')
    .optional()
    .isIn(['national', 'local', 'religious', 'observance'])
    .withMessage('Type must be one of: national, local, religious, observance')
], previewHolidays);

/**
 * @route POST /api/admin/calendarific/sync
 * @desc Sync holidays from Calendarific to database
 * @access HR, HR_Manager, SuperAdmin
 */
router.post('/sync', [
  body('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be 2 characters (ISO 3166-1 alpha-2)'),
  body('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  body('overwriteExisting')
    .optional()
    .isBoolean()
    .withMessage('overwriteExisting must be a boolean'),
  body('dryRun')
    .optional()
    .isBoolean()
    .withMessage('dryRun must be a boolean'),
  body('holidayTypes')
    .optional()
    .matches(/^(national|local|religious|observance)(,(national|local|religious|observance))*$/)
    .withMessage('holidayTypes must be comma-separated list of: national, local, religious, observance')
], syncHolidays);

/**
 * @route POST /api/admin/calendarific/bulk-sync
 * @desc Bulk sync holidays for multiple years
 * @access SuperAdmin only (more restrictive due to API usage)
 */
router.post('/bulk-sync', [
  requireRoles(['SuperAdmin']), // More restrictive access
  body('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be 2 characters (ISO 3166-1 alpha-2)'),
  body('startYear')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Start year must be between 2020 and 2030'),
  body('endYear')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('End year must be between 2020 and 2030'),
  body('overwriteExisting')
    .optional()
    .isBoolean()
    .withMessage('overwriteExisting must be a boolean'),
  body('holidayTypes')
    .optional()
    .matches(/^(national|local|religious|observance)(,(national|local|religious|observance))*$/)
    .withMessage('holidayTypes must be comma-separated list of: national, local, religious, observance')
], bulkSyncHolidays);

/**
 * @route GET /api/admin/calendarific/status
 * @desc Get sync status and API health
 * @access HR, HR_Manager, SuperAdmin
 */
router.get('/status', getSyncStatus);

/**
 * @route GET /api/admin/calendarific/stats
 * @desc Get holiday statistics from Calendarific
 * @access HR, HR_Manager, SuperAdmin
 */
router.get('/stats', [
  query('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be 2 characters (ISO 3166-1 alpha-2)'),
  query('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030')
], getHolidayStats);

export default router;