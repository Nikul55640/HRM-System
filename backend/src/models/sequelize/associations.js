// Model associations
import User from './User.js';
import Employee from './Employee.js';
import Department from './Department.js';
import Designation from './Designation.js';

// User - Employee relationship
User.belongsTo(Employee, { 
  foreignKey: 'employeeId', 
  as: 'employee' 
});
Employee.hasOne(User, { 
  foreignKey: 'employeeId', 
  as: 'user' 
});

// Employee - Department relationship
Employee.belongsTo(Department, { 
  foreignKey: 'departmentId', 
  as: 'employeeDepartment' 
});
Department.hasMany(Employee, { 
  foreignKey: 'departmentId', 
  as: 'employees' 
});

// Employee - Designation relationship
Employee.belongsTo(Designation, { 
  foreignKey: 'designationId', 
  as: 'employeeDesignation' 
});
Designation.hasMany(Employee, { 
  foreignKey: 'designationId', 
  as: 'employees' 
});

// Department - Designation relationship
Designation.belongsTo(Department, { 
  foreignKey: 'departmentId', 
  as: 'department' 
});
Department.hasMany(Designation, { 
  foreignKey: 'departmentId', 
  as: 'designations' 
});

// Department - Manager relationship
Department.belongsTo(Employee, { 
  foreignKey: 'managerId', 
  as: 'manager' 
});

// Employee - Reporting Manager relationship (self-referencing)
Employee.belongsTo(Employee, { 
  foreignKey: 'reportingManager', 
  as: 'manager' 
});
Employee.hasMany(Employee, { 
  foreignKey: 'reportingManager', 
  as: 'subordinates' 
});

// Department hierarchy (self-referencing)
Department.belongsTo(Department, { 
  foreignKey: 'parentDepartmentId', 
  as: 'parentDepartment' 
});
Department.hasMany(Department, { 
  foreignKey: 'parentDepartmentId', 
  as: 'subDepartments' 
});

// Audit relationships
Employee.belongsTo(User, { 
  foreignKey: 'createdBy', 
  as: 'creator' 
});
Employee.belongsTo(User, { 
  foreignKey: 'updatedBy', 
  as: 'updater' 
});

Department.belongsTo(User, { 
  foreignKey: 'createdBy', 
  as: 'creator' 
});
Department.belongsTo(User, { 
  foreignKey: 'updatedBy', 
  as: 'updater' 
});

Designation.belongsTo(User, { 
  foreignKey: 'createdBy', 
  as: 'creator' 
});
Designation.belongsTo(User, { 
  foreignKey: 'updatedBy', 
  as: 'updater' 
});

export {
  User,
  Employee,
  Department,
  Designation
};