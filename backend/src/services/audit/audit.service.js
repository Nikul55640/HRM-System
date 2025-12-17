import { AuditLog } from "../../models/sequelize/index.js";
import logger from "../../utils/logger.js";

/* -------------------------------------------------------
 * SAFE DISPLAY NAME
 * ----------------------------------------------------- */
const getDisplayName = (employee) => {
  if (!employee) return "Unknown Employee";
  return (
    `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
    "Unknown Employee"
  );
};

/* -------------------------------------------------------
 * BASE AUDIT LOGGER (INTERNAL)
 * ----------------------------------------------------- */
const logAction = async (payload) => {
  try {
    return await AuditLog.create(payload);
  } catch (error) {
    logger.error("AuditLog Error:", error);
    return null;
  }
};

/* -------------------------------------------------------
 * 1️⃣ EMPLOYEE CREATED
 * ----------------------------------------------------- */
const logEmployeeCreation = async (employee, user, meta = {}) => {
  return logAction({
    action: "CREATE",
    severity: "info",
    entityType: "Employee",
    entityId: employee?.id,
    entityDisplayName: getDisplayName(employee),

    userId: user?.id,
    userRole: user?.role,
    performedByName: user?.fullName || user?.name || "Unknown User",
    performedByEmail: user?.email,

    changes: [
      {
        field: "employee",
        oldValue: null,
        newValue: {
          name: getDisplayName(employee),
          email: employee?.email,
          jobTitle: employee?.jobTitle,
          status: employee?.status,
        },
      },
    ],

    meta: {
      employeeCode: employee?.employeeId,
      departmentId: employee?.departmentId || null,
    },

    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
};

/* -------------------------------------------------------
 * 2️⃣ EMPLOYEE UPDATED
 * ----------------------------------------------------- */
const logEmployeeUpdate = async (employee, changes = [], user, meta = {}) => {
  if (!changes.length) return null;

  return logAction({
    action: "UPDATE",
    severity: "warning",
    entityType: "Employee",
    entityId: employee?.id,
    entityDisplayName: getDisplayName(employee),

    userId: user?.id,
    userRole: user?.role,
    performedByName: user?.fullName || user?.name || "Unknown User",
    performedByEmail: user?.email,

    changes,

    meta: {
      employeeCode: employee?.employeeId,
      changedFields: changes.map((c) => c.field),
    },

    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
};

/* -------------------------------------------------------
 * 3️⃣ EMPLOYEE TERMINATED
 * ----------------------------------------------------- */
const logEmployeeTermination = async (employee, user, meta = {}) => {
  return logAction({
    action: "DELETE",
    severity: "critical",
    entityType: "Employee",
    entityId: employee?.id,
    entityDisplayName: getDisplayName(employee),

    userId: user?.id,
    userRole: user?.role,
    performedByName: user?.fullName || user?.name || "Unknown User",
    performedByEmail: user?.email,

    changes: [
      {
        field: "status",
        oldValue: employee?.status,
        newValue: "Terminated",
      },
    ],

    meta: {
      employeeCode: employee?.employeeId,
      terminatedAt: new Date(),
    },

    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
};

/* -------------------------------------------------------
 * 4️⃣ EMPLOYEE PROFILE VIEWED
 * ----------------------------------------------------- */
const logEmployeeView = async (employee, user, meta = {}) => {
  return logAction({
    action: "VIEW",
    severity: "info",
    entityType: "Employee",
    entityId: employee?.id,
    entityDisplayName: getDisplayName(employee),

    userId: user?.id,
    userRole: user?.role,
    performedByName: user?.fullName || user?.name || "Unknown User",
    performedByEmail: user?.email,

    meta: {
      viewedEmployeeCode: employee?.employeeId,
    },

    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
};

/* -------------------------------------------------------
 * 5️⃣ GENERIC HELPERS (REUSABLE)
 * ----------------------------------------------------- */
const logCustomAction = async ({
  action,
  severity = "info",
  entityType,
  entityId,
  entityDisplayName,
  user,
  changes = [],
  meta = {},
  request,
}) => {
  return logAction({
    action,
    severity,
    entityType,
    entityId,
    entityDisplayName,

    userId: user?.id,
    userRole: user?.role,
    performedByName: user?.fullName || user?.name,
    performedByEmail: user?.email,

    changes,
    meta,

    ipAddress: request?.ip,
    userAgent: request?.get?.("User-Agent"),
  });
};

/* -------------------------------------------------------
 * EXPORT
 * ----------------------------------------------------- */
export default {
  logEmployeeCreation,
  logEmployeeUpdate,
  logEmployeeTermination,
  logEmployeeView,
  logCustomAction,
};
