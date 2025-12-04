import Payslip from "../../models/Payslip.js";
import AuditLog from "../../models/AuditLog.js";
import mongoose from "mongoose";

// ==============================
//  Helper: Validate ObjectId
// ==============================
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ==============================
//  Get all payslips of logged-in employee
// ==============================
const getPayslips = async (req, res) => {
  try {
    const { employeeId, id: userId } = req.user;
    const { year, month } = req.query;

    if (!employeeId) {
      await AuditLog.create({
        action: "PAYSLIP_ACCESS_DENIED",
        userId,
        details: "User attempted to access payslips without employeeId",
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      return res.status(403).json({
        success: false,
        message: "Access denied: Employee record missing",
      });
    }

    const query = { employeeId, status: "published" };
    if (year) query.year = Number(year);
    if (month) query.month = Number(month);

    const payslips = await Payslip.find(query)
      .sort({ year: -1, month: -1 })
      .select("-pdfUrl"); // Hide PDF URL for security

    await AuditLog.create({
      action: "PAYSLIPS_ACCESSED",
      userId,
      employeeId,
      details: `Accessed ${payslips.length} payslips`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    return res.json({ success: true, count: payslips.length, data: payslips });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching payslips",
      error: error.message,
    });
  }
};

// ==============================
//  Get single payslip by ID
// ==============================
const getPayslipById = async (req, res) => {
  try {
    const { employeeId, id: userId } = req.user;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payslip ID",
      });
    }

    if (!employeeId) {
      await AuditLog.create({
        action: "PAYSLIP_ACCESS_DENIED",
        userId,
        details: `User attempted to access single payslip ${id}`,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const payslip = await Payslip.findOne({
      _id: id,
      employeeId,
      status: "published",
    });

    if (!payslip) {
      await AuditLog.create({
        action: "PAYSLIP_ACCESS_FAILED",
        userId,
        employeeId,
        details: `Payslip ${id} not found or unauthorized`,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      return res.status(404).json({
        success: false,
        message: "Payslip not found",
      });
    }

    await AuditLog.create({
      action: "PAYSLIP_VIEWED",
      userId,
      employeeId,
      resource: payslip._id,
      details: `Viewed payslip ${payslip.month}/${payslip.year}`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    return res.json({ success: true, data: payslip });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching payslip",
      error: error.message,
    });
  }
};

// ==============================
//  Download Payslip PDF
// ==============================
const downloadPayslip = async (req, res) => {
  try {
    const { employeeId, id: userId } = req.user;
    const { id } = req.params;

    if (!employeeId) {
      await AuditLog.create({
        action: "PAYSLIP_DOWNLOAD_DENIED",
        userId,
        details: `User attempted to download payslip ${id}`,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payslip ID",
      });
    }

    const payslip = await Payslip.findOne({
      _id: id,
      employeeId,
      status: "published",
    }).populate("employeeId", "employeeId personalInfo");

    if (!payslip) {
      await AuditLog.create({
        action: "PAYSLIP_DOWNLOAD_FAILED",
        userId,
        employeeId,
        details: `Payslip ${id} not found or unauthorized`,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      return res.status(404).json({
        success: false,
        message: "Payslip not found",
      });
    }

    // PDF not generated yet
    if (!payslip.pdfUrl) {
      return res.status(501).json({
        success: false,
        message: "PDF generation not implemented",
      });
    }

    // Log the download
    await AuditLog.create({
      action: "PAYSLIP_DOWNLOADED",
      userId,
      employeeId,
      resource: payslip._id,
      details: `Downloaded payslip PDF for ${payslip.month}/${payslip.year}`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // If PDF stored locally
    if (payslip.pdfUrl.startsWith("/uploads/")) {
      return res.download(
        payslip.pdfUrl,
        `payslip-${payslip.month}-${payslip.year}.pdf`
      );
    }

    // If PDF stored on external storage (AWS, GDrive, etc)
    return res.redirect(payslip.pdfUrl);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error downloading payslip",
      error: error.message,
    });
  }
};

export default {
  getPayslips,
  getPayslipById,
  downloadPayslip,
};
