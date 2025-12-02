import AuditLog from "../models/AuditLog.js";
import logger from "../utils/logger.js";

/* -------------------------------------------------------
 * SAFE DISPLAY NAME
 * ----------------------------------------------------- */
const getDisplayName = (employee) => {
  if (!employee?.personalInfo) return "Unknown Employee";
  const first = employee.personalInfo.firstName || "";
  const last = employee.personalInfo.lastName || "";
  return (first + " " + last).trim() || "Unknown Employee";
};

/* -------------------------------------------------------
 * 1️⃣ LOG: EMPLOYEE CREATED
 * ----------------------------------------------------- */
const logEmployeeCreation = async (employee, user, metadata = {}) => {
  try {
    return await AuditLog.logAction({
      action: "CREATE",
      severity: "info",
      entityType: "Employee",
      entityId: employee?._id,
      entityDisplayName: getDisplayName(employee),

      userId: user?.id,
      userRole: user?.role,
      performedByName: user?.fullName || user?.name || "Unknown User",
      performedByEmail: user?.email,

      meta: {
        employeeId: employee?.employeeId,
        jobTitle: employee?.jobInfo?.jobTitle || null,
        department: employee?.jobInfo?.department?.toString() || null,
      },

      changes: [
        {
          field: "employee",
          oldValue: null,
          newValue: {
            name: getDisplayName(employee),
            email: employee?.contactInfo?.email || null,
            jobTitle: employee?.jobInfo?.jobTitle || null,
            status: employee?.status,
          },
        },
      ],

      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  } catch (error) {
    logger.error("AuditLog Error (Employee Creation):", error);
  }
};

/* -------------------------------------------------------
 * 2️⃣ LOG: EMPLOYEE UPDATED
 * ----------------------------------------------------- */
const logEmployeeUpdate = async (employee, changes, user, metadata = {}) => {
  try {
    if (!Array.isArray(changes) || changes.length === 0) return null;

    return await AuditLog.logAction({
      action: "UPDATE",
      severity: "warning",
      entityType: "Employee",
      entityId: employee?._id,
      entityDisplayName: getDisplayName(employee),

      userId: user?.id,
      userRole: user?.role,
      performedByName: user?.fullName || user?.name || "Unknown User",
      performedByEmail: user?.email,

      changes,
      meta: {
        employeeId: employee?.employeeId,
        changedFields: changes.map((c) => c.field),
      },

      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  } catch (error) {
    logger.error("AuditLog Error (Employee Update):", error);
  }
};

/* -------------------------------------------------------
 * 3️⃣ LOG: EMPLOYEE TERMINATED
 * ----------------------------------------------------- */
const logEmployeeDeletion = async (employee, user, metadata = {}) => {
  try {
    return await AuditLog.logAction({
      action: "DELETE",
      severity: "critical",
      entityType: "Employee",
      entityId: employee?._id,
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
        employeeId: employee?.employeeId,
        deactivatedAt: new Date(),
      },

      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  } catch (error) {
    logger.error("AuditLog Error (Employee Termination):", error);
  }
};

/* -------------------------------------------------------
 * 4️⃣ LOG: EMPLOYEE PROFILE VIEWED
 * ----------------------------------------------------- */
const logEmployeeView = async (employee, user, metadata = {}) => {
  try {
    return await AuditLog.logAction({
      action: "VIEW",
      severity: "info",
      entityType: "Employee",
      entityId: employee?._id,
      entityDisplayName: getDisplayName(employee),

      userId: user?.id,
      userRole: user?.role,
      performedByName: user?.fullName || user?.name || "Unknown User",
      performedByEmail: user?.email,

      meta: {
        viewedEmployeeId: employee?.employeeId,
      },

      changes: [],

      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  } catch (error) {
    logger.debug("AuditLog Error (Employee View):", error);
    return null;
  }
};

/* -------------------------------------------------------
 * 5️⃣ GET EMPLOYEE LOGS
 * ----------------------------------------------------- */
const getEmployeeAuditLogs = async (employeeId, options = {}) => {
  try {
    return await AuditLog.getEntityLogs("Employee", employeeId, options);
  } catch (error) {
    logger.error("Error fetching employee audit logs:", error);
    throw error;
  }
};

/* -------------------------------------------------------
 * 6️⃣ GET RECENT EMPLOYEE LOGS
 * ----------------------------------------------------- */
const getRecentAuditLogs = async (options = {}) => {
  try {
    return await AuditLog.getRecentLogs({
      ...options,
      entityType: "Employee",
    });
  } catch (error) {
    logger.error("Error fetching recent employee logs:", error);
    throw error;
  }
};

/* -------------------------------------------------------
 * 7️⃣ GET LOGS BY DATE RANGE
 * ----------------------------------------------------- */
const getAuditLogsByDateRange = async (start, end, options = {}) => {
  try {
    return await AuditLog.getLogsByDateRange(start, end, {
      ...options,
      entityType: "Employee",
    });
  } catch (error) {
    logger.error("Error fetching employee logs (date range):", error);
    throw error;
  }
};

/* -------------------------------------------------------
 * 8️⃣ GET LOGS BY USER
 * ----------------------------------------------------- */
const getUserAuditLogs = async (userId, options = {}) => {
  try {
    return await AuditLog.getUserLogs(userId, {
      ...options,
      entityType: "Employee",
    });
  } catch (error) {
    logger.error("Error fetching employee logs by user:", error);
    throw error;
  }
};

/* -------------------------------------------------------
 * 9️⃣ COUNT EMPLOYEE LOGS
 * ----------------------------------------------------- */
const countAuditLogs = async (criteria = {}) => {
  try {
    return await AuditLog.countLogs({
      ...criteria,
      entityType: "Employee",
    });
  } catch (error) {
    logger.error("Error counting employee logs:", error);
    throw error;
  }
};

/* -------------------------------------------------------
 * EXPORT
 * ----------------------------------------------------- */
export default {
  logEmployeeCreation,
  logEmployeeUpdate,
  logEmployeeDeletion,
  logEmployeeView,
  getEmployeeAuditLogs,
  getRecentAuditLogs,
  getAuditLogsByDateRange,
  getUserAuditLogs,
}
