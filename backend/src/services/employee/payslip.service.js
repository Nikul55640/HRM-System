import { Payslip, Employee } from '../../models/sequelize/index.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';

const getPayslips = async (employeeId, options = {}) => {
  try {
    const { limit = 12, offset = 0, year, month } = options;
    
    const whereClause = { employeeId };
    
    if (year) {
      whereClause.year = year;
    }
    
    if (month) {
      whereClause.month = month;
    }

    const { rows: payslips, count: total } = await Payslip.findAndCountAll({
      where: whereClause,
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

const getPayslipById = async (employeeId, payslipId) => {
  try {
    const payslip = await Payslip.findOne({
      where: {
        id: payslipId,
        employeeId
      },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employeeId', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!payslip) {
      throw {
        code: 'PAYSLIP_NOT_FOUND',
        message: 'Payslip not found',
        statusCode: 404
      };
    }

    return payslip;
  } catch (error) {
    logger.error('Error getting payslip by ID:', error);
    throw error;
  }
};

const getLatestPayslip = async (employeeId) => {
  try {
    const payslip = await Payslip.findOne({
      where: { employeeId },
      order: [['year', 'DESC'], ['month', 'DESC']],
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['employeeId', 'firstName', 'lastName', 'email']
        }
      ]
    });

    return payslip;
  } catch (error) {
    logger.error('Error getting latest payslip:', error);
    throw error;
  }
};

const getYearlyPayslips = async (employeeId, year) => {
  try {
    const payslips = await Payslip.findAll({
      where: {
        employeeId,
        year
      },
      order: [['month', 'ASC']]
    });

    // Calculate yearly totals
    const yearlyTotals = payslips.reduce((totals, payslip) => {
      totals.grossSalary += payslip.grossSalary || 0;
      totals.netSalary += payslip.netSalary || 0;
      totals.totalDeductions += payslip.totalDeductions || 0;
      totals.totalAllowances += payslip.totalAllowances || 0;
      return totals;
    }, {
      grossSalary: 0,
      netSalary: 0,
      totalDeductions: 0,
      totalAllowances: 0
    });

    return {
      payslips,
      yearlyTotals,
      year
    };
  } catch (error) {
    logger.error('Error getting yearly payslips:', error);
    throw error;
  }
};

export default {
  getPayslips,
  getPayslipById,
  getLatestPayslip,
  getYearlyPayslips
};