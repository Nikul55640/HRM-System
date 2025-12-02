import logger from "../../utils/logger.js";
import LeaveRequest from "../../models/LeaveRequest.js";
import LeaveBalance from "../../models/LeaveBalance.js";
import Notification from "../../models/Notification.js";
import AuditLog from "../../models/AuditLog.js";
import AttendanceRecord from "../../models/AttendanceRecord.js";

/**
 * Admin Leave Request Controller
 * Handles leave request approval/rejection by HR/Managers
 */

/**
 * Get all leave requests (for admin/HR)
 * GET /api/admin/leave-requests
 */
const getAllLeaveRequests = async (req, res) => {
  try {
    const {
      status,
      type,
      employeeId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (employeeId) query.employeeId = employeeId;

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const skip = (pageNum - 1) * limitNum;
    const total = await LeaveRequest.countDocuments(query);

    const leaveRequests = await LeaveRequest.find(query)
      .populate(
        "employeeId",
        "employeeId personalInfo.firstName personalInfo.lastName department"
      )
      .populate("reviewedBy", "firstName lastName email")
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: leaveRequests,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error("Error fetching leave requests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leave requests",
      error: error.message,
    });
  }
};

/**
 * Get leave request by ID (for admin/HR)
 * GET /api/admin/leave-requests/:id
 */
const getLeaveRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const leaveRequest = await LeaveRequest.findById(id)
      .populate("employeeId", "employeeId personalInfo department jobInfo")
      .populate("reviewedBy", "firstName lastName email role");

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    res.json({
      success: true,
      data: leaveRequest,
    });
  } catch (error) {
    logger.error("Error fetching leave request:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leave request",
      error: error.message,
    });
  }
};

/**
 * Helper: build attendance mapping based on leave type + half-day
 */
const getAttendanceMapping = (leaveRequest) => {
  const { type, isHalfDay, halfDayPeriod } = leaveRequest;

  // Base label by type
  let label;
  switch (type) {
    case "sick":
      label = "Sick leave";
      break;
    case "annual":
      label = "Annual leave";
      break;
    case "personal":
      label = "Personal leave";
      break;
    case "maternity":
      label = "Maternity leave";
      break;
    case "paternity":
      label = "Paternity leave";
      break;
    case "emergency":
      label = "Emergency leave";
      break;
    case "unpaid":
      label = "Unpaid leave";
      break;
    default:
      label = "Leave";
  }

  if (isHalfDay) {
    const periodText =
      halfDayPeriod === "morning"
        ? " (morning half)"
        : halfDayPeriod === "afternoon"
        ? " (afternoon half)"
        : "";
    return {
      status: "half_day", // from AttendanceRecord enum
      statusReason: `${label} - Half day${periodText}`,
    };
  }

  return {
    status: "leave",
    statusReason: label,
  };
};

/**
 * Helper: apply approved leave to Attendance for each date in range
 * Option A mapping: different statusReason based on leave type,
 * half_day status for half-day leaves.
 */
const applyLeaveToAttendance = async (leaveRequest, approverId) => {
  const employeeId = leaveRequest.employeeId._id || leaveRequest.employeeId;
  const { status, statusReason } = getAttendanceMapping(leaveRequest);

  const isHalfDay = leaveRequest.isHalfDay && leaveRequest.days === 0.5;

  const start = new Date(leaveRequest.startDate);
  const end = new Date(leaveRequest.endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const datesApplied = [];
  let current = new Date(start);

  while (current <= end) {
    const dateOnly = new Date(
      current.getFullYear(),
      current.getMonth(),
      current.getDate()
    );

    // If half-day: only apply to the FIRST date
    if (isHalfDay && dateOnly.getTime() !== start.getTime()) {
      current.setDate(current.getDate() + 1);
      continue;
    }

    let attendance = await AttendanceRecord.findOne({
      employeeId,
      date: dateOnly,
    });

    if (!attendance) {
      attendance = new AttendanceRecord({
        employeeId,
        date: dateOnly,
        status,
        statusReason,
        source: "system",
        createdBy: approverId,
      });
    } else {
      attendance.status = status;
      attendance.statusReason = statusReason;
      attendance.checkIn = null;
      attendance.checkOut = null;
      attendance.workHours = 0;
      attendance.overtimeHours = 0;
      attendance.breakTime = 0;
      attendance.overtimeHours = 0;
      attendance.overtimeMinutes = 0;
      attendance.isLate = false;
      attendance.isEarlyDeparture = false;
      attendance.updatedBy = approverId;
      attendance.source = "system";
    }

    await attendance.save();
    datesApplied.push(dateOnly.toISOString().split("T")[0]);

    current.setDate(current.getDate() + 1);
  }

  return datesApplied;
};

/**
 * Approve leave request
 * PUT /api/admin/leave-requests/:id/approve
 */
const approveLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const leaveRequest = await LeaveRequest.findById(id).populate(
      "employeeId",
      "employeeId personalInfo.firstName personalInfo.lastName userId"
    );

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    if (leaveRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve leave request with status: ${leaveRequest.status}`,
      });
    }

    // Update leave request
    leaveRequest.status = "approved";
    leaveRequest.reviewedBy = req.user._id;
    leaveRequest.reviewedAt = new Date();
    if (comments) leaveRequest.rejectionReason = comments; // reuse field as approver comments
    await leaveRequest.save();

    // Update leave balance (use leave's year)
    const year = leaveRequest.startDate.getFullYear();
    const leaveBalance = await LeaveBalance.findByEmployeeAndYear(
      leaveRequest.employeeId._id,
      year
    );

    if (leaveBalance) {
      const leaveTypeBalance = leaveBalance.leaveTypes.find(
        (lt) => lt.type === leaveRequest.type
      );

      if (leaveTypeBalance) {
        leaveTypeBalance.pending -= leaveRequest.days;
        if (leaveTypeBalance.pending < 0) leaveTypeBalance.pending = 0;
        leaveTypeBalance.used += leaveRequest.days;
      }

      const historyEntry = leaveBalance.history.find(
        (h) =>
          h.leaveRequestId &&
          h.leaveRequestId.toString() === leaveRequest._id.toString()
      );
      if (historyEntry) {
        historyEntry.status = "approved";
        historyEntry.approvedAt = new Date();
      }

      await leaveBalance.save();
    }

    // Apply leave to attendance
    const appliedDates = await applyLeaveToAttendance(
      leaveRequest,
      req.user._id
    );

    // Notification to employee
    const employeeName = `${leaveRequest.employeeId.personalInfo.firstName} ${leaveRequest.employeeId.personalInfo.lastName}`;
    const approverName = `${req.user.firstName} ${req.user.lastName}`;

    await Notification.create({
      userId: leaveRequest.employeeId.userId,
      type: "leave_approved",
      title: "Leave Request Approved",
      message: `Your ${leaveRequest.type} leave for ${
        leaveRequest.days
      } day(s) from ${leaveRequest.startDate.toLocaleDateString()} to ${leaveRequest.endDate.toLocaleDateString()} has been approved by ${approverName}.${
        comments ? ` Comment: ${comments}` : ""
      }`,
      priority: "high",
      relatedEntity: {
        entityType: "LeaveRequest",
        entityId: leaveRequest._id,
      },
    });

    // Audit log
    await AuditLog.logAction({
      action: "UPDATE",
      entityType: "LeaveRequest",
      entityId: leaveRequest._id,
      userId: req.user._id,
      userRole: req.user.role,
      performedByName: approverName,
      performedByEmail: req.user.email,
      meta: {
        type: "LEAVE_APPROVED",
        leaveType: leaveRequest.type,
        days: leaveRequest.days,
        datesApplied: appliedDates,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    logger.info(
      `Leave request approved: ${leaveRequest._id} by ${req.user._id}`
    );

    res.json({
      success: true,
      data: leaveRequest,
      message: "Leave request approved successfully",
    });
  } catch (error) {
    logger.error("Error approving leave request:", error);
    res.status(500).json({
      success: false,
      message: "Error approving leave request",
      error: error.message,
    });
  }
};

/**
 * Reject leave request
 * PUT /api/admin/leave-requests/:id/reject
 */
const rejectLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const leaveRequest = await LeaveRequest.findById(id).populate(
      "employeeId",
      "employeeId personalInfo.firstName personalInfo.lastName userId"
    );

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    if (leaveRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject leave request with status: ${leaveRequest.status}`,
      });
    }

    // Update leave request
    leaveRequest.status = "rejected";
    leaveRequest.reviewedBy = req.user._id;
    leaveRequest.reviewedAt = new Date();
    leaveRequest.rejectionReason = reason;
    await leaveRequest.save();

    // Restore leave balance
    const year = leaveRequest.startDate.getFullYear();
    const leaveBalance = await LeaveBalance.findByEmployeeAndYear(
      leaveRequest.employeeId._id,
      year
    );

    if (leaveBalance) {
      const leaveTypeBalance = leaveBalance.leaveTypes.find(
        (lt) => lt.type === leaveRequest.type
      );

      if (leaveTypeBalance) {
        leaveTypeBalance.pending -= leaveRequest.days;
        if (leaveTypeBalance.pending < 0) leaveTypeBalance.pending = 0;
        // available is recalculated via pre-save hook
      }

      const historyEntry = leaveBalance.history.find(
        (h) =>
          h.leaveRequestId &&
          h.leaveRequestId.toString() === leaveRequest._id.toString()
      );
      if (historyEntry) {
        historyEntry.status = "rejected";
      }

      await leaveBalance.save();
    }

    const approverName = `${req.user.firstName} ${req.user.lastName}`;

    await Notification.create({
      userId: leaveRequest.employeeId.userId,
      type: "leave_rejected",
      title: "Leave Request Rejected",
      message: `Your ${
        leaveRequest.type
      } leave from ${leaveRequest.startDate.toLocaleDateString()} to ${leaveRequest.endDate.toLocaleDateString()} has been rejected by ${approverName}. Reason: ${reason}`,
      priority: "high",
      relatedEntity: {
        entityType: "LeaveRequest",
        entityId: leaveRequest._id,
      },
    });

    await AuditLog.logAction({
      action: "UPDATE",
      entityType: "LeaveRequest",
      entityId: leaveRequest._id,
      userId: req.user._id,
      userRole: req.user.role,
      performedByName: approverName,
      performedByEmail: req.user.email,
      meta: {
        type: "LEAVE_REJECTED",
        leaveType: leaveRequest.type,
        days: leaveRequest.days,
        reason,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    logger.info(
      `Leave request rejected: ${leaveRequest._id} by ${req.user._id}`
    );

    res.json({
      success: true,
      data: leaveRequest,
      message: "Leave request rejected successfully",
    });
  } catch (error) {
    logger.error("Error rejecting leave request:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting leave request",
      error: error.message,
    });
  }
};

/**
 * Get leave statistics
 * GET /api/admin/leave-requests/statistics
 */
const getLeaveStatistics = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const statistics = await LeaveRequest.aggregate([
      {
        $match: {
          startDate: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalDays: { $sum: "$days" },
        },
      },
    ]);

    const typeStatistics = await LeaveRequest.aggregate([
      {
        $match: {
          startDate: { $gte: startOfYear, $lte: endOfYear },
          status: "approved",
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalDays: { $sum: "$days" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        byStatus: statistics,
        byType: typeStatistics,
        year: parseInt(year, 10),
      },
    });
  } catch (error) {
    logger.error("Error fetching leave statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leave statistics",
      error: error.message,
    });
  }
};

export default {
  getAllLeaveRequests,
  getLeaveRequestById,
  approveLeaveRequest,
  rejectLeaveRequest,
  getLeaveStatistics,
};
