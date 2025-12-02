import LeaveRequest from "../../models/LeaveRequest.js";
import LeaveBalance from "../../models/LeaveBalance.js";
import AuditLog from "../../models/AuditLog.js";
import logger from "../../utils/logger.js";
import Notification from "../../models/Notification.js";
import User from "../../models/User.js";

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
  const leaveTypes = VALID_LEAVE_TYPES.map((type) => ({
    type,
    allocated: DEFAULT_ALLOCATIONS[type],
    used: 0,
    pending: 0,
  }));

  const newBalance = new LeaveBalance({
    employeeId,
    year,
    leaveTypes,
  });

  await newBalance.save();
  return newBalance;
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
    let days = 1;
    if (isHalfDay && start.getTime() === end.getTime()) {
      days = 0.5;
    } else {
      const diff = end.getTime() - start.getTime();
      days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    }

    // Get Leave Balance based on start year
    const year = start.getFullYear();
    let leaveBalance = await LeaveBalance.findByEmployeeAndYear(
      employeeId,
      year
    );

    if (!leaveBalance) {
      leaveBalance = await createDefaultLeaveBalance(employeeId, year);
    }

    const balanceType = leaveBalance.leaveTypes.find((lt) => lt.type === type);

    if (!balanceType) {
      return res.status(400).json({
        success: false,
        message: `Leave type '${type}' does not exist in your balance.`,
      });
    }

    // Balance Check (except unpaid)
    if (type !== "unpaid" && balanceType.available < days) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${type} leave balance. Available: ${balanceType.available}, Requested: ${days}`,
      });
    }

    // Create Request
    const leaveRequest = new LeaveRequest({
      employeeId,
      type,
      startDate: start,
      endDate: end,
      days,
      reason,
      isHalfDay: isHalfDay || false,
      halfDayPeriod: isHalfDay ? halfDayPeriod : null,
      attachments,
      status: "pending",
      appliedAt: new Date(),
    });

    await leaveRequest.save();

    // Update Pending Balance
    balanceType.pending += days;
    await leaveBalance.save();

    // Add to History
    leaveBalance.history.push({
      leaveRequestId: leaveRequest._id,
      type,
      startDate: start,
      endDate: end,
      days,
      status: "pending",
      appliedAt: new Date(),
    });
    await leaveBalance.save();

    // Notify Employee
    await Notification.create({
      userId: userId,
      type: "leave_request",
      title: "Leave Request Submitted",
      message: `Your ${type} leave (${days} day) request has been submitted.`,
      priority: "medium",
      relatedEntity: {
        entityType: "LeaveRequest",
        entityId: leaveRequest._id,
      },
    });

    // Notify HR
    const hrUsers = await User.find({
      role: { $in: ["HRManager", "HRAdmin", "SuperAdmin"] },
      isActive: true,
    });

    for (const hr of hrUsers) {
      await Notification.create({
        userId: hr._id,
        type: "leave_approval_required",
        title: "Leave Request Pending Approval",
        message: `${fullName} submitted a ${type} leave (${days} days).`,
        priority: "high",
        relatedEntity: {
          entityType: "LeaveRequest",
          entityId: leaveRequest._id,
        },
      });
    }

    // Audit Log
    await AuditLog.logAction({
      action: "CREATE",
      entityType: "LeaveRequest",
      entityId: leaveRequest._id,
      performedByName: fullName,
      performedByEmail: email,
      userId,
      userRole: role,
      meta: {
        type,
        days,
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

    const q = { employeeId };

    if (status) q.status = status;
    if (year) {
      q.startDate = {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31, 23, 59, 59),
      };
    }

    const skip = (page - 1) * limit;

    const [total, requests] = await Promise.all([
      LeaveRequest.countDocuments(q),
      LeaveRequest.find(q)
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
    ]);

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
      _id: req.params.id,
      employeeId,
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
      _id: req.params.id,
      employeeId,
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

    leaveRequest.status = "cancelled";
    leaveRequest.cancelledAt = new Date();
    await leaveRequest.save();

    // Restore leave balance
    const year = leaveRequest.startDate.getFullYear();
    const leaveBalance = await LeaveBalance.findByEmployeeAndYear(
      employeeId,
      year
    );

    if (leaveBalance) {
      const bal = leaveBalance.leaveTypes.find(
        (lt) => lt.type === leaveRequest.type
      );

      if (bal) {
        bal.pending -= leaveRequest.days;
        if (bal.pending < 0) bal.pending = 0;
      }

      const history = leaveBalance.history.find(
        (h) =>
          h.leaveRequestId &&
          h.leaveRequestId.toString() === leaveRequest._id.toString()
      );

      if (history) history.status = "cancelled";

      await leaveBalance.save();
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
