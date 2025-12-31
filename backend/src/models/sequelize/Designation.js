import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const Designation = sequelize.define('Designation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id',
    },
  },
  level: {
    type: DataTypes.ENUM(
      'intern', 
      'junior', 
      'mid', 
      'senior', 
      'lead', 
      'manager', 
      'director', 
      'executive'
    ),
    defaultValue: 'junior',
  },
  minSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  maxSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  responsibilities: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of responsibility strings'
  },
  requirements: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of requirement strings'
  },
  skills: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of required skills'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  employeeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of employees with this designation'
  },
  // Audit fields
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'designations',
  timestamps: true,
  indexes: [
    { fields: ['title'], unique: true },
    { fields: ['departmentId'] },
    { fields: ['level'] },
    { fields: ['isActive'] },
  ],
});

// Instance methods
Designation.prototype.toJSON = function () {
  const values = { ...this.get() };
  return values;
};

// Static methods
Designation.getLevelHierarchy = function() {
  return {
    intern: 1,
    junior: 2,
    mid: 3,
    senior: 4,
    lead: 5,
    manager: 6,
    director: 7,
    executive: 8
  };
};

Designation.prototype.getLevelRank = function() {
  const hierarchy = Designation.getLevelHierarchy();
  return hierarchy[this.level] || 0;
};

export default Designation;