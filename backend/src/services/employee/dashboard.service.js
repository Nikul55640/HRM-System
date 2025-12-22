import { Employee, AuditLog, LeaveBalance } from '../../models/sequelize/index.js';
import logger from '../../utils/logger.js';

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

    const employee = await Employee.findByPk(user.employeeId);

    if (!employee) {
      throw {
        code: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee profile not found.',
        statusCode: 404,
      };
    }

    // Extract data from JSON fields
    const personalInfo = employee.personalInfo || {};
    const jobInfo = employee.jobInfo || {};
    const contactInfo = employee.contactInfo || {};

    return {
      employeeId: employee.employeeId,
      fullName: `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim() || 'Unknown',
      profilePhoto: personalInfo.profilePhoto || null,
      email: contactInfo.email || personalInfo.email || '',
      phoneNumber: contactInfo.phone || personalInfo.phone || '',
      jobTitle: jobInfo.designation || jobInfo.jobTitle || '',
      department: jobInfo.department || '',
      manager: jobInfo.manager || null,
      hireDate: jobInfo.joiningDate || jobInfo.hireDate || null,
      employmentType: jobInfo.employeeType || jobInfo.employmentType || '',
      workLocation: jobInfo.workLocation || 'Office',
      status: employee.status || 'Active',
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

    const currentYear = new Date().getFullYear();
    let leaveBalance = await LeaveBalance.findOne({
      where: {
        employeeId: user.employeeId,
        year: currentYear
      }
    });

    if (!leaveBalance) {
      leaveBalance = await LeaveBalance.create({
        employeeId: user.employeeId,
        year: currentYear,
        leaveTypes: [
          { type: 'annual', allocated: 20, used: 0, pending: 0, available: 20 },
          { type: 'sick', allocated: 10, used: 0, pending: 0, available: 10 },
          { type: 'personal', allocated: 5, used: 0, pending: 0, available: 5 },
        ],
      });
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
    const { limit = 20, offset = 0 } = options;

    const whereClause = user.employeeId
      ? { entityType: 'Employee', entityId: user.employeeId }
      : {};

    const { rows: logs, count: total } = await AuditLog.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    const activities = logs.map((log) => ({
      id: log.id,
      action: log.action,
      timestamp: log.createdAt,
      performedBy: {
        email: log.performedByEmail || 'System',
        role: log.userRole || 'System'
      },
      description: formatActivityDescription(log),
      changes: log.meta?.changes || [],
    }));

    return {
      activities,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + activities.length < total,
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