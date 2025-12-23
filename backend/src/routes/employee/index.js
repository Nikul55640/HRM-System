import express from 'express';

// Import all employee routes (8 core modules only)
import dashboardRoutes from './dashboard.routes.js';
import profileRoutes from './profile.routes.js';
import bankDetailsRoutes from './bankDetails.routes.js';
import leaveRoutes from './leave.routes.js';
import attendanceRoutes from './attendance.routes.js';
import notificationsRoutes from './notifications.routes.js';

const router = express.Router();

// Mount routes
router.use('/', dashboardRoutes);
router.use('/', profileRoutes);
router.use('/', bankDetailsRoutes);
router.use('/', leaveRoutes);
router.use('/', attendanceRoutes);
router.use('/', notificationsRoutes);

export default router;
