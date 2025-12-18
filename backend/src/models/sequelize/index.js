import sequelize from '../../config/sequelize.js';
import User from './User.js';
import Department from './Department.js';
import Employee from './Employee.js';
import EmployeeProfile from './EmployeeProfile.js';
import AttendanceRecord from './AttendanceRecord.js';
import LeaveRequest from './LeaveRequest.js';
import LeaveBalance from './LeaveBalance.js';
import LeaveType from './LeaveType.js';
import Holiday from './Holiday.js';
import AuditLog from './AuditLog.js';
import Config from './Config.js';
import Notification from './Notification.js';
import Document from './Document.js';
import CompanyEvent from './CompanyEvent.js';
import Payslip from './Payslip.js';
import Request from './Request.js';
import SalaryStructure from './SalaryStructure.js';
import Lead from './Lead.js';
import LeadActivity from './LeadActivity.js';
import LeadNote from './LeadNote.js';

// Define associations
User.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasOne(User, { foreignKey: 'employeeId', as: 'user' });

Department.belongsTo(Department, { foreignKey: 'parentDepartment', as: 'parent' });
Department.hasMany(Department, { foreignKey: 'parentDepartment', as: 'children' });
Department.belongsTo(Employee, { foreignKey: 'manager', as: 'managerEmployee' });

Employee.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Employee.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });
// Employee.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' }); // Commented out - department is stored in jobInfo JSON

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

LeaveType.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
LeaveType.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

// Leave Type associations
LeaveRequest.belongsTo(LeaveType, { foreignKey: 'leaveTypeId', as: 'leaveTypeInfo' });
LeaveType.hasMany(LeaveRequest, { foreignKey: 'leaveTypeId', as: 'leaveRequests' });

LeaveBalance.belongsTo(LeaveType, { foreignKey: 'leaveTypeId', as: 'leaveTypeInfo' });
LeaveType.hasMany(LeaveBalance, { foreignKey: 'leaveTypeId', as: 'leaveBalances' });

// Holiday associations
Holiday.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Holiday.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

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
CompanyEvent.belongsTo(User, { foreignKey: 'organizer', as: 'organizerUser' });

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

// Lead associations
Lead.belongsTo(Employee, { foreignKey: 'assignedTo', as: 'assignedEmployee' });
Lead.belongsTo(Employee, { foreignKey: 'createdBy', as: 'creatorEmployee' });
Employee.hasMany(Lead, { foreignKey: 'assignedTo', as: 'assignedLeads' });
Employee.hasMany(Lead, { foreignKey: 'createdBy', as: 'createdLeads' });

Lead.hasMany(LeadActivity, { foreignKey: 'leadId', as: 'activities' });
Lead.hasMany(LeadNote, { foreignKey: 'leadId', as: 'notes' });

LeadActivity.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });
LeadActivity.belongsTo(Employee, { foreignKey: 'assignedTo', as: 'assignedEmployee' });
LeadActivity.belongsTo(Employee, { foreignKey: 'createdBy', as: 'creatorEmployee' });

LeadNote.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });
LeadNote.belongsTo(Employee, { foreignKey: 'createdBy', as: 'creatorEmployee' });

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