import mongoose from "mongoose";

const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        // Authentication
        "LOGIN",
        "LOGOUT",
        "PASSWORD_CHANGE",
        "PASSWORD_RESET",

        // CRUD Core
        "CREATE",
        "UPDATE",
        "DELETE",
        "VIEW",

        // Employee Management
        "EMPLOYEE_CREATE",
        "EMPLOYEE_UPDATE",
        "EMPLOYEE_DELETE",
        "EMPLOYEE_VIEW",

        // Payroll & Payslips
        "PAYSLIP_VIEW",
        "PAYSLIP_DOWNLOAD",
        "PAYSLIP_ACCESS_DENIED",
        "PAYROLL_GENERATE",
        "PAYROLL_UPDATE",
        "PAYROLL_DELETE",

        // Leave Management
        "LEAVE_APPLY",
        "LEAVE_APPROVE",
        "LEAVE_REJECT",
        "LEAVE_CANCEL",
        "LEAVE_VIEW",

        // Attendance Module
        "ATTENDANCE_VIEW",
        "ATTENDANCE_UPDATE",
        "ATTENDANCE_CORRECTION",

        // Department / Org
        "DEPARTMENT_CREATE",
        "DEPARTMENT_UPDATE",
        "DEPARTMENT_DELETE",

        // Documents
        "DOCUMENT_UPLOAD",
        "DOCUMENT_DELETE",
        "DOCUMENT_VIEW",

        // System Config
        "CONFIG_UPDATE",

        // Calendar / Events
        "EVENT_CREATE",
        "EVENT_UPDATE",
        "EVENT_DELETE",
        "EVENT_VIEW",
      ],
      index: true,
    },

    // Affected module/entity
    entityType: {
      type: String,
      required: true,
      enum: [
        "User",
        "Employee",
        "Department",
        "Document",
        "Config",
        "Payroll",
        "Payslip",
        "LeaveRequest",
        "Attendance",
        "Event",
        "Calendar",
      ],
      index: true,
    },

    // Entity ID
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // Human-readable display name
    entityDisplayName: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    // Severity
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
    },

    // User performing the action
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    userRole: {
      type: String,
      enum: ["SuperAdmin", "HR Manager", "HR Administrator", "Employee"],
    },

    // Cached user info
    performedByName: {
      type: String,
      trim: true,
    },

    performedByEmail: {
      type: String,
      trim: true,
    },

    // Change logs
    changes: [
      {
        field: { type: String },
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
      },
    ],

    ipAddress: {
      type: String,
      trim: true,
      maxlength: 45,
    },

    userAgent: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Extra metadata
    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: "auditlogs",
  }
);

// -------------------------------
// INDEXES
// -------------------------------
auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ timestamp: -1 });

// TTL: Auto-delete logs after 7 years
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 220838400 });

// -------------------------------
// STATIC METHODS
// -------------------------------
auditLogSchema.statics.logAction = async function (logData) {
  const {
    action,
    entityType,
    entityId,
    entityDisplayName,
    userId,
    userRole,
    performedByName,
    performedByEmail,
    changes = [],
    ipAddress,
    userAgent,
    meta = {},
    severity = "info",
  } = logData;

  return this.create({
    action,
    entityType,
    entityId,
    entityDisplayName,
    userId,
    userRole,
    performedByName,
    performedByEmail,
    changes,
    ipAddress,
    userAgent,
    meta,
    severity,
    timestamp: new Date(),
  });
};

auditLogSchema.statics.getEntityLogs = function (
  entityType,
  entityId,
  options = {}
) {
  const { limit = 50, skip = 0, action } = options;

  const query = { entityType, entityId };
  if (action) query.action = action;

  return this.find(query)
    .populate("userId", "email role")
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip);
};

auditLogSchema.statics.getUserLogs = function (userId, options = {}) {
  const { limit = 50, skip = 0, action, entityType } = options;

  const query = { userId };
  if (action) query.action = action;
  if (entityType) query.entityType = entityType;

  return this.find(query).sort({ timestamp: -1 }).limit(limit).skip(skip);
};

auditLogSchema.statics.getLogsByDateRange = function (
  startDate,
  endDate,
  options = {}
) {
  const { limit = 100, skip = 0, action, entityType, userId } = options;

  const query = {
    timestamp: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  if (action) query.action = action;
  if (entityType) query.entityType = entityType;
  if (userId) query.userId = userId;

  return this.find(query)
    .populate("userId", "email role")
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip);
};

// -------------------------------
// INSTANCE METHOD
// -------------------------------
auditLogSchema.methods.formatForDisplay = function () {
  return {
    id: this._id,
    action: this.action,
    severity: this.severity,
    entityType: this.entityType,
    entityId: this.entityId,
    entityDisplayName: this.entityDisplayName,
    performedBy: {
      userId: this.userId,
      email: this.performedByEmail,
      name: this.performedByName,
      role: this.userRole,
    },
    changes: this.changes,
    timestamp: this.timestamp,
    meta: this.meta,
    ipAddress: this.ipAddress,
    userAgent: this.userAgent,
  };
};

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
