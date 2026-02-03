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
  batchPreviewHolidays,
  syncHolidays,
  getSyncStatus,
  getHolidayStats,
  bulkSyncHolidays,
  getAvailableFilters,
  previewHolidaysWithFilters,
  syncHolidaysWithFilters,
  getFestivalHolidays,
  getNationalHolidays,
  applyCompanyPolicy,
  getApiUsageStats,
  syncWithTemplate
} from '../../controllers/admin/calendarific.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/requireRoles.js';
import { ROLES } from '../../config/roles.js';

const router = express.Router();

// Apply authentication and role-based access control
router.use(authenticateToken);
router.use(requireRoles([ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR_MANAGER]));

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
 * @route GET /api/admin/calendarific/batch-preview
 * @desc Batch preview holidays - Multiple types in ONE request (SAVES API CREDITS)
 * @access HR, HR_Manager, SuperAdmin
 */
router.get('/batch-preview', [
  query('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be 2 characters (ISO 3166-1 alpha-2)'),
  query('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  query('types')
    .optional()
    .isString()
    .withMessage('Types must be comma-separated string (e.g., "national,religious")')
], batchPreviewHolidays);

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

// ===== NEW SELECTIVE FILTERING ENDPOINTS =====

/**
 * @route GET /api/admin/calendarific/filters
 * @desc Get available filter options and company policy templates
 * @access HR, HR_Manager, SuperAdmin
 */
router.get('/filters', getAvailableFilters);

/**
 * @route POST /api/admin/calendarific/preview-filtered
 * @desc Preview holidays with advanced filters
 * @access HR, HR_Manager, SuperAdmin
 */
router.post('/preview-filtered', [
  body('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be 2 characters (ISO 3166-1 alpha-2)'),
  body('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  body('holidayTypes')
    .optional()
    .matches(/^(national|local|religious|observance)(,(national|local|religious|observance))*$/)
    .withMessage('holidayTypes must be comma-separated list of: national, local, religious, observance'),
  body('festivalsOnly')
    .optional()
    .isBoolean()
    .withMessage('festivalsOnly must be a boolean'),
  body('nationalOnly')
    .optional()
    .isBoolean()
    .withMessage('nationalOnly must be a boolean'),
  body('excludeObservances')
    .optional()
    .isBoolean()
    .withMessage('excludeObservances must be a boolean'),
  body('paidOnly')
    .optional()
    .isBoolean()
    .withMessage('paidOnly must be a boolean'),
  body('maxHolidays')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('maxHolidays must be between 1 and 50')
], previewHolidaysWithFilters);

/**
 * @route POST /api/admin/calendarific/sync-filtered
 * @desc Sync holidays with advanced filters
 * @access HR, HR_Manager, SuperAdmin
 */
router.post('/sync-filtered', [
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
    .withMessage('holidayTypes must be comma-separated list of: national, local, religious, observance'),
  body('festivalsOnly')
    .optional()
    .isBoolean()
    .withMessage('festivalsOnly must be a boolean'),
  body('nationalOnly')
    .optional()
    .isBoolean()
    .withMessage('nationalOnly must be a boolean'),
  body('excludeObservances')
    .optional()
    .isBoolean()
    .withMessage('excludeObservances must be a boolean'),
  body('paidOnly')
    .optional()
    .isBoolean()
    .withMessage('paidOnly must be a boolean'),
  body('maxHolidays')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('maxHolidays must be between 1 and 50')
], syncHolidaysWithFilters);

/**
 * @route GET /api/admin/calendarific/festivals
 * @desc Get festival holidays only
 * @access HR, HR_Manager, SuperAdmin
 */
router.get('/festivals', [
  query('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be 2 characters (ISO 3166-1 alpha-2)'),
  query('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  query('holidayTypes')
    .optional()
    .matches(/^(national|local|religious|observance)(,(national|local|religious|observance))*$/)
    .withMessage('holidayTypes must be comma-separated list of: national, local, religious, observance')
], getFestivalHolidays);

/**
 * @route GET /api/admin/calendarific/national
 * @desc Get national holidays only
 * @access HR, HR_Manager, SuperAdmin
 */
router.get('/national', [
  query('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be 2 characters (ISO 3166-1 alpha-2)'),
  query('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030')
], getNationalHolidays);

/**
 * @route GET /api/admin/calendarific/api-usage
 * @desc Get API usage statistics and cache status
 * @access HR, HR_Manager, SuperAdmin
 */
router.get('/api-usage', getApiUsageStats);

/**
 * @route POST /api/admin/calendarific/apply-policy
 * @desc Apply company policy template for holiday selection
 * @access HR, HR_Manager, SuperAdmin
 */
router.post('/apply-policy', [
  body('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be 2 characters (ISO 3166-1 alpha-2)'),
  body('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  body('policyTemplate')
    .notEmpty()
    .isIn(['TECH_STARTUP', 'TRADITIONAL_CORPORATE', 'GOVERNMENT_OFFICE', 'MANUFACTURING'])
    .withMessage('policyTemplate must be one of: TECH_STARTUP, TRADITIONAL_CORPORATE, GOVERNMENT_OFFICE, MANUFACTURING'),
  body('dryRun')
    .optional()
    .isBoolean()
    .withMessage('dryRun must be a boolean')
], applyCompanyPolicy);

export default router;
/**
 * @route POST /api/admin/calendarific/sync-with-template/:templateId
 * @desc Sync holidays using a holiday selection template
 * @access HR, HR_Manager, SuperAdmin
 */
router.post('/sync-with-template/:templateId', [
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
    .withMessage('dryRun must be a boolean')
], syncWithTemplate);