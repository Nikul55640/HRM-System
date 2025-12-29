import { AuditLog } from "../../models/sequelize/index.js";
import logger from "../../utils/logger.js";
import IPService from "../IP.service.js";

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
    // Encrypt IP address if present
    if (payload.ipAddress && payload.ipAddress !== "unavailable") {
      payload.ipAddress = IPService.encryptIP(payload.ipAddress);
    }
    
    // Use the model's logAction method directly
    return await AuditLog.logAction(payload);
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
    userId: user?.id,
    action: "employee_create",
    module: "employee",
    targetType: "Employee",
    targetId: employee?.id,
    oldValues: null,
    newValues: {
      name: getDisplayName(employee),
      email: employee?.email,
      jobTitle: employee?.jobTitle,
      status: employee?.status,
    },
    description: `Employee ${getDisplayName(employee)} created`,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    severity: "low",
    metadata: {
      employeeCode: employee?.employeeId,
      departmentId: employee?.departmentId || null,
      performedByName: user?.fullName || user?.name || "Unknown User",
      performedByEmail: user?.email,
    },
  });
};

/* -------------------------------------------------------
 * 2️⃣ EMPLOYEE UPDATED
 * ----------------------------------------------------- */
const logEmployeeUpdate = async (employee, changes = [], user, meta = {}) => {
  if (!changes.length) return null;

  const oldValues = {};
  const newValues = {};
  
  changes.forEach(change => {
    oldValues[change.field] = change.oldValue;
    newValues[change.field] = change.newValue;
  });

  return logAction({
    userId: user?.id,
    action: "employee_update",
    module: "employee",
    targetType: "Employee",
    targetId: employee?.id,
    oldValues,
    newValues,
    description: `Employee ${getDisplayName(employee)} updated`,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    severity: "medium",
    metadata: {
      employeeCode: employee?.employeeId,
      changedFields: changes.map((c) => c.field),
      performedByName: user?.fullName || user?.name || "Unknown User",
      performedByEmail: user?.email,
    },
  });
};

/* -------------------------------------------------------
 * 3️⃣ EMPLOYEE TERMINATED
 * ----------------------------------------------------- */
const logEmployeeTermination = async (employee, user, meta = {}) => {
  return logAction({
    userId: user?.id,
    action: "employee_delete",
    module: "employee",
    targetType: "Employee",
    targetId: employee?.id,
    oldValues: { status: employee?.status },
    newValues: { status: "Terminated" },
    description: `Employee ${getDisplayName(employee)} terminated`,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    severity: "critical",
    metadata: {
      employeeCode: employee?.employeeId,
      terminatedAt: new Date(),
      performedByName: user?.fullName || user?.name || "Unknown User",
      performedByEmail: user?.email,
    },
  });
};

/* -------------------------------------------------------
 * 4️⃣ EMPLOYEE PROFILE VIEWED
 * ----------------------------------------------------- */
const logEmployeeView = async (employee, user, meta = {}) => {
  return logAction({
    userId: user?.id,
    action: "profile_update", // Using existing enum value
    module: "employee",
    targetType: "Employee",
    targetId: employee?.id,
    description: `Employee ${getDisplayName(employee)} profile viewed`,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    severity: "low",
    metadata: {
      viewedEmployeeCode: employee?.employeeId,
      performedByName: user?.fullName || user?.name || "Unknown User",
      performedByEmail: user?.email,
    },
  });
};

/* -------------------------------------------------------
 * 5️⃣ GENERIC HELPERS (REUSABLE)
 * ----------------------------------------------------- */
const logCustomAction = async ({
  action,
  module = "system",
  severity = "low",
  targetType,
  targetId,
  user,
  oldValues = null,
  newValues = null,
  description,
  metadata = {},
  request,
}) => {
  return logAction({
    userId: user?.id,
    action,
    module,
    targetType,
    targetId,
    oldValues,
    newValues,
    description,
    ipAddress: request?.ip,
    userAgent: request?.get?.("User-Agent"),
    severity,
    metadata: {
      ...metadata,
      performedByName: user?.fullName || user?.name,
      performedByEmail: user?.email,
    },
  });
};

/* -------------------------------------------------------
 * 6️⃣ GET AUDIT LOGS WITH PAGINATION
 * ----------------------------------------------------- */
const getAuditLogs = async (query = {}) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      targetType,
      userId,
      severity,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (action) where.action = action;
    if (targetType) where.targetType = targetType;
    if (userId) where.userId = userId;
    if (severity) where.severity = severity;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[AuditLog.sequelize.Sequelize.Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[AuditLog.sequelize.Sequelize.Op.lte] = new Date(endDate);
    }

    const { count: total, rows: logs } = await AuditLog.findAndCountAll({
      where,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          association: 'user',
          attributes: ['id', 'name', 'email', 'role'],
          required: false
        }
      ]
    });

    // Generate summary
    const summary = {
      totalLogs: total,
      actionBreakdown: await AuditLog.findAll({
        where,
        attributes: [
          'action',
          [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('action')), 'count']
        ],
        group: ['action'],
        raw: true
      }),
      severityBreakdown: await AuditLog.findAll({
        where,
        attributes: [
          'severity',
          [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('severity')), 'count']
        ],
        group: ['severity'],
        raw: true
      })
    };

    return { logs, total, summary };
  } catch (error) {
    logger.error("Error fetching audit logs:", error);
    throw error;
  }
};

/* -------------------------------------------------------
 * 7️⃣ GET AUDIT LOG BY ID
 * ----------------------------------------------------- */
const getAuditLogById = async (id) => {
  try {
    const log = await AuditLog.findByPk(id, {
      include: [
        {
          association: 'user',
          attributes: ['id', 'name', 'email', 'role'],
          required: false
        }
      ]
    });

    return log;
  } catch (error) {
    logger.error("Error fetching audit log by ID:", error);
    throw error;
  }
};

/* -------------------------------------------------------
 * 8️⃣ CLEANUP OLD AUDIT LOGS
 * ----------------------------------------------------- */
const cleanupAuditLogs = async (olderThanDays = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const deleted = await AuditLog.destroy({
      where: {
        createdAt: {
          [AuditLog.sequelize.Sequelize.Op.lt]: cutoffDate
        }
      }
    });

    logger.info(`Cleaned up ${deleted} audit logs older than ${olderThanDays} days`);
    return deleted;
  } catch (error) {
    logger.error("Error cleaning up audit logs:", error);
    throw error;
  }
};

/* -------------------------------------------------------
 * EXPORT
 * ----------------------------------------------------- */
export default {
  logAction,
  logEmployeeCreation,
  logEmployeeUpdate,
  logEmployeeTermination,
  logEmployeeView,
  logCustomAction,
  getAuditLogs,
  getAuditLogById,
  cleanupAuditLogs,
};
