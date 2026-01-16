import express from 'express';
import recentActivityController from '../../controllers/employee/recentActivity.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route GET /api/employee/recent-activities
 * @desc Get recent activities for the authenticated employee
 * @access Private (Employee)
 * @query {number} limit - Number of activities to return (default: 10)
 * @query {number} days - Number of days to look back (default: 7)
 * @query {string} types - Comma-separated list of activity types to filter
 */
router.get('/', recentActivityController.getMyRecentActivities);

/**
 * @route GET /api/employee/recent-activities/stats
 * @desc Get activity statistics for the authenticated employee
 * @access Private (Employee)
 * @query {number} days - Number of days to look back (default: 7)
 */
router.get('/stats', recentActivityController.getActivityStats);

export default router;