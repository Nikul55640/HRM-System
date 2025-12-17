import { LeaveRequest, LeaveBalance, Employee } from '../../models/sequelize/index.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';

const submitLeaveRequest = async (employeeId, leaveData) => {
  try {
    const { startDate, endDate, leaveType, reason, isHalfDay = false } = leaveData;

    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = isHalfDay ? 0.5 : Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Check leave balance
    const currentYear = new Date().getFullYear();
    const leaveBalance = await LeaveBalance.findOne({
      where: {
        employeeId,
        year: currentYear
      }
    });

    if (leaveBalance) {
      const typeBalance = leaveBalance.leaveTypes.find(t => t.type === leaveType);
      if (typeBalance && typeBalance.available < days) {
        throw {
          code: 'INSUFFICIENT_BALANCE',
          message: `Insufficient ${leaveType} leave balance`,
          statusCode: 400
        };
      }
    }

    const leaveRequest = await LeaveRequest.create({
      employeeId,
      startDate: start,
      endDate: end,
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
    
    let leaveBalance = await LeaveBalance.findOne({
      where: {
        employeeId,
        year: targetYear
      }
    });

    if (!leaveBalance) {
      // Create default leave balance
      leaveBalance = await LeaveBalance.create({
        employeeId,
        year: targetYear,
        leaveTypes: [
          { type: 'annual', allocated: 20, used: 0, pending: 0, available: 20 },
          { type: 'sick', allocated: 10, used: 0, pending: 0, available: 10 },
          { type: 'personal', allocated: 5, used: 0, pending: 0, available: 5 },
        ]
      });
    }

    return leaveBalance;
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