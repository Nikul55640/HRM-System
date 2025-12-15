import { Employee, AuditLog } from '../models/sequelize/index.js';
import logger from '../utils/logger.js';

// ------------------------------
// FUNCTIONS
// ------------------------------

const getEmployeeProfileSummary = async (user) => {
  try {
    if (!user.employeeId) {
      return {
        fullName: user.email.split('@')[0],
        email: user.email,
        jobTitle: user.role,
        status: user.isActive ? 'Active' : 'Inactive',
        isSystemUser: true,
      };
    }

    const employee = await Employee.findById(user.employeeId)
      .populate('jobInfo.department', 'name code location')
      .populate('jobInfo.manager', 'personalInfo.firstName personalInfo.lastName employeeId contactInfo.email')
      .lean();

    if (!employee) {
      throw {
        code: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee profile not found.',
        statusCode: 404,
      };
    }

    return {
      employeeId: employee.employeeId,
      fullName: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`,
      profilePhoto: employee.personalInfo.profilePhoto,
      email: employee.contactInfo.email,
      phoneNumber: employee.contactInfo.phoneNumber,
      jobTitle: employee.jobInfo.jobTitle,
      department: employee.jobInfo.department,
      manager: employee.jobInfo.manager
        ? {
            name: `${employee.jobInfo.manager.personalInfo.firstName} ${employee.jobInfo.manager.personalInfo.lastName}`,
            employeeId: employee.jobInfo.manager.employeeId,
            email: employee.jobInfo.manager.contactInfo.email,
          }
        : null,
      hireDate: employee.jobInfo.hireDate,
      employmentType: employee.jobInfo.employmentType,
      workLocation: employee.jobInfo.workLocation,
      status: employee.status,
    };
  } catch (error) {
    logger.error('Error getting employee profile summary:', error);
    throw error;
  }
};

const getLeaveBalance = async (user) => {
  try {
    if (!user.employeeId) {
      return { message: 'Leave tracking not applicable for system users' };
    }

    const { default: LeaveBalance } = await import('../models/sequelize/LeaveBalance.js');

    const currentYear = new Date().getFullYear();
    let leaveBalance = await LeaveBalance.findByEmployeeAndYear(user.employeeId, currentYear);

    if (!leaveBalance) {
      leaveBalance = new LeaveBalance({
        employeeId: user.employeeId,
        year: currentYear,
        leaveTypes: [
          { type: 'annual', allocated: 20, used: 0, pending: 0, available: 20 },
          { type: 'sick', allocated: 10, used: 0, pending: 0, available: 10 },
          { type: 'personal', allocated: 5, used: 0, pending: 0, available: 5 },
        ],
      });
      await leaveBalance.save();
    }

    const data = {};
    leaveBalance.leaveTypes.forEach((type) => {
      data[type.type] = {
        total: type.allocated,
        used: type.used,
        pending: type.pending,
        remaining: type.available,
      };
    });

    return data;
  } catch (error) {
    logger.error('Error getting leave balance:', error);
    return { message: 'Error loading leave balance' };
  }
};

const getAttendanceRecords = async (user, options = {}) => {
  try {
    if (!user.employeeId) {
      return {
        records: [],
        summary: { totalDays: 0, presentDays: 0, absentDays: 0, lateDays: 0 },
        message: 'Attendance tracking not applicable for system users',
      };
    }

    return {
      records: [],
      summary: { totalDays: 0, presentDays: 0, absentDays: 0, lateDays: 0 },
      message: 'Attendance module not yet implemented',
    };
  } catch (error) {
    logger.error('Error getting attendance records:', error);
    throw error;
  }
};

const formatActivityDescription = (log) => {
  const map = {
    CREATE: 'Profile created',
    UPDATE: 'Profile updated',
    DELETE: 'Profile deactivated',
    VIEW: 'Profile viewed',
  };

  let text = map[log.action] || log.action;

  if (log.action === 'UPDATE' && log.changes?.length > 0) {
    const changes = log.changes.map((c) => c.field).join(', ');
    text += ` - ${changes}`;
  }

  return text;
};

const getRecentActivity = async (user, options = {}) => {
  try {
    const { limit = 20, skip = 0 } = options;

    const filter = user.employeeId
      ? { entityType: 'Employee', entityId: user.employeeId }
      : {};

    const logs = await AuditLog.find(filter)
      .populate('userId', 'email role')
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const activities = logs.map((log) => ({
      id: log._id,
      action: log.action,
      timestamp: log.timestamp,
      performedBy: log.userId
        ? { email: log.userId.email, role: log.userId.role }
        : null,
      description: formatActivityDescription(log),
      changes: log.changes,
    }));

    const total = await AuditLog.countDocuments(filter);

    return {
      activities,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + activities.length < total,
      },
    };
  } catch (error) {
    logger.error('Error getting recent activity:', error);
    throw error;
  }
};

const getDashboardData = async (user, options = {}) => {
  try {
    const [profile, leave, attendance, activity] = await Promise.all([
      getEmployeeProfileSummary(user),
      getLeaveBalance(user),
      getAttendanceRecords(user, { limit: options.attendanceLimit || 10 }),
      getRecentActivity(user, { limit: options.activityLimit || 20 }),
    ]);

    return {
      profile,
      leave,
      attendance,
      recentActivity: activity.activities,
      activityPagination: activity.pagination,
    };
  } catch (error) {
    logger.error('Error getting dashboard data:', error);
    throw error;
  }
};

// ------------------------------
// DEFAULT EXPORT (AS OBJECT)
// ------------------------------

export default {
  getEmployeeProfileSummary,
  getLeaveBalance,
  getAttendanceRecords,
  getRecentActivity,
  getDashboardData,
};
