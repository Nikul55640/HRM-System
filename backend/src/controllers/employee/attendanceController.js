import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import AttendanceRecord from "../../models/AttendanceRecord.js";
import AuditLog from "../../models/AuditLog.js";
import { requireEmployeeProfile } from "../../utils/essHelpers.js";

// ---------------------------------------------------------
// Helper: detect device type
// ---------------------------------------------------------
const getDeviceType = (userAgent = "") => {
  const ua = userAgent.toLowerCase();
  if (ua.includes("android") || ua.includes("iphone") || ua.includes("ipad")) {
    return "mobile";
  }
  return "web";
};

// ---------------------------------------------------------
// Helper: get user ID (handles both id and _id from JWT)
// ---------------------------------------------------------
const getUserId = (user) => {
  return user.id || user._id;
};

// ---------------------------------------------------------
// 1. GET ATTENDANCE RECORDS
// ---------------------------------------------------------
const getAttendanceRecords = async (req, res) => {
  try {
    // Check if user has employee profile
    if (!req.user?.employeeId) {
      return res.status(403).json({
        success: false,
        message: 'Employee profile not linked to your account.',
        error: {
          code: 'NO_EMPLOYEE_PROFILE',
          message: 'Employee Self-Service is only available for employees.',
        },
      });
    }

    const {
      employeeId,
      fullName,
      email,
      role,
    } = req.user;
    
    const userId = getUserId(req.user);

    const {
      year = new Date().getFullYear(),
      month = new Date().getMonth() + 1,
      startDate,
      endDate,
      page = 1,
      limit = 31,
    } = req.query;

    const query = { employeeId };
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      query.date = { $gte: start, $lte: end };
    }

    const [records, total] = await Promise.all([
      AttendanceRecord.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AttendanceRecord.countDocuments(query),
    ]);

    // -----------------------
    // AUDIT LOG
    // -----------------------
    await AuditLog.logAction({
      action: "VIEW",
      severity: "info",
      entityType: "Attendance",
      entityId: employeeId,
      entityDisplayName: fullName,
      userId,
      userRole: role,
      performedByName: fullName,
      performedByEmail: email,
      meta: {
        count: records.length,
        month: Number(month),
        year: Number(year),
        page: pageNum,
        limit: limitNum,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    return res.json({
      success: true,
      data: records,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: records.length,
        totalRecords: total,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching attendance records",
      error: error.message,
    });
  }
};

// ---------------------------------------------------------
// 2. GET MONTHLY SUMMARY
// ---------------------------------------------------------
const getMonthlySummary = async (req, res) => {
  try {
    // Check if user has employee profile
    if (!req.user?.employeeId) {
      return res.status(403).json({
        success: false,
        message: 'Employee profile not linked to your account.',
        error: {
          code: 'NO_EMPLOYEE_PROFILE',
          message: 'Employee Self-Service is only available for employees.',
        },
      });
    }

    const {
      employeeId,
      fullName,
      email,
      role,
    } = req.user;
    
    const userId = getUserId(req.user);

    const {
      year = new Date().getFullYear(),
      month = new Date().getMonth() + 1,
    } = req.query;

    const summary = await AttendanceRecord.getMonthlySummary(
      employeeId,
      parseInt(year),
      parseInt(month)
    );

    const base =
      summary.length > 0
        ? summary[0]
        : {
            totalDays: 0,
            presentDays: 0,
            absentDays: 0,
            halfDays: 0,
            leaveDays: 0,
            holidayDays: 0,
            totalWorkHours: 0,
            totalOvertimeHours: 0,
            totalWorkedMinutes: 0,
            totalOvertimeMinutes: 0,
            lateDays: 0,
            earlyDepartures: 0,
            totalLateMinutes: 0,
            totalEarlyExitMinutes: 0,
          };

    const result = { ...base };

    // Attendance %
    result.attendancePercentage =
      result.totalDays > 0
        ? Math.round(
            ((result.presentDays + result.halfDays * 0.5) / result.totalDays) *
              100
          )
        : 0;

    // Average daily work hours (for present days)
    result.averageWorkHours =
      result.presentDays > 0
        ? Math.round(
            (result.totalWorkHours / result.presentDays) * 100
          ) / 100
        : 0;

    // Average late minutes per late day
    result.averageLateMinutes =
      result.lateDays > 0
        ? Math.round(result.totalLateMinutes / result.lateDays)
        : 0;

    // Average early exit minutes per early departure
    result.averageEarlyExitMinutes =
      result.earlyDepartures > 0
        ? Math.round(
            result.totalEarlyExitMinutes / result.earlyDepartures
          )
        : 0;

    // -----------------------
    // AUDIT LOG
    // -----------------------
    await AuditLog.logAction({
      action: "VIEW",
      severity: "info",
      entityType: "Attendance",
      entityId: employeeId,
      entityDisplayName: `${fullName} - Monthly Summary`,
      userId,
      userRole: role,
      performedByName: fullName,
      performedByEmail: email,
      meta: {
        type: "MONTHLY_SUMMARY",
        year: Number(year),
        month: Number(month),
        totalDays: result.totalDays,
        presentDays: result.presentDays,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    return res.json({
      success: true,
      data: result,
      period: { year: parseInt(year), month: parseInt(month) },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching monthly summary",
      error: error.message,
    });
  }
};

// ---------------------------------------------------------
// 3. CHECK-IN
// ---------------------------------------------------------
const checkIn = async (req, res) => {
  try {
    const {
      employeeId,
      fullName,
      email,
      role,
    } = req.user;
    
    const userId = getUserId(req.user);

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee profile not linked.",
      });
    }

    const { location, remarks } = req.body;
    const userAgent = req.get("User-Agent") || "";
    const deviceType = getDeviceType(userAgent);

    const now = new Date();
    const dateOnly = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    let record = await AttendanceRecord.findOne({ employeeId, date: dateOnly });

    if (record?.checkIn) {
      return res.status(400).json({
        success: false,
        message: "Already checked in today",
      });
    }

    if (!record) {
      record = new AttendanceRecord({
        employeeId,
        date: dateOnly,
        createdBy: userId,
        source: "self",
      });
    }

    record.checkIn = now;
    record.status = "present";
    record.statusReason = "Self check-in";
    record.updatedBy = userId; // initial update by same user
    record.source = "self";

    if (!record.deviceInfo) {
      record.deviceInfo = {};
    }
    record.deviceInfo.deviceType = deviceType;
    record.deviceInfo.userAgent = userAgent;
    record.deviceInfo.ipAddress = req.ip;

    if (location) {
      record.location = record.location || {};
      record.location.checkIn = location;
    }

    if (remarks) {
      record.remarks = remarks;
      record.remarksHistory = record.remarksHistory || [];
      record.remarksHistory.push({
        note: remarks,
        addedBy: userId,
        addedAt: new Date(),
      });
    }

    // approvalStatus stays "auto" for self check-in by default
    await record.save();

    // -----------------------
    // AUDIT LOG
    // -----------------------
    await AuditLog.logAction({
      action: "CREATE",
      severity: "info",
      entityType: "Attendance",
      entityId: record._id,
      entityDisplayName: fullName,
      userId,
      userRole: role,
      performedByName: fullName,
      performedByEmail: email,
      meta: {
        type: "CHECK_IN",
        checkInTime: now,
        date: dateOnly,
        deviceType,
        source: "self",
      },
      ipAddress: req.ip,
      userAgent,
    });

    return res.json({
      success: true,
      message: "Checked in successfully",
      data: record.toSummary(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error during check-in",
      error: error.message,
    });
  }
};

// ---------------------------------------------------------
// 4. CHECK-OUT
// ---------------------------------------------------------
const checkOut = async (req, res) => {
  try {
    const {
      employeeId,
      fullName,
      email,
      role,
    } = req.user;
    
    const userId = getUserId(req.user);

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee profile not linked.",
      });
    }

    const { location, remarks } = req.body;
    const userAgent = req.get("User-Agent") || "";
    const deviceType = getDeviceType(userAgent);

    const now = new Date();
    const dateOnly = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const record = await AttendanceRecord.findOne({
      employeeId,
      date: dateOnly,
    });

    if (!record?.checkIn) {
      return res.status(400).json({
        success: false,
        message: "No check-in found today",
      });
    }

    if (record.checkOut) {
      return res.status(400).json({
        success: false,
        message: "Already checked out",
      });
    }

    record.checkOut = now;
    record.updatedBy = userId;
    record.source = record.source || "self"; // keep original or default self
    record.statusReason = record.statusReason || "Self check-out";

    if (!record.deviceInfo) {
      record.deviceInfo = {};
    }
    record.deviceInfo.deviceType = deviceType;
    record.deviceInfo.userAgent = userAgent;
    record.deviceInfo.ipAddress = req.ip;

    if (location) {
      record.location = record.location || {};
      record.location.checkOut = location;
    }

    if (remarks) {
      record.remarks = remarks;
      record.remarksHistory = record.remarksHistory || [];
      record.remarksHistory.push({
        note: remarks,
        addedBy: userId,
        addedAt: new Date(),
      });
    }

    await record.save(); // triggers pre-save, calculates workedMinutes, etc.

    // -----------------------
    // AUDIT LOG
    // -----------------------
    await AuditLog.logAction({
      action: "UPDATE",
      severity: "warning",
      entityType: "Attendance",
      entityId: record._id,
      entityDisplayName: fullName,
      userId,
      userRole: role,
      performedByName: fullName,
      performedByEmail: email,
      meta: {
        type: "CHECK_OUT",
        checkOutTime: now,
        date: dateOnly,
        workedMinutes: record.workedMinutes,
        workHours: record.workHours,
        overtimeMinutes: record.overtimeMinutes,
        overtimeHours: record.overtimeHours,
        lateMinutes: record.lateMinutes,
        earlyExitMinutes: record.earlyExitMinutes,
        deviceType,
        source: record.source,
      },
      ipAddress: req.ip,
      userAgent,
    });

    return res.json({
      success: true,
      message: "Checked out successfully",
      data: record.toSummary(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error during check-out",
      error: error.message,
    });
  }
};

// ---------------------------------------------------------
// 5. EXPORT REPORT
// ---------------------------------------------------------
const exportAttendanceReport = async (req, res) => {
  try {
    const {
      employeeId,
      fullName,
      email,
      role,
    } = req.user;
    
    const userId = getUserId(req.user);

    const {
      format = "pdf",
      year = new Date().getFullYear(),
      month = new Date().getMonth() + 1,
      startDate,
      endDate,
    } = req.query;

    const query = { employeeId };
    let periodText = "";

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
      periodText = `${startDate} to ${endDate}`;
    } else {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      query.date = { $gte: start, $lte: end };
      periodText = `${month}/${year}`;
    }

    const [records, summary] = await Promise.all([
      AttendanceRecord.find(query).sort({ date: 1 }).lean(),
      AttendanceRecord.getMonthlySummary(
        employeeId,
        parseInt(year),
        parseInt(month)
      ),
    ]);

    const summaryData = summary.length > 0 ? summary[0] : {};

    if (format === "pdf") {
      await generateAttendancePDF(res, records, summaryData, periodText);
    } else if (format === "excel") {
      await generateAttendanceExcel(res, records, summaryData, periodText);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid format (use pdf or excel)",
      });
    }

    // -----------------------
    // AUDIT LOG
    // -----------------------
    await AuditLog.logAction({
      action: "VIEW",
      severity: "info",
      entityType: "Attendance Report",
      entityId: employeeId,
      entityDisplayName: fullName,
      userId,
      userRole: role,
      performedByName: fullName,
      performedByEmail: email,
      meta: {
        format,
        period: periodText,
        recordCount: records.length,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error exporting attendance report",
      error: error.message,
    });
  }
};
// ---------------------------------------------------------
// 6. MANUAL UPDATE (HR / Admin)
// ---------------------------------------------------------
const manualUpdateAttendance = async (req, res) => {
  try {
    const {
      fullName,
      email,
      role,
    } = req.user;
    
    const userId = getUserId(req.user);

    const { recordId } = req.params;

    const {
      checkIn,
      checkOut,
      status,
      statusReason,
      overtimeMinutes,
      breakTime,
      remarks,
      approvalStatus,
      shiftStart,
      shiftEnd,
    } = req.body;

    const userAgent = req.get("User-Agent") || "";
    const deviceType = getDeviceType(userAgent);

    // 1. Find the record
    const record = await AttendanceRecord.findById(recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    // Snapshot before changes (for AuditLog diff)
    const before = record.toObject();

    // 2. Apply updates only if provided
    if (checkIn !== undefined) {
      record.checkIn = checkIn ? new Date(checkIn) : null;
    }

    if (checkOut !== undefined) {
      record.checkOut = checkOut ? new Date(checkOut) : null;
    }

    if (status) {
      record.status = status;
    }

    if (statusReason !== undefined) {
      record.statusReason = statusReason || "";
    }

    if (typeof breakTime === "number") {
      record.breakTime = breakTime;
    }

    if (shiftStart) {
      record.shiftStart = shiftStart;
    }

    if (shiftEnd) {
      record.shiftEnd = shiftEnd;
    }

    if (typeof overtimeMinutes === "number") {
      record.overtimeMinutes = overtimeMinutes;
      record.overtimeHours =
        Math.round((overtimeMinutes / 60) * 100) / 100;
    }

    if (approvalStatus) {
      // basic safety check against schema enum
      const allowedStatuses = ["auto", "pending", "approved", "rejected"];
      if (allowedStatuses.includes(approvalStatus)) {
        record.approvalStatus = approvalStatus;
      }
    }

    if (remarks !== undefined) {
      record.remarks = remarks || "";
      record.remarksHistory = record.remarksHistory || [];
      if (remarks) {
        record.remarksHistory.push({
          note: remarks,
          addedBy: userId,
          addedAt: new Date(),
        });
      }
    }

    // 3. Generic meta fields
    record.updatedBy = userId;
    record.source = "manual";

    if (!record.deviceInfo) {
      record.deviceInfo = {};
    }
    record.deviceInfo.deviceType = deviceType;
    record.deviceInfo.userAgent = userAgent;
    record.deviceInfo.ipAddress = req.ip;

    // 4. Save (triggers pre-save calculations)
    await record.save();

    // 5. Build change diff for AuditLog
    const changedFields = {};
    const fieldsToTrack = [
      "checkIn",
      "checkOut",
      "status",
      "statusReason",
      "breakTime",
      "shiftStart",
      "shiftEnd",
      "overtimeMinutes",
      "overtimeHours",
      "approvalStatus",
      "remarks",
      "workedMinutes",
      "workHours",
      "lateMinutes",
      "earlyExitMinutes",
    ];

    fieldsToTrack.forEach((field) => {
      const beforeVal = before[field];
      const afterVal = record[field];

      // Convert dates to ISO strings for stable comparison
      const normBefore =
        beforeVal instanceof Date ? beforeVal.toISOString() : beforeVal;
      const normAfter =
        afterVal instanceof Date ? afterVal.toISOString() : afterVal;

      if (normBefore !== normAfter) {
        changedFields[field] = {
          before: beforeVal,
          after: afterVal,
        };
      }
    });

    // 6. Audit log
    await AuditLog.logAction({
      action: "UPDATE",
      severity: "warning",
      entityType: "Attendance",
      entityId: record._id,
      entityDisplayName: `Attendance for ${record.formattedDate}`,
      userId,
      userRole: role,
      performedByName: fullName,
      performedByEmail: email,
      meta: {
        type: "MANUAL_UPDATE",
        employeeId: record.employeeId,
        recordId: record._id,
        changedFields,
      },
      ipAddress: req.ip,
      userAgent,
    });

    return res.json({
      success: true,
      message: "Attendance updated successfully",
      data: record.toSummary(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating attendance record",
      error: error.message,
    });
  }
};

export default {
  getAttendanceRecords,
  getMonthlySummary,
  exportAttendanceReport,
  checkIn,
  checkOut,
  manualUpdateAttendance,
};
