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
    const employeeWhere = {};
    if (department) employeeWhere.department = department;
    if (status) employeeWhere.status = status;

    // Get leave balances with employee info
    const balances = await LeaveBalance.findAll({
      where: {
        year: parseInt(year)
      },
      include: [
        {
          model: Employee,
          as: 'employee',
          where: employeeWhere,
          attributes: ['id', 'employeeId', 'personalInfo', 'department', 'status'],
          required: true,
        },
      ],
      order: [['employee', 'personalInfo', 'firstName']],
    });

    // Group by employee
    const employeeBalances = {};
    balances.forEach(balance => {
      const empId = balance.employee.id;
      if (!employeeBalances[empId]) {
        employeeBalances[empId] = {
          employee: balance.employee,
          year: balance.year,
          leaveTypes: {},
        };
      }
      employeeBalances[empId].leaveTypes[balance.leaveType] = {
        allocated: balance.allocated,
        used: balance.used,
        pending: balance.pending,
        available: balance.remaining,
      };
    });

    // Transform to array format
    const transformedBalances = Object.values(employeeBalances).map(emp => ({
      employee: emp.employee,
      year: emp.year,
      annualLeave: emp.leaveTypes.annual || { allocated: 0, available: 0, used: 0, pending: 0 },
      sickLeave: emp.leaveTypes.sick || { allocated: 0, available: 0, used: 0, pending: 0 },
      casualLeave: emp.leaveTypes.personal || { allocated: 0, available: 0, used: 0, pending: 0 },
      unpaidLeave: emp.leaveTypes.unpaid || { allocated: 0, available: 0, used: 0, pending: 0 },
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
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Update leave types
    const updateLeaveType = async (type, allocated) => {
      if (allocated === undefined) return;
      
      let leaveBalance = await LeaveBalance.findOne({
        where: {
          employeeId,
          year: parseInt(year),
          leaveType: type,
        },
      });

      if (leaveBalance) {
        // Update existing
        await leaveBalance.update({
          allocated,
          remaining: allocated - (leaveBalance.used + leaveBalance.pending),
        });
      } else {
        // Create new
        await LeaveBalance.create({
          employeeId,
          year: parseInt(year),
          leaveType: type,
          allocated,
          used: 0,
          pending: 0,
          remaining: allocated,
        });
      }
    };

    await updateLeaveType('annual', annualLeave);
    await updateLeaveType('sick', sickLeave);
    await updateLeaveType('personal', casualLeave);
    await updateLeaveType('unpaid', unpaidLeave);

    // Get updated balances
    const updatedBalances = await LeaveBalance.findAll({
      where: {
        employeeId,
        year: parseInt(year),
      },
    });

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

    logger.info(`Leave balance assigned for employee ${employeeId} by ${req.user.id}`);

    res.json({
      success: true,
      data: updatedBalances,
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
