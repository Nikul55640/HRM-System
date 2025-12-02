import express from 'express';

// Import all employee routes
import profileRoutes from './profile.js';
import bankDetailsRoutes from './bankDetails.js';
import payslipsRoutes from './payslips.js';
import leaveRoutes from './leave.js';
import attendanceRoutes from './attendance.js';
import requestsRoutes from './requests.js';
import notificationsRoutes from './notifications.js';

const router = express.Router();

// Mount routes
router.use('/', profileRoutes);
router.use('/', bankDetailsRoutes);
router.use('/', payslipsRoutes);
router.use('/', leaveRoutes);
router.use('/', attendanceRoutes);
router.use('/', requestsRoutes);
router.use('/', notificationsRoutes);

export default router;
