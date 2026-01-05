// Import models from sequelize directory (associations are defined there)
import sequelize from '../config/sequelize.js';
import User from './sequelize/User.js';
import Department from './sequelize/Department.js';
import Designation from './sequelize/Designation.js';
import Employee from './sequelize/Employee.js';
import AttendanceRecord from './sequelize/AttendanceRecord.js';
import AttendanceCorrectionRequest from './sequelize/AttendanceCorrectionRequest.js';
import LeaveRequest from './sequelize/LeaveRequest.js';
import LeaveBalance from './sequelize/LeaveBalance.js';
import Holiday from './sequelize/Holiday.js';
import AuditLog from './sequelize/AuditLog.js';
import SystemPolicy from './sequelize/SystemPolicy.js';
import CompanyEvent from './sequelize/CompanyEvent.js';
import Lead from './sequelize/Lead.js';
import Shift from './sequelize/Shift.js';
import EmployeeShift from './sequelize/EmployeeShift.js';
import EmergencyContact from './sequelize/EmergencyContact.js';
import WorkingRule from './sequelize/WorkingRule.js';

// Note: Associations are defined in ./sequelize/index.js to avoid conflicts

export {
  sequelize,
  User,
  Department,
  Designation,
  Employee,
  AttendanceRecord,
  AttendanceCorrectionRequest,
  LeaveRequest,
  LeaveBalance,
  Holiday,
  AuditLog,
  SystemPolicy,
  CompanyEvent,
  Lead,
  Shift,
  EmployeeShift,
  EmergencyContact,
  WorkingRule,
};

export default {
  sequelize,
  User,
  Department,
  Designation,
  Employee,
  AttendanceRecord,
  AttendanceCorrectionRequest,
  LeaveRequest,
  LeaveBalance,
  Holiday,
  AuditLog,
  SystemPolicy,
  CompanyEvent,
  Lead,
  Shift,
  EmployeeShift,
  EmergencyContact,
  WorkingRule,
};