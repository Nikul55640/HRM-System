import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import {
  checkPermission,
  checkAnyPermission,
} from "../../middleware/checkPermission.js";
import { MODULES } from "../../config/rolePermissions.js";
import AttendanceRecord from "../../models/AttendanceRecord.js";
import Employee from "../../models/Employee.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get all attendance records
// Permission: VIEW_ALL or VIEW_TEAM
router.get(
  "/",
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  async (req, res) => {
    try {
      console.log("📅 [ADMIN ATTENDANCE] Fetching all attendance records");

      const {
        startDate,
        endDate,
        employeeId,
        status,
        page = 1,
        limit = 50,
      } = req.query;

      const query = {};

      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      if (employeeId) {
        query.employeeId = employeeId;
      }

      if (status) {
        query.status = status;
      }

      const skip = (page - 1) * limit;

      const [records, total] = await Promise.all([
        AttendanceRecord.find(query)
          .populate("employeeId", "personalInfo employeeNumber")
          .sort({ date: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        AttendanceRecord.countDocuments(query),
      ]);

      console.log("✅ [ADMIN ATTENDANCE] Records fetched:", records.length);

      res.status(200).json({
        success: true,
        data: records,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("❌ [ADMIN ATTENDANCE] Failed to fetch records:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching attendance records",
        error: error.message,
      });
    }
  }
);

// Get attendance statistics
// Permission: VIEW_ANALYTICS
router.get(
  "/statistics",
  checkPermission(MODULES.ATTENDANCE.VIEW_ANALYTICS),
  async (req, res) => {
    try {
      console.log("📊 [ADMIN ATTENDANCE] Fetching statistics");

      const { startDate, endDate } = req.query;
      const query = {};

      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const stats = await AttendanceRecord.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const totalEmployees = await Employee.countDocuments({ isActive: true });

      console.log("✅ [ADMIN ATTENDANCE] Statistics fetched");

      res.status(200).json({
        success: true,
        data: {
          stats,
          totalEmployees,
        },
      });
    } catch (error) {
      console.error("❌ [ADMIN ATTENDANCE] Failed to fetch statistics:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching attendance statistics",
        error: error.message,
      });
    }
  }
);

// Get attendance by employee ID
// Permission: VIEW_ALL, VIEW_TEAM, or VIEW_OWN
router.get(
  "/:employeeId",
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
    MODULES.ATTENDANCE.VIEW_OWN,
  ]),
  async (req, res) => {
    try {
      console.log(
        "📅 [ADMIN ATTENDANCE] Fetching attendance for employee:",
        req.params.employeeId
      );

      const { startDate, endDate } = req.query;
      const query = { employeeId: req.params.employeeId };

      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const records = await AttendanceRecord.find(query)
        .sort({ date: -1 })
        .lean();

      console.log(
        "✅ [ADMIN ATTENDANCE] Employee records fetched:",
        records.length
      );

      res.status(200).json({
        success: true,
        data: records,
      });
    } catch (error) {
      console.error(
        "❌ [ADMIN ATTENDANCE] Failed to fetch employee records:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Error fetching employee attendance",
        error: error.message,
      });
    }
  }
);

// Create manual attendance entry
// Permission: EDIT_ANY
router.post(
  "/manual",
  checkPermission(MODULES.ATTENDANCE.EDIT_ANY),
  async (req, res) => {
    try {
      console.log("➕ [ADMIN ATTENDANCE] Creating manual entry");

      const record = new AttendanceRecord(req.body);
      await record.save();

      console.log("✅ [ADMIN ATTENDANCE] Manual entry created:", record._id);

      res.status(201).json({
        success: true,
        data: record,
        message: "Attendance record created successfully",
      });
    } catch (error) {
      console.error(
        "❌ [ADMIN ATTENDANCE] Failed to create manual entry:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Error creating attendance record",
        error: error.message,
      });
    }
  }
);

// Update attendance record
// Permission: EDIT_ANY or APPROVE_CORRECTION
router.put(
  "/:id",
  checkAnyPermission([
    MODULES.ATTENDANCE.EDIT_ANY,
    MODULES.ATTENDANCE.APPROVE_CORRECTION,
  ]),
  async (req, res) => {
    try {
      console.log("✏️ [ADMIN ATTENDANCE] Updating record:", req.params.id);

      const record = await AttendanceRecord.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!record) {
        return res.status(404).json({
          success: false,
          message: "Attendance record not found",
        });
      }

      console.log("✅ [ADMIN ATTENDANCE] Record updated");

      res.status(200).json({
        success: true,
        data: record,
        message: "Attendance record updated successfully",
      });
    } catch (error) {
      console.error("❌ [ADMIN ATTENDANCE] Failed to update record:", error);
      res.status(500).json({
        success: false,
        message: "Error updating attendance record",
        error: error.message,
      });
    }
  }
);

// Delete attendance record
// Permission: EDIT_ANY (HR only)
router.delete(
  "/:id",
  checkPermission(MODULES.ATTENDANCE.EDIT_ANY),
  async (req, res) => {
    try {
      console.log("🗑️ [ADMIN ATTENDANCE] Deleting record:", req.params.id);

      const record = await AttendanceRecord.findByIdAndDelete(req.params.id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: "Attendance record not found",
        });
      }

      console.log("✅ [ADMIN ATTENDANCE] Record deleted");

      res.status(200).json({
        success: true,
        message: "Attendance record deleted successfully",
      });
    } catch (error) {
      console.error("❌ [ADMIN ATTENDANCE] Failed to delete record:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting attendance record",
        error: error.message,
      });
    }
  }
);

export default router;
