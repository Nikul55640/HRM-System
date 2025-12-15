import logger from "../../utils/logger.js";
import LeaveBalance from "../../models/sequelize/LeaveBalance.js";
import Employee from "../../models/sequelize/Employee.js";
import AuditLog from "../../models/sequelize/AuditLog.js";

/**
 * Get all employees' leave balances
 * GET /api/admin/leave/balances
 */
const getAllLeaveBalances = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), department, status } = req.query;

    // Build employee query
    const employeeQuery = {};
    if (department) employeeQuery.department = department;
    if (status) employeeQuery.status = status;

    // Get employees matching criteria
    const employees = await Employee.find(employeeQuery).select('_id');
    const employeeIds = employees.map(e => e._id);

    // Get leave balances for these employees
    const balances = await LeaveBalance.find({
      employeeId: { $in: employeeIds },
      year: parseInt(year)
    })
      .populate('employeeId', 'employeeId personalInfo department status')
      .sort({ 'employeeId.personalInfo.firstName': 1 });

    // Transform to match frontend expectations
    const transformedBalances = balances.map(balance => ({
      _id: balance._id,
      employee: balance.employeeId,
      year: balance.year,
      annualLeave: balance.leaveTypes.find(lt => lt.type === 'annual') || { total: 0, available: 0, used: 0, pending: 0 },
      sickLeave: balance.leaveTypes.find(lt => lt.type === 'sick') || { total: 0, available: 0, used: 0, pending: 0 },
      casualLeave: balance.leaveTypes.find(lt => lt.type === 'personal') || { total: 0, available: 0, used: 0, pending: 0 },
      unpaidLeave: balance.leaveTypes.find(lt => lt.type === 'unpaid') || { total: 0, available: 0, used: 0, pending: 0 },
    }));

    res.json({
      success: true,
      data: transformedBalances,
      year: parseInt(year)
    });
  } catch (error) {
    logger.error('Error fetching leave balances:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leave balances',
      error: error.message
    });
  }
};

/**
 * Assign or update leave balance for an employee
 * POST /api/admin/leave/assign/:employeeId
 */
const assignLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { annualLeave, sickLeave, casualLeave, unpaidLeave, year = new Date().getFullYear() } = req.body;

    // Validate employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Find or create leave balance
    let leaveBalance = await LeaveBalance.findOne({
      employeeId,
      year: parseInt(year)
    });

    if (!leaveBalance) {
      // Create new leave balance
      leaveBalance = new LeaveBalance({
        employeeId,
        year: parseInt(year),
        leaveTypes: []
      });
    }

    // Update leave types
    const updateLeaveType = (type, allocated) => {
      const existing = leaveBalance.leaveTypes.find(lt => lt.type === type);
      if (existing) {
        existing.allocated = allocated;
        // Recalculate available (allocated - used - pending)
        existing.available = allocated - (existing.used + existing.pending);
      } else {
        leaveBalance.leaveTypes.push({
          type,
          allocated,
          used: 0,
          pending: 0,
          available: allocated
        });
      }
    };

    if (annualLeave !== undefined) updateLeaveType('annual', annualLeave);
    if (sickLeave !== undefined) updateLeaveType('sick', sickLeave);
    if (casualLeave !== undefined) updateLeaveType('personal', casualLeave);
    if (unpaidLeave !== undefined) updateLeaveType('unpaid', unpaidLeave);

    await leaveBalance.save();

    // Audit log
    await AuditLog.create({
      action: 'UPDATE',
      userId: req.user.id,
      userRole: req.user.role,
      entityType: 'Employee',
      entityId: employeeId,
      details: `Assigned leave balance for year ${parseInt(year)}: Annual=${annualLeave}, Sick=${sickLeave}, Casual=${casualLeave}, Unpaid=${unpaidLeave}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Leave balance assigned for employee ${employeeId} by ${req.user._id}`);

    res.json({
      success: true,
      data: leaveBalance,
      message: 'Leave balance assigned successfully'
    });
  } catch (error) {
    logger.error('Error assigning leave balance:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning leave balance',
      error: error.message
    });
  }
};

export default {
  getAllLeaveBalances,
  assignLeaveBalance
};
