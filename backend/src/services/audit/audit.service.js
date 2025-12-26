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
 * 6️⃣ GET AUDIT LOGS WITH PAGINATION
 * ----------------------------------------------------- */
const getAuditLogs = async (query = {}) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      entityType,
      userId,
      severity,
      startDate,
      endDate,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = query;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;
    if (severity) where.severity = severity;
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[AuditLog.sequelize.Sequelize.Op.gte] = new Date(startDate);
      if (endDate) where.timestamp[AuditLog.sequelize.Sequelize.Op.lte] = new Date(endDate);
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
        timestamp: {
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
