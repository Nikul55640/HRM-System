import express from 'express';

// Import all employee routes (8 core modules only)
import dashboardRoutes from './dashboard.routes.js';
import profileRoutes from './profile.routes.js';
import bankDetailsRoutes from './bankDetails.routes.js';
import leaveRoutes from './leave.routes.js';
import attendanceRoutes from './attendance.routes.js';
import notificationsRoutes from './notifications.routes.js';
import shiftRoutes from './shift.routes.js';
import calendarRoutes from './employeeCalendar.routes.js';
import payslipsRoutes from './payslips.routes.js';

const router = express.Router();

// Mount routes
router.use('/', dashboardRoutes);
router.use('/', profileRoutes);
router.use('/', bankDetailsRoutes);
router.use('/', leaveRoutes);
router.use('/', attendanceRoutes);
router.use('/shifts', shiftRoutes);
router.use('/calendar', calendarRoutes);
router.use('/', notificationsRoutes);
router.use('/', payslipsRoutes);

export default router;
