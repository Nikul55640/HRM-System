import { AttendanceRecord, Employee } from '../../models/sequelize/index.js';
import logger from '../../utils/logger.js';

const clockIn = async (employeeId, locationData = {}) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already clocked in today
    const existingRecord = await AttendanceRecord.findOne({
      where: {
        employeeId,
        date: today,
        clockOutTime: null
      }
    });

    if (existingRecord) {
      throw {
        code: 'ALREADY_CLOCKED_IN',
        message: 'Already clocked in for today',
        statusCode: 400
      };
    }

    const attendanceRecord = await AttendanceRecord.create({
      employeeId,
      date: today,
      clockInTime: new Date(),
      location: locationData,
      status: 'present'
    });

    return attendanceRecord;
  } catch (error) {
    logger.error('Error clocking in:', error);
    throw error;
  }
};

const clockOut = async (employeeId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceRecord = await AttendanceRecord.findOne({
      where: {
        employeeId,
        date: today,
        clockOutTime: null
      }
    });

    if (!attendanceRecord) {
      throw {
        code: 'NOT_CLOCKED_IN',
        message: 'Not clocked in for today',
        statusCode: 400
      };
    }

    const clockOutTime = new Date();
    const hoursWorked = (clockOutTime - attendanceRecord.clockInTime) / (1000 * 60 * 60);

    await attendanceRecord.update({
      clockOutTime,
      hoursWorked: Math.round(hoursWorked * 100) / 100
    });

    return attendanceRecord;
  } catch (error) {
    logger.error('Error clocking out:', error);
    throw error;
  }
};

const getTodayAttendance = async (employeeId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await AttendanceRecord.findOne({
      where: {
        employeeId,
        date: today
      }
    });

    return attendance;
  } catch (error) {
    logger.error('Error getting today attendance:', error);
    throw error;
  }
};

const getAttendanceHistory = async (employeeId, options = {}) => {
  try {
    const { limit = 30, offset = 0, startDate, endDate } = options;
    
    const whereClause = { employeeId };
    
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { rows: records, count: total } = await AttendanceRecord.findAndCountAll({
      where: whereClause,
      order: [['date', 'DESC']],
      limit,
      offset
    });

    return {
      records,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + records.length < total
      }
    };
  } catch (error) {
    logger.error('Error getting attendance history:', error);
    throw error;
  }
};

export default {
  clockIn,
  clockOut,
  getTodayAttendance,
  getAttendanceHistory
};