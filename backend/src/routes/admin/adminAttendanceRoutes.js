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
const getAttendanceRecords = async (req, res) => {
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
};

// Mount the handler on both routes for compatibility
router.get(
  "/",
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  getAttendanceRecords
);

// Add /records alias for frontend compatibility
router.get(
  "/records",
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  getAttendanceRecords
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

// Clear test attendance data
// Permission: EDIT_ANY (Admin only)
router.delete(
  "/clear-test-data",
  checkPermission(MODULES.ATTENDANCE.EDIT_ANY),
  async (req, res) => {
    try {
      console.log("🧹 [ADMIN ATTENDANCE] Clearing test attendance data");

      const today = new Date();
      const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      // Delete today's attendance records
      const result = await AttendanceRecord.deleteMany({
        date: dateOnly,
      });

      console.log(`✅ [ADMIN ATTENDANCE] Cleared ${result.deletedCount} attendance records`);

      res.status(200).json({
        success: true,
        message: `Cleared ${result.deletedCount} attendance records for today`,
        data: result.deletedCount,
      });
    } catch (error) {
      console.error("❌ [ADMIN ATTENDANCE] Failed to clear test data:", error);
      res.status(500).json({
        success: false,
        message: "Error clearing test attendance data",
        error: error.message,
      });
    }
  }
);

// Create test attendance data
// Permission: EDIT_ANY (Admin only)
router.post(
  "/create-test-data",
  checkPermission(MODULES.ATTENDANCE.EDIT_ANY),
  async (req, res) => {
    try {
      console.log("🧪 [ADMIN ATTENDANCE] Creating test attendance data");

      const today = new Date();
      const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      // Find some employees to create test data for
      const employees = await Employee.find({ status: 'Active' }).limit(3).lean();
      
      if (employees.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No active employees found to create test data",
        });
      }

      const testRecords = [];

      for (const employee of employees) {
        // Check if already has attendance today
        const existingRecord = await AttendanceRecord.findOne({
          employeeId: employee._id,
          date: dateOnly,
        });

        if (existingRecord) {
          console.log(`Employee ${employee.personalInfo?.firstName} already has attendance today`);
          continue;
        }

        // Create test attendance record
        const checkInTime = new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000); // Random time in last 4 hours
        const workLocations = ['office', 'wfh', 'client_site'];
        const workLocation = workLocations[Math.floor(Math.random() * workLocations.length)];

        const newRecord = new AttendanceRecord({
          employeeId: employee._id,
          date: dateOnly,
          checkIn: checkInTime,
          sessions: [{
            checkIn: checkInTime,
            workLocation: workLocation,
            locationDetails: workLocation === 'office' ? 'Main Office' : workLocation === 'wfh' ? 'Home Office' : 'Client Site',
            ipAddressCheckIn: '192.168.1.100',
            status: Math.random() > 0.3 ? 'active' : 'on_break', // 70% active, 30% on break
            breaks: Math.random() > 0.5 ? [{
              startTime: new Date(checkInTime.getTime() + 2 * 60 * 60 * 1000), // 2 hours after check-in
              endTime: new Date(checkInTime.getTime() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000), // 15 min break
              durationMinutes: 15,
            }] : [],
            totalBreakMinutes: Math.random() > 0.5 ? 15 : 0,
          }],
          status: 'present',
        });

        await newRecord.save();
        testRecords.push(newRecord);
      }

      console.log(`✅ [ADMIN ATTENDANCE] Created ${testRecords.length} test records`);

      res.status(201).json({
        success: true,
        message: `Created ${testRecords.length} test attendance records`,
        data: testRecords.length,
      });
    } catch (error) {
      console.error("❌ [ADMIN ATTENDANCE] Failed to create test data:", error);
      res.status(500).json({
        success: false,
        message: "Error creating test attendance data",
        error: error.message,
      });
    }
  }
);

// Export attendance report
// Permission: VIEW_ALL or VIEW_TEAM
router.get(
  "/export",
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  async (req, res) => {
    try {
      console.log("📊 [ADMIN ATTENDANCE] Exporting attendance report");

      // For now, return a simple CSV format
      // In production, you'd use a library like xlsx or csv-writer
      const { startDate, endDate } = req.query;
      const query = {};

      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const records = await AttendanceRecord.find(query)
        .populate("employeeId", "personalInfo employeeNumber")
        .sort({ date: -1 })
        .lean();

      // Create CSV content
      const csvHeader = "Employee ID,Employee Name,Date,Check In,Check Out,Work Hours,Status\n";
      const csvRows = records.map(record => {
        const employeeName = record.employeeId 
          ? `${record.employeeId.personalInfo?.firstName || ''} ${record.employeeId.personalInfo?.lastName || ''}`.trim()
          : 'Unknown';
        
        return [
          record.employeeId?.employeeNumber || 'N/A',
          employeeName,
          record.date ? new Date(record.date).toLocaleDateString() : 'N/A',
          record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : 'N/A',
          record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : 'N/A',
          record.workHours || 'N/A',
          record.status || 'N/A'
        ].join(',');
      }).join('\n');

      const csvContent = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);

      console.log("✅ [ADMIN ATTENDANCE] Report exported successfully");

    } catch (error) {
      console.error("❌ [ADMIN ATTENDANCE] Failed to export report:", error);
      res.status(500).json({
        success: false,
        message: "Error exporting attendance report",
        error: error.message,
      });
    }
  }
);

export default router;
