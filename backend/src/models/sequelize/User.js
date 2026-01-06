import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import sequelize from '../../config/sequelize.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    comment: 'Primary authentication email'
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('SuperAdmin', 'HR', 'Employee', 'SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER', 'EMPLOYEE'),
    defaultValue: 'Employee',
    comment: 'User role - supports both old and new formats for backward compatibility'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastLogin: {
    type: DataTypes.DATE,
  },
  passwordResetToken: {
    type: DataTypes.STRING,
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
  },
  refreshToken: {
    type: DataTypes.TEXT,
  },
  assignedDepartments: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'For HR users - which departments they can manage'
  },
}, {
  tableName: 'users',
  timestamps: true,
  // 🔧 Production: Explicit indexes for performance
  indexes: [
    {
      unique: true,
      fields: ['email'],
      name: 'users_email_unique'
    },
    {
      fields: ['role'],
      name: 'users_role_index'
    },
    {
      fields: ['isActive'],
      name: 'users_is_active_index'
    }
  ],
  defaultScope: {
    attributes: { exclude: ['password', 'refreshToken', 'passwordResetToken'] },
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password'] },
    },
    withRefreshToken: {
      attributes: { include: ['refreshToken'] },
    },
    withSecrets: {
      attributes: { include: ['password', 'refreshToken', 'passwordResetToken'] },
    },
  },
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

// Instance methods
User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return resetToken;
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  delete values.refreshToken;
  delete values.passwordResetToken;
  return values;
};

// Helper method to get full name from associated employee
User.prototype.getFullName = function () {
  if (this.employee) {
    return `${this.employee.firstName} ${this.employee.lastName}`;
  }
  return this.email; // Fallback to email if no employee record
};

// ✅ NEW: Role normalization for backward compatibility
User.prototype.getNormalizedRole = function () {
  const roleMapping = {
    'SuperAdmin': 'SUPER_ADMIN',
    'HR': 'HR_ADMIN', 
    'Employee': 'EMPLOYEE',
    // New roles pass through unchanged
    'SUPER_ADMIN': 'SUPER_ADMIN',
    'HR_ADMIN': 'HR_ADMIN',
    'HR_MANAGER': 'HR_MANAGER', 
    'EMPLOYEE': 'EMPLOYEE'
  };
  
  return roleMapping[this.role] || this.role;
};

// ✅ NEW: Check if user has specific role (supports both old and new formats)
User.prototype.hasRole = function (requiredRole) {
  const normalizedUserRole = this.getNormalizedRole();
  const normalizedRequiredRole = typeof requiredRole === 'string' ? 
    (requiredRole === 'SuperAdmin' ? 'SUPER_ADMIN' : 
     requiredRole === 'HR' ? 'HR_ADMIN' : 
     requiredRole === 'Employee' ? 'EMPLOYEE' : requiredRole) : requiredRole;
  
  return normalizedUserRole === normalizedRequiredRole;
};

// ✅ NEW: Check if user has any of the specified roles
User.prototype.hasAnyRole = function (requiredRoles) {
  return requiredRoles.some(role => this.hasRole(role));
};

export default User;