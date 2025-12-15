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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('SuperAdmin', 'HR Administrator', 'HR Manager', 'Manager', 'Employee'),
    defaultValue: 'Employee',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  employeeId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'employees',
      key: 'id',
    },
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
  },
}, {
  tableName: 'users',
  timestamps: true,
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
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return resetToken;
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  delete values.refreshToken;
  delete values.passwordResetToken;
  return values;
};

export default User;