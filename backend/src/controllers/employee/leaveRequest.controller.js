import { LeaveRequest, LeaveBalance, AuditLog, Notification, User } from "../../models/sequelize/index.js";
import { Op } from "sequelize";
import logger from "../../utils/logger.js";

/* ----------------------------------------------
   FINAL VALID LEAVE TYPES (Matches Admin Logic)
---------------------------------------------- */
const VALID_LEAVE_TYPES = [
  "annual",
  "sick",
  "personal",
  "maternity",
  "paternity",
  "emergency",
  "unpaid",
];

/* ----------------------------------------------
   Allocate defaults per type (1:1 with real HR)
---------------------------------------------- */
const DEFAULT_ALLOCATIONS = {
  annual: 20,
  sick: 10,
  personal: 5,
  emergency: 3,
  maternity: 90,
  paternity: 10,
  unpaid: 9999, // Unlimited
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
    const { employeeId, _id: userId, fullName, email, role } = req.user;
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        success: false,
        message: "Leave start date cannot be in the past.",
      });
    }

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

    // Notify Employee
    await Notification.create({
      userId: userId,
      type: "leave_request",
      title: "Leave Request Submitted",
      message: `Your ${type} leave (${totalDays} day) request has been submitted.`,
      priority: "medium",
      relatedEntity: {
        entityType: "LeaveRequest",
        entityId: leaveRequest.id,
      },
    });

    // Notify HR
    const hrUsers = await User.findAll({
      where: {
        role: ["HRManager", "HRAdmin", "SuperAdmin"],
        isActive: true,
      },
    });

    for (const hr of hrUsers) {
      await Notification.create({
        userId: hr.id,
        type: "leave_approval_required",
        title: "Leave Request Pending Approval",
        message: `${fullName} submitted a ${type} leave (${totalDays} days).`,
        priority: "high",
        relatedEntity: {
          entityType: "LeaveRequest",
          entityId: leaveRequest.id,
        },
      });
    }

    // Audit Log
    await AuditLog.create({
      action: "CREATE",
      entityType: "LeaveRequest",
      entityId: leaveRequest.id.toString(),
      userId,
      userRole: role,
      performedByName: fullName,
      performedByEmail: email,
      meta: {
        type,
        totalDays,
        startDate,
        endDate,
        isHalfDay,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
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
