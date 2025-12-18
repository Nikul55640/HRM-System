import express from 'express';

// Import all employee routes
import dashboardRoutes from './dashboard.routes.js';
import profileRoutes from './profile.routes.js';
import bankDetailsRoutes from './bankDetails.routes.js';
import payslipsRoutes from './payslips.routes.js';
import leaveRoutes from './leave.routes.js';
import attendanceRoutes from './attendance.routes.js';
import requestsRoutes from './requests.routes.js';
import notificationsRoutes from './notifications.routes.js';

const router = express.Router();

// Mount routes
router.use('/', dashboardRoutes);
router.use('/', profileRoutes);
router.use('/', bankDetailsRoutes);
router.use('/', payslipsRoutes);
router.use('/', leaveRoutes);
router.use('/', attendanceRoutes);
router.use('/', requestsRoutes);
router.use('/', notificationsRoutes);

export default router;
