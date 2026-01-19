import express from 'express';

// Import all employee routes (8 core modules only)
import dashboardRoutes from './dashboard.routes.js';
import profileRoutes from './profile.routes.js';
import emergencyContactsRoutes from './emergencyContacts.routes.js';
import bankDetailsRoutes from './bankDetails.routes.js';
import leaveRoutes from './leave.routes.js';
import attendanceRoutes from './attendance.routes.js';
import attendanceCorrectionRequestsRoutes from './attendanceCorrectionRequests.routes.js';
import notificationsRoutes from './notifications.routes.js';
import shiftRoutes from './shift.routes.js';
import calendarRoutes from './employeeCalendar.routes.js';
import payslipsRoutes from './payslips.routes.js';
import recentActivityRoutes from './recentActivity.routes.js';
import companyStatusRoutes from './companyStatus.routes.js'; // ✅ NEW: Employee-safe company status

const router = express.Router();

// Mount routes
router.use('/', dashboardRoutes);
router.use('/profile', profileRoutes);
router.use('/emergency-contacts', emergencyContactsRoutes);
router.use('/', bankDetailsRoutes);
router.use('/', leaveRoutes);
router.use('/', attendanceRoutes);
router.use('/', attendanceCorrectionRequestsRoutes);
router.use('/shifts', shiftRoutes);
router.use('/calendar', calendarRoutes);
router.use('/', notificationsRoutes);
router.use('/', payslipsRoutes);
router.use('/recent-activities', recentActivityRoutes);
router.use('/company', companyStatusRoutes); // ✅ NEW: /employee/company/* endpoints

export default router;
