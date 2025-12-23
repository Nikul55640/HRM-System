import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import config from "./config/index.js";
import errorHandler from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";

// ===================================================
// IMPORT ROUTES
// ===================================================

// Auth
import authRoutes from "./routes/auth.routes.js";

// Employees (Admin side)
import employeeRoutes from "./routes/admin/employee.routes.js";

// Employee Self Service (User side)
import employeeSelfServiceRoutes from "./routes/employee/index.js";

// Admin modules
import adminLeaveRoutes from "./routes/admin/leaveRequest.routes.js";
import adminLeaveTypeRoutes from "./routes/admin/leaveType.routes.js";
import adminHolidayRoutes from "./routes/admin/holiday.routes.js";
import adminDashboardRoutes from "./routes/admin/adminDashboard.routes.js";
import adminAttendanceRoutes from "./routes/admin/attendance.routes.js";
import attendanceCorrectionRoutes from "./routes/admin/attendanceCorrection.routes.js";
import leadRoutes from "./routes/admin/lead.routes.js";
import shiftRoutes from "./routes/admin/shift.routes.js";
import departmentRoutes from "./routes/admin/department.routes.js";
import auditLogRoutes from "./routes/admin/auditLog.routes.js";

// HRM Modules
import calendarRoutes from "./routes/calendar.routes.js";
import userRoutes from "./routes/user.routes.js";
import configRoutes from "./routes/config.routes.js";
import settingsRoutes from "./routes/settings.routes.js";

const app = express();

// ===================================================
// SECURITY MIDDLEWARE
// ===================================================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(hpp());

// ===================================================
// CORS
// ===================================================
app.use(cors(config.cors));

// ===================================================
// BODY PARSER
// ===================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ===================================================
// COMPRESSION
// ===================================================
app.use(compression());

// ===================================================
// RATE LIMITING
// ===================================================
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
// Disable rate limiting in development
if (process.env.NODE_ENV === "production") {
  app.use("/api", limiter);
} else {
  console.warn("⚠️ Rate limiting disabled in development mode");
}

// ===================================================
// LOGGER
// ===================================================
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ===================================================
// HEALTH CHECK
// ===================================================
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// ===================================================
// API ROUTES
// ===================================================

// ADMIN SECTION
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/leave", adminLeaveRoutes);
app.use("/api/admin/leave-types", adminLeaveTypeRoutes);
app.use("/api/admin/holidays", adminHolidayRoutes);
app.use("/api/admin/departments", departmentRoutes);
app.use("/api/admin/attendance", adminAttendanceRoutes);
app.use("/api/admin/attendance-corrections", attendanceCorrectionRoutes);
app.use("/api/admin/shifts", shiftRoutes);
app.use("/api/admin/leads", leadRoutes);
app.use("/api/admin/audit-logs", auditLogRoutes);

// AUTH SECTION
app.use("/api/auth", authRoutes);

// EMPLOYEE ADMIN ROUTES
app.use("/api/employees", employeeRoutes);

// EMPLOYEE SELF SERVICE (User side)
app.use("/api/employee", employeeSelfServiceRoutes);

// HRM CORE MODULES
app.use("/api/calendar", calendarRoutes);
app.use("/api/users", userRoutes);
app.use("/api/config", configRoutes);
app.use("/api", settingsRoutes);

// ===================================================
// 404 HANDLER
// ===================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Cannot ${req.method} ${req.originalUrl}`,
      suggestion: "Please check the API documentation for available endpoints",
      timestamp: new Date().toISOString(),
    },
  });
});

// ===================================================
// GLOBAL ERROR HANDLER
// ===================================================
app.use(errorHandler);

export default app;
