import { LeaveRequest, LeaveBalance, AuditLog, User } from "../../models/sequelize/index.js";
import { Op } from "sequelize";
import logger from "../../utils/logger.js";

/* ----------------------------------------------
   SIMPLIFIED LEAVE TYPES (Matches Model Enum)
---------------------------------------------- */
const VALID_LEAVE_TYPES = ['Casual', 'Sick', 'Paid'];

/* ----------------------------------------------
   Default allocations per type
---------------------------------------------- */
const DEFAULT_ALLOCATIONS = {
  Casual: 12,
  Sick: 10,
  Paid: 20
};

/* ----------------------------------------------
   Helper: Create LeaveBalance for new employee
---------------------------------------------- */
const createDefaultLeaveBalance = async (employeeId, year) => {
  const balances = [];

  for (const type of VALID_LEAVE_TYPES) {
    const balance = await LeaveBalance.create({
      employeeId,
      year,
      leaveType: type,
      allocated: DEFAULT_ALLOCATIONS[type],
      used: 0,
      pending: 0,
      remaining: DEFAULT_ALLOCATIONS[type],
    });
    balances.push(balance);
  }

  return balances;
};

/* ----------------------------------------------
   1️⃣ Create Leave Request
---------------------------------------------- */
const createLeaveRequest = async (req, res) => {
  try {
    const { employeeId, id: userId, fullName, email, role } = req.user;
    const {
      type,
      startDate,
      endDate,
      reason,
      isHalfDay,
      halfDayPeriod,
      attachments = [],
    } = req.body;

    // Validate
    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "Type, start date, end date, and reason are required.",
      });
    }

    if (!VALID_LEAVE_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid leave type. Allowed: ${VALID_LEAVE_TYPES.join(", ")}`,
      });
    }

    // Dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Allow retroactive leave applications - removed past date validation
    // Companies often need to allow employees to apply for leave they forgot to request

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date.",
      });
    }

    // Days calculation
    let totalDays = 1;
    if (isHalfDay && start.getTime() === end.getTime()) {
      totalDays = 0.5;
    } else {
      const diff = end.getTime() - start.getTime();
      totalDays = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    }

    // Get Leave Balance based on start year
    const year = start.getFullYear();
    let leaveBalance = await LeaveBalance.findOne({
      where: {
        employeeId,
        year,
        leaveType: type,
      },
    });

    if (!leaveBalance) {
      await createDefaultLeaveBalance(employeeId, year);
      leaveBalance = await LeaveBalance.findOne({
        where: {
          employeeId,
          year,
          leaveType: type,
        },
      });
    }

    if (!leaveBalance) {
      return res.status(400).json({
        success: false,
        message: `Leave type '${type}' does not exist in your balance.`,
      });
    }

    // Balance Check (except unpaid)
    if (type !== "unpaid" && leaveBalance.remaining < totalDays) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${type} leave balance. Available: ${leaveBalance.remaining}, Requested: ${totalDays}`,
      });
    }

    // Check if this is a retroactive leave application
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isRetroactive = start < today;

    // Create Request
    const leaveRequest = await LeaveRequest.create({
      employeeId,
      leaveType: type,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
      isHalfDay: isHalfDay || false,
      halfDayPeriod: isHalfDay ? halfDayPeriod : null,
      documents: attachments || [],
      status: "pending",
    });

    // Update Pending Balance
    await leaveBalance.update({
      pending: leaveBalance.pending + totalDays,
      remaining: leaveBalance.remaining - totalDays,
    });

    // 🔔 Send notifications
    try {
      // Import notification service
      const notificationService = (await import('../../services/notificationService.js')).default;
      
      // 1. Notify the employee that their request was submitted
      await notificationService.sendToUser(userId, {
        title: 'Leave Request Submitted ✅',
        message: `Your ${type} leave request for ${totalDays} day${totalDays > 1 ? 's' : ''} from ${start.toLocaleDateString()} to ${end.toLocaleDateString()} has been submitted and is pending approval.`,
        type: 'info',
        category: 'leave',
        metadata: {
          leaveRequestId: leaveRequest.id,
          leaveType: type,
          startDate: start,
          endDate: end,
          totalDays,
          isRetroactive
        }
      });

      // 2. Notify HR and SuperAdmin about new leave request
      // Support both old and new role formats for backward compatibility
      const adminRoles = ['HR', 'SuperAdmin', 'HR_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'];
      await notificationService.sendToRoles(adminRoles, {
        title: 'New Leave Request 📋',
        message: `${fullName} has submitted a ${type} leave request for ${totalDays} day${totalDays > 1 ? 's' : ''} from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}.${isRetroactive ? ' (Retroactive)' : ''}`,
        type: 'info',
        category: 'leave',
        metadata: {
          leaveRequestId: leaveRequest.id,
          employeeId,
          employeeName: fullName,
          leaveType: type,
          startDate: start,
          endDate: end,
          totalDays,
          isRetroactive,
          reason: reason.substring(0, 100) // Truncate reason for notification
        }
      });

      logger.info(`Leave request notifications sent for employee ${employeeId}: ${type} leave for ${totalDays} days`);
    } catch (notificationError) {
      logger.error("Failed to send leave request notifications:", notificationError);
      // Don't fail the main operation if notification fails
    }

    // Audit Log
    await AuditLog.create({
      userId,
      action: "leave_apply",
      module: "leave",
      description: `Employee ${fullName} submitted ${type} leave request for ${totalDays} days from ${startDate} to ${endDate}`,
      targetType: "LeaveRequest",
      targetId: leaveRequest.id,
      newValues: {
        type,
        totalDays,
        startDate,
        endDate,
        isHalfDay,
        isRetroactive, // Track retroactive applications
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      severity: "low",
      isSuccessful: true,
    });

    return res.status(201).json({
      success: true,
      data: leaveRequest,
      message: "Leave request submitted successfully.",
    });
  } catch (error) {
    logger.error("Error creating leave request:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating leave request.",
      error: error.message,
    });
  }
};

/* ----------------------------------------------
   2️⃣ Get All Employee Leave Requests
---------------------------------------------- */
const getLeaveRequests = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const { status, year, page = 1, limit = 10 } = req.query;

    const where = { employeeId };

    if (status) where.status = status;
    if (year) {
      where.startDate = {
        [Op.gte]: new Date(year, 0, 1),
        [Op.lte]: new Date(year, 11, 31, 23, 59, 59),
      };
    }

    const offset = (page - 1) * limit;

    const { count: total, rows: requests } = await LeaveRequest.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: parseInt(offset),
      limit: parseInt(limit),
    });

    return res.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    logger.error("Error fetching leave requests:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching leave requests.",
      error: err.message,
    });
  }
};

/* ----------------------------------------------
   3️⃣ Get Single Leave Request
---------------------------------------------- */
const getLeaveRequest = async (req, res) => {
  try {
    const { employeeId } = req.user;

    const leave = await LeaveRequest.findOne({
      where: {
        id: req.params.id,
        employeeId,
      },
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found.",
      });
    }

    return res.json({ success: true, data: leave });
  } catch (err) {
    logger.error("Error fetching leave request:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching leave request.",
      error: err.message,
    });
  }
};

/* ----------------------------------------------
   4️⃣ Cancel Leave Request
---------------------------------------------- */
const cancelLeaveRequest = async (req, res) => {
  try {
    const { employeeId } = req.user;

    const leaveRequest = await LeaveRequest.findOne({
      where: {
        id: req.params.id,
        employeeId,
      },
    });

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found.",
      });
    }

    if (leaveRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending leave requests can be cancelled.",
      });
    }

    await leaveRequest.update({
      status: "cancelled",
      cancelledAt: new Date(),
      updatedBy: employeeId,
    });

    // Restore leave balance
    const year = leaveRequest.startDate.getFullYear();
    const leaveBalance = await LeaveBalance.findOne({
      where: {
        employeeId,
        year,
        leaveType: leaveRequest.leaveType,
      },
    });

    if (leaveBalance) {
      await leaveBalance.update({
        pending: Math.max(0, leaveBalance.pending - leaveRequest.totalDays),
        remaining: leaveBalance.remaining + leaveRequest.totalDays,
      });
    }

    // 🔔 Send notifications about cancellation
    try {
      // Import notification service
      const notificationService = (await import('../../services/notificationService.js')).default;
      
      // 1. Notify the employee that their request was cancelled
      await notificationService.sendToUser(req.user.id, {
        title: 'Leave Request Cancelled ❌',
        message: `Your ${leaveRequest.leaveType} leave request for ${leaveRequest.totalDays} day${leaveRequest.totalDays > 1 ? 's' : ''} from ${leaveRequest.startDate.toLocaleDateString()} to ${leaveRequest.endDate.toLocaleDateString()} has been cancelled.`,
        type: 'warning',
        category: 'leave',
        metadata: {
          leaveRequestId: leaveRequest.id,
          leaveType: leaveRequest.leaveType,
          startDate: leaveRequest.startDate,
          endDate: leaveRequest.endDate,
          totalDays: leaveRequest.totalDays,
          cancelledBy: req.user.fullName
        }
      });

      // 2. Notify HR and SuperAdmin about cancellation
      const adminRoles = ['HR', 'SuperAdmin', 'HR_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'];
      await notificationService.sendToRoles(adminRoles, {
        title: 'Leave Request Cancelled 📋',
        message: `${req.user.fullName || 'Employee'} has cancelled their ${leaveRequest.leaveType} leave request for ${leaveRequest.totalDays} day${leaveRequest.totalDays > 1 ? 's' : ''} from ${leaveRequest.startDate.toLocaleDateString()} to ${leaveRequest.endDate.toLocaleDateString()}.`,
        type: 'info',
        category: 'leave',
        metadata: {
          leaveRequestId: leaveRequest.id,
          employeeId,
          employeeName: req.user.fullName,
          leaveType: leaveRequest.leaveType,
          startDate: leaveRequest.startDate,
          endDate: leaveRequest.endDate,
          totalDays: leaveRequest.totalDays
        }
      });

      logger.info(`Leave request cancellation notifications sent for employee ${employeeId}`);
    } catch (notificationError) {
      logger.error("Failed to send leave cancellation notifications:", notificationError);
      // Don't fail the main operation if notification fails
    }

    // Audit Log for cancellation
    await AuditLog.create({
      userId: req.user.id,
      action: "leave_cancel",
      module: "leave",
      description: `Employee ${req.user.fullName || 'Unknown'} cancelled ${leaveRequest.leaveType} leave request for ${leaveRequest.totalDays} days`,
      targetType: "LeaveRequest",
      targetId: leaveRequest.id,
      oldValues: {
        status: "pending",
      },
      newValues: {
        status: "cancelled",
        totalDays: leaveRequest.totalDays,
        leaveType: leaveRequest.leaveType,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      severity: "low",
      isSuccessful: true,
    });

    return res.json({
      success: true,
      data: leaveRequest,
      message: "Leave request cancelled successfully.",
    });
  } catch (err) {
    logger.error("Error cancelling leave request:", err);
    return res.status(500).json({
      success: false,
      message: "Error cancelling leave request.",
      error: err.message,
    });
  }
};

export default {
  createLeaveRequest,
  getLeaveRequests,
  getLeaveRequest,
  cancelLeaveRequest,
};
