import { Payslip, Employee, SalaryStructure } from '../../models/sequelize/index.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';

const generatePayslip = async (employeeId, month, year) => {
  try {
    // Check if payslip already exists
    const existingPayslip = await Payslip.findOne({
      where: {
        employeeId,
        month,
        year
      }
    });

    if (existingPayslip) {
      throw {
        code: 'PAYSLIP_EXISTS',
        message: 'Payslip already exists for this period',
        statusCode: 400
      };
    }

    // Get employee details
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      throw {
        code: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee not found',
        statusCode: 404
      };
    }

    // Get salary structure
    const salaryStructure = await SalaryStructure.findOne({
      where: { employeeId }
    });

    if (!salaryStructure) {
      throw {
        code: 'SALARY_STRUCTURE_NOT_FOUND',
        message: 'Salary structure not found for employee',
        statusCode: 404
      };
    }

    // Calculate payslip
    const basicSalary = salaryStructure.basicSalary || 0;
    const allowances = salaryStructure.allowances || [];
    const deductions = salaryStructure.deductions || [];

    const totalAllowances = allowances.reduce((sum, allowance) => sum + (allowance.amount || 0), 0);
    const totalDeductions = deductions.reduce((sum, deduction) => sum + (deduction.amount || 0), 0);

    const grossSalary = basicSalary + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    const payslip = await Payslip.create({
      employeeId,
      month,
      year,
      basicSalary,
      allowances,
      deductions,
      totalAllowances,
      totalDeductions,
      grossSalary,
      netSalary,
      status: 'generated'
    });

    return payslip;
  } catch (error) {
    logger.error('Error generating payslip:', error);
    throw error;
  }
};

const getPayslips = async (options = {}) => {
  try {
    const { limit = 50, offset = 0, month, year, employeeId } = options;
    
    const whereClause = {};
    
    if (month) whereClause.month = month;
    if (year) whereClause.year = year;
    if (employeeId) whereClause.employeeId = employeeId;

    const { rows: payslips, count: total } = await Payslip.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employeeId', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['year', 'DESC'], ['month', 'DESC']],
      limit,
      offset
    });

    return {
      payslips,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + payslips.length < total
      }
    };
  } catch (error) {
    logger.error('Error getting payslips:', error);
    throw error;
  }
};

const updatePayslip = async (payslipId, updateData) => {
  try {
    const payslip = await Payslip.findByPk(payslipId);
    
    if (!payslip) {
      throw {
        code: 'PAYSLIP_NOT_FOUND',
        message: 'Payslip not found',
        statusCode: 404
      };
    }

    await payslip.update(updateData);
    return payslip;
  } catch (error) {
    logger.error('Error updating payslip:', error);
    throw error;
  }
};

const deletePayslip = async (payslipId) => {
  try {
    const payslip = await Payslip.findByPk(payslipId);
    
    if (!payslip) {
      throw {
        code: 'PAYSLIP_NOT_FOUND',
        message: 'Payslip not found',
        statusCode: 404
      };
    }

    await payslip.destroy();
    return { message: 'Payslip deleted successfully' };
  } catch (error) {
    logger.error('Error deleting payslip:', error);
    throw error;
  }
};

const bulkGeneratePayslips = async (month, year, employeeIds = []) => {
  try {
    const results = [];
    
    // If no specific employees, get all active employees
    let employees;
    if (employeeIds.length > 0) {
      employees = await Employee.findAll({
        where: {
          id: { [Op.in]: employeeIds },
          status: 'Active'
        }
      });
    } else {
      employees = await Employee.findAll({
        where: { status: 'Active' }
      });
    }

    for (const employee of employees) {
      try {
        const payslip = await generatePayslip(employee.id, month, year);
        results.push({
          employeeId: employee.id,
          success: true,
          payslip
        });
      } catch (error) {
        results.push({
          employeeId: employee.id,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  } catch (error) {
    logger.error('Error bulk generating payslips:', error);
    throw error;
  }
};

export default {
  generatePayslip,
  getPayslips,
  updatePayslip,
  deletePayslip,
  bulkGeneratePayslips
};