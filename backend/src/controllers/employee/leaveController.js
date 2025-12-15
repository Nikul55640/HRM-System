import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { LeaveBalance, AuditLog, Employee } from "../../models/sequelize/index.js";

// FINAL valid leave types used in your system
const VALID_LEAVE_TYPES = [
  "annual",
  "sick",
  "personal",
  "maternity",
  "paternity",
  "emergency",
  "unpaid",
];

// Default allocations (same used in Employee Controller)
const DEFAULT_ALLOCATIONS = {
  annual: 20,
  sick: 10,
  personal: 5,
  emergency: 3,
  maternity: 90,
  paternity: 10,
  unpaid: 9999,
};

/* ----------------------------------------------------------
   Helper: Create default LeaveBalance when missing
---------------------------------------------------------- */
const createDefaultBalance = async (employeeId, year) => {
  const leaveTypes = VALID_LEAVE_TYPES.map((type) => ({
    type,
    allocated: DEFAULT_ALLOCATIONS[type],
    used: 0,
    pending: 0,
  }));

  const balance = await LeaveBalance.create({
    employeeId,
    year,
    leaveTypes,
    history: [],
  });

  return balance;
};

/* ----------------------------------------------------------
   1️⃣ GET LEAVE BALANCE (ESS)
---------------------------------------------------------- */
const getLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee profile not linked to account.",
      });
    }

    let leaveBalance = await LeaveBalance.findOne({
      where: {
        employeeId,
        year,
      },
    });

    // Auto-create default balance if not exists
    if (!leaveBalance) {
      leaveBalance = await createDefaultBalance(employeeId, year);
    }

    return res.json({
      success: true,
      data: leaveBalance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching leave balance",
      error: error.message,
    });
  }
};

/* ----------------------------------------------------------
   2️⃣ GET LEAVE HISTORY (ESS)
---------------------------------------------------------- */
const getLeaveHistory = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee profile not linked.",
      });
    }

    const leaveBalance = await LeaveBalance.findOne({
      where: {
        employeeId,
        year,
      },
    });

    return res.json({
      success: true,
      data: leaveBalance ? leaveBalance.history : [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching leave history",
      error: error.message,
    });
  }
};

/* ----------------------------------------------------------
   3️⃣ EXPORT LEAVE SUMMARY (ESS)
---------------------------------------------------------- */
const exportLeaveSummary = async (req, res) => {
  try {
    const { employeeId, _id: userId } = req.user;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const format = req.query.format || "pdf";

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee profile not linked.",
      });
    }

    const leaveBalance = await LeaveBalance.findOne({
      where: {
        employeeId,
        year,
      },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employeeId', 'personalInfo'],
        },
      ],
    });

    if (!leaveBalance) {
      return res.status(404).json({
        success: false,
        message: "Leave balance not found",
      });
    }

    const employeeName = `${leaveBalance.employee.personalInfo.firstName} ${leaveBalance.employee.personalInfo.lastName}`;

    if (format === "pdf") {
      await generatePDF(res, leaveBalance, employeeName, year);
    } else if (format === "excel") {
      await generateExcel(res, leaveBalance, employeeName, year);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid format. Use ?format=pdf or ?format=excel",
      });
    }

    // Log export in audit
    await AuditLog.logAction({
      action: "EXPORT",
      entityType: "LeaveSummary",
      entityId: leaveBalance.id.toString(),
      performedByName: employeeName,
      userId,
      userRole: req.user.role,
      meta: {
        year,
        format,
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error exporting leave summary",
      error: error.message,
    });
  }
};

/* ----------------------------------------------------------
   PDF GENERATION
---------------------------------------------------------- */
const generatePDF = async (res, balance, employeeName, year) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=leave-summary-${year}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).text("Leave Summary Report", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Employee: ${employeeName}`);
  doc.text(`Year: ${year}`);
  doc.text(`Generated on: ${new Date().toLocaleString()}`);
  doc.moveDown(2);

  // Balance section
  doc.fontSize(16).text("Leave Balance");
  doc.moveDown(1);

  balance.leaveTypes.forEach((lt) => {
    doc
      .fontSize(12)
      .text(
        `${lt.type.toUpperCase()} → Allocated: ${lt.allocated}, Used: ${
          lt.used
        }, Pending: ${lt.pending}, Available: ${
          lt.allocated - (lt.used + lt.pending)
        }`
      );
    doc.moveDown(0.5);
  });

  doc.addPage();

  // History
  doc.fontSize(16).text("Leave History");
  doc.moveDown(1);

  if (balance.history.length === 0) {
    doc.fontSize(12).text("No leave history available.");
  } else {
    balance.history
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
      .forEach((leave) => {
        doc
          .fontSize(12)
          .text(
            `• ${leave.type.toUpperCase()} | ${leave.days} day(s) | ${
              leave.status
            }`
          );
        doc
          .fontSize(10)
          .text(
            `${leave.startDate.toDateString()} → ${leave.endDate.toDateString()}`
          );
        doc.moveDown(1);
      });
  }

  doc.end();
};

/* ----------------------------------------------------------
   EXCEL GENERATION
---------------------------------------------------------- */
const generateExcel = async (res, balance, employeeName, year) => {
  const workbook = new ExcelJS.Workbook();

  // Balance sheet
  const sheet = workbook.addWorksheet("Leave Balance");
  sheet.addRow(["Leave Summary Report"]);
  sheet.addRow([`Employee: ${employeeName}`]);
  sheet.addRow([`Year: ${year}`]);
  sheet.addRow([`Generated: ${new Date().toLocaleDateString()}`]);
  sheet.addRow([]);

  sheet.addRow(["Leave Type", "Allocated", "Used", "Pending", "Available"]);

  balance.leaveTypes.forEach((lt) => {
    sheet.addRow([
      lt.type,
      lt.allocated,
      lt.used,
      lt.pending,
      lt.allocated - (lt.used + lt.pending),
    ]);
  });

  // History sheet
  const history = workbook.addWorksheet("Leave History");

  history.addRow([
    "Type",
    "Start Date",
    "End Date",
    "Days",
    "Status",
    "Applied At",
  ]);

  balance.history.forEach((h) => {
    history.addRow([
      h.type,
      h.startDate.toDateString(),
      h.endDate.toDateString(),
      h.days,
      h.status,
      h.appliedAt?.toDateString() || "",
    ]);
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=leave-summary-${year}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
};

/* ----------------------------------------------------------
   EXPORT
---------------------------------------------------------- */
export default {
  getLeaveBalance,
  getLeaveHistory,
  exportLeaveSummary,
};
