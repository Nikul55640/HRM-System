import { LeaveRequest, LeaveBalance, Employee } from '../../models/index.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';
import LeaveCalculationService from '../core/leaveCalculation.service.js';

const submitLeaveRequest = async (employeeId, leaveData) => {
  try {
    const { startDate, endDate, leaveType, reason, isHalfDay = false } = leaveData;

    // Calculate days using centralized service
    const durationResult = await LeaveCalculationService.calculateLeaveDuration(
      startDate, 
      endDate, 
      isHalfDay
    );
    const days = durationResult.totalDays;

    // Check leave balance using centralized service
    const balanceValidation = await LeaveCalculationService.validateLeaveBalance(
      employeeId,
      leaveType,
      days
    );

    if (!balanceValidation.isValid) {
      throw {
        code: 'INSUFFICIENT_BALANCE',
        message: balanceValidation.reason,
        statusCode: 400
      };
    }

    const leaveRequest = await LeaveRequest.create({
      employeeId,
      startDate: startDate,
      endDate: endDate,
      leaveType,
      reason,
      days,
      isHalfDay,
      status: 'pending'
    });

    return leaveRequest;
  } catch (error) {
    logger.error('Error submitting leave request:', error);
    throw error;
  }
};

const getLeaveRequests = async (employeeId, options = {}) => {
  try {
    const { limit = 20, offset = 0, status } = options;
    
    const whereClause = { employeeId };
    if (status) {
      whereClause.status = status;
    }

    const { rows: requests, count: total } = await LeaveRequest.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      requests,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + requests.length < total
      }
    };
  } catch (error) {
    logger.error('Error getting leave requests:', error);
    throw error;
  }
};

const getLeaveBalance = async (employeeId, year = null) => {
  try {
    const targetYear = year || new Date().getFullYear();
    
    // Get all leave balance records for the employee and year
    const leaveBalances = await LeaveBalance.findAll({
      where: {
        employeeId,
        year: targetYear
      }
    });

    // If no balances exist, return empty array (don't auto-create)
    if (!leaveBalances || leaveBalances.length === 0) {
      return [];
    }

    // Transform to match expected format
    const formattedBalances = leaveBalances.map(balance => ({
      type: balance.leaveType.toLowerCase(),
      allocated: balance.allocated,
      used: balance.used,
      pending: balance.pending,
      remaining: balance.remaining,
      available: balance.remaining, // available is same as remaining
      carryForward: balance.carryForward
    }));

    return formattedBalances;
  } catch (error) {
    logger.error('Error getting leave balance:', error);
    throw error;
  }
};

const cancelLeaveRequest = async (employeeId, requestId) => {
  try {
    const leaveRequest = await LeaveRequest.findOne({
      where: {
        id: requestId,
        employeeId,
        status: 'pending'
      }
    });

    if (!leaveRequest) {
      throw {
        code: 'REQUEST_NOT_FOUND',
        message: 'Leave request not found or cannot be cancelled',
        statusCode: 404
      };
    }

    await leaveRequest.update({ status: 'cancelled' });
    return leaveRequest;
  } catch (error) {
    logger.error('Error cancelling leave request:', error);
    throw error;
  }
};

export default {
  submitLeaveRequest,
  getLeaveRequests,
  getLeaveBalance,
  cancelLeaveRequest
};