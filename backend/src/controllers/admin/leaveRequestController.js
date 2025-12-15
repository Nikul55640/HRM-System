import logger from "../../utils/logger.js";
import LeaveRequest from "../../models/sequelize/LeaveRequest.js";
import { LeaveBalance, Notification, AttendanceRecord, Employee } from "../../models/sequelize/index.js";
import AuditLog from "../../models/sequelize/AuditLog.js";
import { Op } from "sequelize";
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

    const where = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (employeeId) where.employeeId = employeeId;

    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate[LeaveRequest.sequelize.Sequelize.Op.gte] = new Date(startDate);
      if (endDate) where.startDate[LeaveRequest.sequelize.Sequelize.Op.lte] = new Date(endDate);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const offset = (pageNum - 1) * limitNum;

    const { count: total, rows: leaveRequests } = await LeaveRequest.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employeeId', 'personalInfo', 'jobInfo'],
        },
      ],
      order: [['appliedAt', 'DESC']],
      limit: limitNum,
      offset: offset,
    });

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

    const leaveRequest = await LeaveRequest.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employeeId', 'personalInfo', 'jobInfo'],
        },
      ],
    });

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
      where: {
        employeeId,
        date: dateOnly,
      },
    });

    if (!attendance) {
      attendance = await AttendanceRecord.create({
        employeeId,
        date: dateOnly,
        status,
        statusReason,
        source: "system",
        createdBy: approverId,
      });
    } else {
      await attendance.update({
        status,
        statusReason,
        checkIn: null,
        checkOut: null,
        workHours: 0,
        overtimeHours: 0,
        breakTime: 0,
        overtimeMinutes: 0,
        isLate: false,
        isEarlyDeparture: false,
        updatedBy: approverId,
        source: "system",
      });
    }
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

    const leaveRequest = await LeaveRequest.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employeeId', 'personalInfo'],
        },
      ],
    });

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
    await leaveRequest.update({
      status: "approved",
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      rejectionReason: comments || leaveRequest.rejectionReason,
    });

    // Update leave balance (use leave's year)
    const year = leaveRequest.startDate.getFullYear();
    const leaveBalance = await LeaveBalance.findOne({
      where: {
        employeeId: leaveRequest.employeeId,
        year: year,
      },
    });

    if (leaveBalance) {
      const leaveTypes = leaveBalance.leaveTypes || [];
      const leaveTypeIndex = leaveTypes.findIndex(
        (lt) => lt.type === leaveRequest.type
      );

      if (leaveTypeIndex !== -1) {
        leaveTypes[leaveTypeIndex].pending -= leaveRequest.days;
        if (leaveTypes[leaveTypeIndex].pending < 0) leaveTypes[leaveTypeIndex].pending = 0;
        leaveTypes[leaveTypeIndex].used += leaveRequest.days;
      }

      const history = leaveBalance.history || [];
      const historyIndex = history.findIndex(
        (h) =>
          h.leaveRequestId &&
          h.leaveRequestId.toString() === leaveRequest.id.toString()
      );
      if (historyIndex !== -1) {
        history[historyIndex].status = "approved";
        history[historyIndex].approvedAt = new Date();
      }

      await leaveBalance.update({
        leaveTypes: leaveTypes,
        history: history,
      });
    }

    // Apply leave to attendance
    const appliedDates = await applyLeaveToAttendance(
      leaveRequest,
      req.user.id
    );

    // Notification to employee
    const employeeName = `${leaveRequest.employee.personalInfo.firstName} ${leaveRequest.employee.personalInfo.lastName}`;
    const approverName = `${req.user.firstName || req.user.email} ${req.user.lastName || ''}`;

    await Notification.create({
      userId: leaveRequest.employee.userId || leaveRequest.employeeId,
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
        entityId: leaveRequest.id,
      },
    });

    // Audit log
    await AuditLog.logAction({
      action: "UPDATE",
      entityType: "LeaveRequest",
      entityId: leaveRequest.id.toString(),
      userId: req.user.id,
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
      `Leave request approved: ${leaveRequest.id} by ${req.user.id}`
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

    const leaveRequest = await LeaveRequest.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employeeId', 'personalInfo'],
        },
      ],
    });

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
    await leaveRequest.update({
      status: "rejected",
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      rejectionReason: reason,
    });

    // Restore leave balance
    const year = leaveRequest.startDate.getFullYear();
    const leaveBalance = await LeaveBalance.findOne({
      where: {
        employeeId: leaveRequest.employeeId,
        year: year,
      },
    });

    if (leaveBalance) {
      const leaveTypes = leaveBalance.leaveTypes || [];
      const leaveTypeIndex = leaveTypes.findIndex(
        (lt) => lt.type === leaveRequest.type
      );

      if (leaveTypeIndex !== -1) {
        leaveTypes[leaveTypeIndex].pending -= leaveRequest.days;
        if (leaveTypes[leaveTypeIndex].pending < 0) leaveTypes[leaveTypeIndex].pending = 0;
        // available is recalculated via pre-save hook
      }

      const history = leaveBalance.history || [];
      const historyIndex = history.findIndex(
        (h) =>
          h.leaveRequestId &&
          h.leaveRequestId.toString() === leaveRequest.id.toString()
      );
      if (historyIndex !== -1) {
        history[historyIndex].status = "rejected";
      }

      await leaveBalance.update({
        leaveTypes: leaveTypes,
        history: history,
      });
    }

    const approverName = `${req.user.firstName || req.user.email} ${req.user.lastName || ''}`;

    await Notification.create({
      userId: leaveRequest.employee.userId || leaveRequest.employeeId,
      type: "leave_rejected",
      title: "Leave Request Rejected",
      message: `Your ${
        leaveRequest.type
      } leave from ${leaveRequest.startDate.toLocaleDateString()} to ${leaveRequest.endDate.toLocaleDateString()} has been rejected by ${approverName}. Reason: ${reason}`,
      priority: "high",
      relatedEntity: {
        entityType: "LeaveRequest",
        entityId: leaveRequest.id,
      },
    });

    await AuditLog.logAction({
      action: "UPDATE",
      entityType: "LeaveRequest",
      entityId: leaveRequest.id.toString(),
      userId: req.user.id,
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
      `Leave request rejected: ${leaveRequest.id} by ${req.user.id}`
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

    const statistics = await LeaveRequest.findAll({
      where: {
        startDate: { 
          [LeaveRequest.sequelize.Sequelize.Op.between]: [startOfYear, endOfYear] 
        },
      },
      attributes: [
        'status',
        [LeaveRequest.sequelize.fn('COUNT', LeaveRequest.sequelize.col('status')), 'count'],
        [LeaveRequest.sequelize.fn('SUM', LeaveRequest.sequelize.col('days')), 'totalDays'],
      ],
      group: ['status'],
      raw: true,
    });

    const typeStatistics = await LeaveRequest.findAll({
      where: {
        startDate: { 
          [LeaveRequest.sequelize.Sequelize.Op.between]: [startOfYear, endOfYear] 
        },
        status: "approved",
      },
      attributes: [
        'type',
        [LeaveRequest.sequelize.fn('COUNT', LeaveRequest.sequelize.col('type')), 'count'],
        [LeaveRequest.sequelize.fn('SUM', LeaveRequest.sequelize.col('days')), 'totalDays'],
      ],
      group: ['type'],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        byStatus: statistics.map(stat => ({
          _id: stat.status,
          count: parseInt(stat.count),
          totalDays: parseFloat(stat.totalDays) || 0,
        })),
        byType: typeStatistics.map(stat => ({
          _id: stat.type,
          count: parseInt(stat.count),
          totalDays: parseFloat(stat.totalDays) || 0,
        })),
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
