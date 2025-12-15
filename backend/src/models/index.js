import sequelize from '../config/sequelize.js';
import User from './sequelize/User.js';
import Department from './sequelize/Department.js';
import Employee from './sequelize/Employee.js';
import EmployeeProfile from './sequelize/EmployeeProfile.js';
import AttendanceRecord from './sequelize/AttendanceRecord.js';
import LeaveRequest from './sequelize/LeaveRequest.js';
import LeaveBalance from './sequelize/LeaveBalance.js';
import AuditLog from './sequelize/AuditLog.js';
import Config from './sequelize/Config.js';
import Notification from './sequelize/Notification.js';
import Document from './sequelize/Document.js';
import CompanyEvent from './sequelize/CompanyEvent.js';
import Payslip from './sequelize/Payslip.js';
import Request from './sequelize/Request.js';
import SalaryStructure from './sequelize/SalaryStructure.js';

// Define associations
User.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasOne(User, { foreignKey: 'employeeId', as: 'user' });

Department.belongsTo(Department, { foreignKey: 'parentDepartment', as: 'parent' });
Department.hasMany(Department, { foreignKey: 'parentDepartment', as: 'children' });
Department.belongsTo(Employee, { foreignKey: 'manager', as: 'managerEmployee' });

Employee.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Employee.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

EmployeeProfile.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasOne(EmployeeProfile, { foreignKey: 'employeeId', as: 'profile' });
EmployeeProfile.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
EmployeeProfile.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

AttendanceRecord.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(AttendanceRecord, { foreignKey: 'employeeId', as: 'attendanceRecords' });
AttendanceRecord.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
AttendanceRecord.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

LeaveRequest.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(LeaveRequest, { foreignKey: 'employeeId', as: 'leaveRequests' });
LeaveRequest.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
LeaveRequest.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
LeaveRequest.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

LeaveBalance.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(LeaveBalance, { foreignKey: 'employeeId', as: 'leaveBalances' });
LeaveBalance.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
LeaveBalance.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user', constraints: false });

Config.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Config.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Document.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(Document, { foreignKey: 'employeeId', as: 'employeeDocuments' });
Document.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Document.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });
Document.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

CompanyEvent.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
CompanyEvent.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

Payslip.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(Payslip, { foreignKey: 'employeeId', as: 'payslips' });
Payslip.belongsTo(User, { foreignKey: 'generatedBy', as: 'generator' });

Request.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(Request, { foreignKey: 'employeeId', as: 'requests' });
Request.belongsTo(User, { foreignKey: 'finalApprover', as: 'approver' });
Request.belongsTo(User, { foreignKey: 'cancelledBy', as: 'canceller' });
Request.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Request.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

SalaryStructure.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(SalaryStructure, { foreignKey: 'employeeId', as: 'salaryStructures' });
SalaryStructure.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
SalaryStructure.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
SalaryStructure.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

export {
  sequelize,
  User,
  Department,
  Employee,
  EmployeeProfile,
  AttendanceRecord,
  LeaveRequest,
  LeaveBalance,
  AuditLog,
  Config,
  Notification,
  Document,
  CompanyEvent,
  Payslip,
  Request,
  SalaryStructure,
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
  AuditLog,
  Config,
  Notification,
  Document,
  CompanyEvent,
  Payslip,
  Request,
  SalaryStructure,
};