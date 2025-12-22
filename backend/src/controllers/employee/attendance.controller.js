import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { AttendanceRecord, AuditLog } from "../../models/sequelize/index.js";

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

    const where = { employeeId };
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    if (startDate && endDate) {
      // Parse dates and set to start/end of day to handle timezone issues
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      console.log('📅 [ATTENDANCE] Date query:', {
        startDate,
        endDate,
        start: start.toISOString(),
        end: end.toISOString(),
      });
      
      where.date = { [AttendanceRecord.sequelize.Sequelize.Op.between]: [start, end] };
    } else {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      end.setHours(23, 59, 59, 999);
      where.date = { [AttendanceRecord.sequelize.Sequelize.Op.between]: [start, end] };
    }
    
    console.log('🔍 [ATTENDANCE] Query:', JSON.stringify(where, null, 2));

    const { count: total, rows: records } = await AttendanceRecord.findAndCountAll({
      where,
      order: [['date', 'DESC']],
      limit: limitNum,
      offset,
    });

    console.log('✅ [ATTENDANCE] Found records:', records.length);
    if (records.length > 0) {
      console.log('📊 [ATTENDANCE] First record:', {
        date: records[0].date,
        checkIn: records[0].checkIn,
        checkOut: records[0].checkOut,
      });
    }

    // Ensure sessions are included in response
    const recordsWithSessions = records.map(record => ({
      ...record.toJSON(),
      sessions: record.sessions || [],
    }));

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
      data: recordsWithSessions,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: recordsWithSessions.length,
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

    console.log('🟢 [CHECK-IN] Looking for record:', {
      employeeId,
      dateOnly: dateOnly.toISOString(),
    });

    // Find today's record with date range to handle timezone issues
    const startOfDay = new Date(dateOnly);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateOnly);
    endOfDay.setHours(23, 59, 59, 999);

    let record = await AttendanceRecord.findOne({
      where: {
        employeeId,
        date: { [AttendanceRecord.sequelize.Sequelize.Op.between]: [startOfDay, endOfDay] },
      },
    });

    console.log('🔍 [CHECK-IN] Record found:', !!record);
    if (record) {
      console.log('📊 [CHECK-IN] Record details:', {
        date: record.date,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
      });
    }

    if (record?.checkIn) {
      return res.status(400).json({
        success: false,
        message: "Already checked in today",
      });
    }

    if (!record) {
      record = await AttendanceRecord.create({
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

    const deviceInfo = record.deviceInfo || {};
    deviceInfo.deviceType = deviceType;
    deviceInfo.userAgent = userAgent;
    deviceInfo.ipAddress = req.ip;
    record.deviceInfo = deviceInfo;

    if (location) {
      const locationData = record.location || {};
      locationData.checkIn = location;
      record.location = locationData;
    }

    if (remarks) {
      record.remarks = remarks;
      const remarksHistory = record.remarksHistory || [];
      remarksHistory.push({
        note: remarks,
        addedBy: userId,
        addedAt: new Date(),
      });
      record.remarksHistory = remarksHistory;
    }

    // approvalStatus stays "auto" for self check-in by default
    console.log('💾 [CHECK-IN] Saving record...');
    await record.save();
    console.log('✅ [CHECK-IN] Record saved successfully');

    // -----------------------
    // AUDIT LOG
    // -----------------------
    try {
      await AuditLog.logAction({
        action: "CREATE",
        severity: "info",
        entityType: "Attendance",
        entityId: record.id.toString(),
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
    } catch (auditError) {
      console.error('❌ [CHECK-IN] Audit log failed:', auditError);
      // Continue anyway
    }

    console.log('📤 [CHECK-IN] Preparing response...');
    const summary = record.toSummary ? record.toSummary() : record.toObject();

    return res.json({
      success: true,
      message: "Checked in successfully",
      data: summary,
    });
  } catch (error) {
    console.error('❌ [CHECK-IN] Error:', error);
    console.error('❌ [CHECK-IN] Stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: "Error during check-in",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
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

    console.log('🔴 [CHECK-OUT] Looking for record:', {
      employeeId,
      dateOnly: dateOnly.toISOString(),
    });

    // Find today's record with date range to handle timezone issues
    const startOfDay = new Date(dateOnly);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateOnly);
    endOfDay.setHours(23, 59, 59, 999);

    const record = await AttendanceRecord.findOne({
      where: {
        employeeId,
        date: { [AttendanceRecord.sequelize.Sequelize.Op.between]: [startOfDay, endOfDay] },
      },
    });

    console.log('🔍 [CHECK-OUT] Record found:', !!record);
    if (record) {
      console.log('📊 [CHECK-OUT] Record details:', {
        date: record.date,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
      });
    }

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

    const deviceInfo = record.deviceInfo || {};
    deviceInfo.deviceType = deviceType;
    deviceInfo.userAgent = userAgent;
    deviceInfo.ipAddress = req.ip;
    record.deviceInfo = deviceInfo;

    if (location) {
      const locationData = record.location || {};
      locationData.checkOut = location;
      record.location = locationData;
    }

    if (remarks) {
      record.remarks = remarks;
      const remarksHistory = record.remarksHistory || [];
      remarksHistory.push({
        note: remarks,
        addedBy: userId,
        addedAt: new Date(),
      });
      record.remarksHistory = remarksHistory;
    }

    console.log('💾 [CHECK-OUT] Saving record...');
    await record.save(); // triggers pre-save, calculates workedMinutes, etc.
    console.log('✅ [CHECK-OUT] Record saved successfully');

    // -----------------------
    // AUDIT LOG
    // -----------------------
    try {
      await AuditLog.logAction({
        action: "UPDATE",
        severity: "warning",
        entityType: "Attendance",
        entityId: record.id.toString(),
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
    } catch (auditError) {
      console.error('❌ [CHECK-OUT] Audit log failed:', auditError);
      // Continue anyway
    }

    console.log('📤 [CHECK-OUT] Preparing response...');
    const summary = record.toSummary ? record.toSummary() : record.toObject();
    
    return res.json({
      success: true,
      message: "Checked out successfully",
      data: summary,
    });
  } catch (error) {
    console.error('❌ [CHECK-OUT] Error:', error);
    console.error('❌ [CHECK-OUT] Stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: "Error during check-out",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// ---------------------------------------------------------
// HELPER FUNCTIONS FOR EXPORT
// ---------------------------------------------------------
const generateAttendancePDF = async (res, records, summaryData, periodText) => {
  const doc = new PDFDocument();
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="attendance-report-${periodText.replace(/\//g, '-')}.pdf"`);
  
  doc.pipe(res);
  
  // Title
  doc.fontSize(16).text('Attendance Report', { align: 'center' });
  doc.fontSize(12).text(`Period: ${periodText}`, { align: 'center' });
  doc.moveDown();
  
  // Summary
  if (summaryData && Object.keys(summaryData).length > 0) {
    doc.text('Summary:', { underline: true });
    doc.text(`Total Days: ${summaryData.totalDays || 0}`);
    doc.text(`Present Days: ${summaryData.presentDays || 0}`);
    doc.text(`Absent Days: ${summaryData.absentDays || 0}`);
    doc.text(`Total Work Hours: ${summaryData.totalWorkHours || 0}`);
    doc.text(`Total Overtime Hours: ${summaryData.totalOvertimeHours || 0}`);
    doc.moveDown();
  }
  
  // Records
  doc.text('Attendance Records:', { underline: true });
  records.forEach((record, index) => {
    if (index > 0 && index % 10 === 0) {
      doc.addPage();
    }
    
    const date = new Date(record.date).toLocaleDateString();
    const checkIn = record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'N/A';
    const checkOut = record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'N/A';
    const workHours = record.workHours || 0;
    
    doc.text(`${date} | In: ${checkIn} | Out: ${checkOut} | Hours: ${workHours} | Status: ${record.status}`);
  });
  
  doc.end();
};

const generateAttendanceExcel = async (res, records, summaryData, periodText) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Attendance Report');
  
  // Headers
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Check In', key: 'checkIn', width: 12 },
    { header: 'Check Out', key: 'checkOut', width: 12 },
    { header: 'Work Hours', key: 'workHours', width: 12 },
    { header: 'Overtime Hours', key: 'overtimeHours', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Remarks', key: 'remarks', width: 20 },
  ];
  
  // Add summary row
  if (summaryData && Object.keys(summaryData).length > 0) {
    worksheet.addRow({});
    worksheet.addRow({ date: 'SUMMARY' });
    worksheet.addRow({ date: 'Total Days', checkIn: summaryData.totalDays || 0 });
    worksheet.addRow({ date: 'Present Days', checkIn: summaryData.presentDays || 0 });
    worksheet.addRow({ date: 'Absent Days', checkIn: summaryData.absentDays || 0 });
    worksheet.addRow({ date: 'Total Work Hours', checkIn: summaryData.totalWorkHours || 0 });
    worksheet.addRow({ date: 'Total Overtime Hours', checkIn: summaryData.totalOvertimeHours || 0 });
    worksheet.addRow({});
  }
  
  // Add records
  records.forEach(record => {
    worksheet.addRow({
      date: new Date(record.date).toLocaleDateString(),
      checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '',
      checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '',
      workHours: record.workHours || 0,
      overtimeHours: record.overtimeHours || 0,
      status: record.status || '',
      remarks: record.remarks || '',
    });
  });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="attendance-report-${periodText.replace(/\//g, '-')}.xlsx"`);
  
  await workbook.xlsx.write(res);
  res.end();
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

    const where = { employeeId };
    let periodText = "";

    if (startDate && endDate) {
      where.date = { [AttendanceRecord.sequelize.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)] };
      periodText = `${startDate} to ${endDate}`;
    } else {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      where.date = { [AttendanceRecord.sequelize.Sequelize.Op.between]: [start, end] };
      periodText = `${month}/${year}`;
    }

    const [records, summary] = await Promise.all([
      AttendanceRecord.findAll({
        where,
        order: [['date', 'ASC']],
      }),
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
    const record = await AttendanceRecord.findByPk(recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    // Snapshot before changes (for AuditLog diff)
    const before = record.toJSON();

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
      const remarksHistory = record.remarksHistory || [];
      if (remarks) {
        remarksHistory.push({
          note: remarks,
          addedBy: userId,
          addedAt: new Date(),
        });
      }
      record.remarksHistory = remarksHistory;
    }

    // 3. Generic meta fields
    record.updatedBy = userId;
    record.source = "manual";

    const deviceInfo = record.deviceInfo || {};
    deviceInfo.deviceType = deviceType;
    deviceInfo.userAgent = userAgent;
    deviceInfo.ipAddress = req.ip;
    record.deviceInfo = deviceInfo;

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
      entityId: record.id.toString(),
      entityDisplayName: `Attendance for ${record.date}`,
      userId,
      userRole: role,
      performedByName: fullName,
      performedByEmail: email,
      meta: {
        type: "MANUAL_UPDATE",
        employeeId: record.employeeId,
        recordId: record.id,
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

// ---------------------------------------------------------
// 7. GET ALL ATTENDANCE RECORDS (Admin/HR view)
// ---------------------------------------------------------
const getAllAttendanceRecords = async (req, res) => {
  try {
    const {
      fullName,
      email,
      role,
    } = req.user;
    
    const userId = getUserId(req.user);

    const {
      employeeId,
      department,
      startDate,
      endDate,
      year = new Date().getFullYear(),
      month = new Date().getMonth() + 1,
      page = 1,
      limit = 50,
      status,
    } = req.query;

    const where = {};
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Filter by specific employee
    if (employeeId) {
      where.employeeId = employeeId;
    }

    // Filter by date range - SIMPLIFIED LOGIC
    if (startDate && endDate && startDate !== '' && endDate !== '') {
      console.log('🗓️ [BACKEND] Using date range:', { startDate, endDate });
      where.date = startDate === endDate ? startDate : { 
        [AttendanceRecord.sequelize.Sequelize.Op.between]: [startDate, endDate] 
      };
    } else if (startDate === '' && endDate === '') {
      // Show all records when empty strings are passed
      console.log('🗓️ [BACKEND] Showing all records (empty date filters)');
      // Don't add any date filter
    } else {
      // Default to current month if no date range specified
      const now = new Date();
      const start = new Date(now.getFullYear(), parseInt(month) - 1, 1);
      const end = new Date(now.getFullYear(), parseInt(month), 0);
      
      // Format as YYYY-MM-DD for DATEONLY comparison
      const startDateStr = start.toISOString().split('T')[0];
      const endDateStr = end.toISOString().split('T')[0];
      
      console.log('🗓️ [BACKEND] Using month range:', { year, month, startDateStr, endDateStr });
      
      where.date = { 
        [AttendanceRecord.sequelize.Sequelize.Op.between]: [startDateStr, endDateStr] 
      };
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Include employee details
    const includeOptions = [{
      model: AttendanceRecord.sequelize.models.Employee,
      as: 'employee',
      attributes: ['id', 'employeeId', 'personalInfo', 'jobInfo', 'contactInfo'],
      required: false, // LEFT JOIN to include records even if employee is missing
      // Filter by department if specified (using JSON path)
      ...(department && department !== 'all' ? {
        where: {
          [AttendanceRecord.sequelize.Sequelize.Op.and]: [
            AttendanceRecord.sequelize.Sequelize.literal(`JSON_EXTRACT(jobInfo, '$.department') = '${department}'`)
          ]
        }
      } : {})
    }];

    console.log('🔍 [BACKEND] getAllAttendanceRecords called with query params:', req.query);
    console.log('🔍 [BACKEND] Constructed where clause:', where);

    const { count: total, rows: records } = await AttendanceRecord.findAndCountAll({
      where,
      include: includeOptions,
      order: [['date', 'DESC'], ['employeeId', 'ASC']],
      limit: limitNum,
      offset,
    });

    console.log('📊 [BACKEND] Found records:', records.length);
    console.log('📊 [BACKEND] Total count:', total);

    // Format records with employee info
    const formattedRecords = records.map(record => {
      const employee = record.employee;
      const personalInfo = employee?.personalInfo || {};
      const jobInfo = employee?.jobInfo || {};
      const contactInfo = employee?.contactInfo || {};
      
      const formatted = {
        ...record.toJSON(),
        employeeName: employee ? `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim() : 'Unknown',
        employeeEmail: contactInfo.email || '',
        employeeDepartment: jobInfo.department || '',
        employeePosition: jobInfo.position || '',
      };
      
      console.log('📋 [BACKEND] Formatted record:', {
        id: formatted.id,
        employeeName: formatted.employeeName,
        date: formatted.date,
        checkIn: formatted.checkIn,
        status: formatted.status
      });
      
      return formatted;
    });

    console.log('📤 [BACKEND] Sending response with', formattedRecords.length, 'records');

    // -----------------------
    // AUDIT LOG
    // -----------------------
    try {
      await AuditLog.logAction({
        action: "VIEW",
        severity: "info",
        entityType: "Attendance",
        entityId: "all-attendance-records",
        entityDisplayName: "All Attendance Records",
        userId,
        userRole: role,
        performedByName: fullName,
        performedByEmail: email,
        meta: {
          type: "ADMIN_VIEW_ALL",
          filters: {
            employeeId,
            department,
            startDate,
            endDate,
            year: Number(year),
            month: Number(month),
            status,
          },
          count: records.length,
          page: pageNum,
          limit: limitNum,
        },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
    } catch (auditError) {
      console.error('⚠️ [BACKEND] Audit log failed:', auditError);
      // Continue anyway
    }

    const responseData = {
      success: true,
      data: formattedRecords,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: formattedRecords.length,
        totalRecords: total,
      },
    };

    console.log('📤 [BACKEND] Final response:', {
      success: responseData.success,
      dataLength: responseData.data.length,
      pagination: responseData.pagination
    });

    return res.json(responseData);
  } catch (error) {
    console.error('Error fetching all attendance records:', error);
    return res.status(500).json({
      success: false,
      message: "Error fetching attendance records",
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
  getAllAttendanceRecords,
};
