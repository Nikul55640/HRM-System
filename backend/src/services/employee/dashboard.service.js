import { Employee, User, AuditLog, LeaveBalance } from '../../models/sequelize/index.js';
import logger from '../../utils/logger.js';

// ------------------------------
// FUNCTIONS
// ------------------------------

const getEmployeeProfileSummary = async (user) => {
  try {
    if (!user.employee?.id) {
      return {
        fullName: user.email.split('@')[0],
        email: user.email,
        jobTitle: user.role,
        status: user.isActive ? 'Active' : 'Inactive',
        isSystemUser: true,
      };
    }

    // Find employee by userId instead of using user.employee.id
    const employee = await Employee.findOne({
      where: { userId: user.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['email']
        }
      ]
    });

    if (!employee) {
      throw {
        code: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee profile not found.',
        statusCode: 404,
      };
    }

    return {
      employeeId: employee.employeeId,
      fullName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown',
      profilePhoto: employee.profilePicture || null,
      email: employee.user?.email || user.email,
      phoneNumber: employee.phone || '',
      jobTitle: employee.designation || '',
      department: employee.department || '',
      manager: employee.reportingManager || null,
      hireDate: employee.joiningDate || null,
      employmentType: employee.employmentType || '',
      workLocation: 'Office',
      status: employee.status || 'Active',
    };
  } catch (error) {
    logger.error('Error getting employee profile summary:', error);
    throw error;
  }
};

const getLeaveBalance = async (user) => {
  try {
    if (!user.employee?.id) {
      return { message: 'Leave tracking not applicable for system users' };
    }

    // Find employee by userId
    const employee = await Employee.findOne({
      where: { userId: user.id },
      attributes: ['id']
    });

    if (!employee) {
      return { message: 'Employee profile not found' };
    }

    const currentYear = new Date().getFullYear();
    
    // Get all leave balance records for the employee and year
    const leaveBalances = await LeaveBalance.findAll({
      where: {
        employeeId: employee.id,
        year: currentYear
      }
    });

    if (!leaveBalances || leaveBalances.length === 0) {
      return { message: 'No leave balances assigned' };
    }

    // Transform to the expected format
    const data = {};
    leaveBalances.forEach((balance) => {
      data[balance.leaveType.toLowerCase()] = {
        total: balance.allocated,
        used: balance.used,
        pending: balance.pending,
        remaining: balance.remaining,
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
    if (!user.employee?.id) {
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
  const { limit = 20, offset = 0 } = options;
  
  try {

    // Find employee by userId if needed
    let employeeId = null;
    if (user.employee?.id) {
      const employee = await Employee.findOne({
        where: { userId: user.id },
        attributes: ['id']
      });
      employeeId = employee?.id;
    }

    const whereClause = employeeId
      ? { targetType: 'Employee', targetId: employeeId }
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
      changes: log.metadata?.changes || [],
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
    // Return empty activity instead of throwing error
    return {
      activities: [],
      pagination: {
        total: 0,
        limit,
        offset,
        hasMore: false,
      },
    };
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