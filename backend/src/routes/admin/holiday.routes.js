import express from 'express';
import {
  getHolidays,
  getHolidayById,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  toggleHolidayStatus,
  getHolidaysForCalendar,
  getUpcomingHolidays,
  checkHoliday
} from '../../controllers/admin/holiday.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { checkPermission } from '../../middleware/checkPermission.js';
import { MODULES } from '../../config/rolePermissions.js';
import { validateHoliday } from '../../validators/holidayValidator.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Public routes (accessible by all authenticated users)
router.get('/calendar', getHolidaysForCalendar);
router.get('/upcoming', getUpcomingHolidays);
router.get('/check/:date', checkHoliday);

// Admin routes - require holiday management permissions
router.get('/', checkPermission(MODULES.SYSTEM.MANAGE_CONFIG), getHolidays);
router.get('/:id', checkPermission(MODULES.SYSTEM.MANAGE_CONFIG), getHolidayById);
router.post('/', checkPermission(MODULES.SYSTEM.MANAGE_CONFIG), validateHoliday, createHoliday);
router.put('/:id', checkPermission(MODULES.SYSTEM.MANAGE_CONFIG), validateHoliday, updateHoliday);
router.patch('/:id/toggle-status', checkPermission(MODULES.SYSTEM.MANAGE_CONFIG), toggleHolidayStatus);
router.delete('/:id', checkPermission(MODULES.SYSTEM.MANAGE_CONFIG), deleteHoliday);

export default router;