import sequelize from '../../config/sequelize.js';
import User from './User.js';
import Department from './Department.js';
import Designation from './Designation.js';
import Employee from './Employee.js';
import AttendanceRecord from './AttendanceRecord.js';
import AttendanceCorrectionRequest from './AttendanceCorrectionRequest.js';
import LeaveRequest from './LeaveRequest.js';
import LeaveBalance from './LeaveBalance.js';
import Holiday from './Holiday.js';
import CompanyEvent from './CompanyEvent.js';
import Lead from './Lead.js';
import Shift from './Shift.js';
import EmployeeShift from './EmployeeShift.js';
import AuditLog from './AuditLog.js';
import SystemPolicy from './SystemPolicy.js';
import EmergencyContact from './EmergencyContact.js';
import WorkingRule from './WorkingRule.js';
import Notification from './Notification.js';
import HolidaySelectionTemplate from './HolidaySelectionTemplate.js';

// Define associations

// User-Employee relationship (CLEAN ARCHITECTURE)
// ✅ ONLY ONE DIRECTION: Employee.userId -> User.id
User.hasOne(Employee, { foreignKey: 'userId', as: 'employee' });
Employee.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Notification relationships
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

// Department relationships
Department.belongsTo(Department, { foreignKey: 'parentDepartmentId', as: 'parent' });
Department.hasMany(Department, { foreignKey: 'parentDepartmentId', as: 'children' });
Department.belongsTo(Employee, { foreignKey: 'managerId', as: 'managerEmployee' });

// Designation relationships
Designation.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Department.hasMany(Designation, { foreignKey: 'departmentId', as: 'designations' });
Designation.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Designation.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

// Employee relationships
Employee.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Employee.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });
Employee.belongsTo(Employee, { foreignKey: 'reportingManager', as: 'manager' });
Employee.hasMany(Employee, { foreignKey: 'reportingManager', as: 'subordinates' });
Employee.belongsTo(Designation, { foreignKey: 'designationId', as: 'employeeDesignation' });
Designation.hasMany(Employee, { foreignKey: 'designationId', as: 'employees' });
Employee.belongsTo(Department, { foreignKey: 'departmentId', as: 'employeeDepartment' });
Department.hasMany(Employee, { foreignKey: 'departmentId', as: 'departmentEmployees' });

// Attendance relationships
AttendanceRecord.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(AttendanceRecord, { foreignKey: 'employeeId', as: 'attendanceRecords' });
AttendanceRecord.belongsTo(Shift, { foreignKey: 'shiftId', as: 'shift' });
AttendanceRecord.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
AttendanceRecord.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });
AttendanceRecord.belongsTo(User, { foreignKey: 'correctedBy', as: 'corrector' });

// Attendance Correction Request relationships
AttendanceCorrectionRequest.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(AttendanceCorrectionRequest, { foreignKey: 'employeeId', as: 'correctionRequests' });
AttendanceCorrectionRequest.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });
AttendanceCorrectionRequest.belongsTo(AttendanceRecord, { foreignKey: 'attendanceRecordId', as: 'attendanceRecord' });
AttendanceRecord.hasMany(AttendanceCorrectionRequest, { foreignKey: 'attendanceRecordId', as: 'correctionRequests' });

// Leave relationships
LeaveRequest.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(LeaveRequest, { foreignKey: 'employeeId', as: 'leaveRequests' });
LeaveRequest.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
LeaveRequest.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
LeaveRequest.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

LeaveBalance.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(LeaveBalance, { foreignKey: 'employeeId', as: 'leaveBalances' });
LeaveBalance.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
LeaveBalance.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

// Holiday relationships
Holiday.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Holiday.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

// Company Event relationships
CompanyEvent.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
CompanyEvent.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });
CompanyEvent.belongsTo(User, { foreignKey: 'organizer', as: 'organizerUser' });

// Lead relationships
Lead.belongsTo(Employee, { foreignKey: 'assignedTo', as: 'assignedEmployee' });
Lead.belongsTo(Employee, { foreignKey: 'createdBy', as: 'creatorEmployee' });
Lead.belongsTo(Employee, { foreignKey: 'updatedBy', as: 'updaterEmployee' });
Employee.hasMany(Lead, { foreignKey: 'assignedTo', as: 'assignedLeads' });
Employee.hasMany(Lead, { foreignKey: 'createdBy', as: 'createdLeads' });

// Shift relationships
Shift.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Shift.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

// Employee Shift relationships
EmployeeShift.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
EmployeeShift.belongsTo(Shift, { foreignKey: 'shiftId', as: 'shift' });
EmployeeShift.belongsTo(User, { foreignKey: 'assignedBy', as: 'assignedByUser' });

Employee.hasMany(EmployeeShift, { foreignKey: 'employeeId', as: 'shiftAssignments' });
Shift.hasMany(EmployeeShift, { foreignKey: 'shiftId', as: 'employeeAssignments' });
Shift.hasMany(AttendanceRecord, { foreignKey: 'shiftId', as: 'attendanceRecords' });

// Audit Log relationships
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });

// System Policy relationships
SystemPolicy.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
SystemPolicy.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

// Emergency Contact relationships
EmergencyContact.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(EmergencyContact, { foreignKey: 'employeeId', as: 'emergencyContacts' });
EmergencyContact.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
EmergencyContact.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

// Working Rule relationships
WorkingRule.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
WorkingRule.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

// Holiday Selection Template relationships
HolidaySelectionTemplate.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
HolidaySelectionTemplate.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });
User.hasMany(HolidaySelectionTemplate, { foreignKey: 'createdBy', as: 'createdTemplates' });
User.hasMany(HolidaySelectionTemplate, { foreignKey: 'updatedBy', as: 'updatedTemplates' });

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
  CompanyEvent,
  Lead,
  Shift,
  EmployeeShift,
  AuditLog,
  SystemPolicy,
  EmergencyContact,
  WorkingRule,
  Notification,
  HolidaySelectionTemplate,
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
  CompanyEvent,
  Lead,
  Shift,
  EmployeeShift,
  AuditLog,
  SystemPolicy,
  EmergencyContact,
  WorkingRule,
  Notification,
  HolidaySelectionTemplate,
};