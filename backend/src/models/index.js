// Import models from sequelize directory (associations are defined there)
import sequelize from '../config/sequelize.js';
import User from './sequelize/User.js';
import Department from './sequelize/Department.js';
import Employee from './sequelize/Employee.js';
import EmployeeProfile from './sequelize/EmployeeProfile.js';
import AttendanceRecord from './sequelize/AttendanceRecord.js';
import LeaveRequest from './sequelize/LeaveRequest.js';
import LeaveBalance from './sequelize/LeaveBalance.js';
import LeaveType from './sequelize/LeaveType.js';
import Holiday from './sequelize/Holiday.js';
import AuditLog from './sequelize/AuditLog.js';
import Config from './sequelize/Config.js';
import Notification from './sequelize/Notification.js';
import Document from './sequelize/Document.js';
import CompanyEvent from './sequelize/CompanyEvent.js';
import Payslip from './sequelize/Payslip.js';
import Request from './sequelize/Request.js';
import SalaryStructure from './sequelize/SalaryStructure.js';
import Lead from './sequelize/Lead.js';
import LeadActivity from './sequelize/LeadActivity.js';
import LeadNote from './sequelize/LeadNote.js';

// Note: Associations are defined in ./sequelize/index.js to avoid conflicts

export {
  sequelize,
  User,
  Department,
  Employee,
  EmployeeProfile,
  AttendanceRecord,
  LeaveRequest,
  LeaveBalance,
  LeaveType,
  Holiday,
  AuditLog,
  Config,
  Notification,
  Document,
  CompanyEvent,
  Payslip,
  Request,
  SalaryStructure,
  Lead,
  LeadActivity,
  LeadNote,
};

export default {
  sequelize,
  User,
  Department,
  Employee,
  EmployeeProfile,
  AttendanceRecord,
  LeaveRequest,
  LeaveBalance,
  LeaveType,
  Holiday,
  AuditLog,
  Config,
  Notification,
  Document,
  CompanyEvent,
  Payslip,
  Request,
  SalaryStructure,
  Lead,
  LeadActivity,
  LeadNote,
};