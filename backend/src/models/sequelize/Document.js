import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Employees',
      key: 'id',
    },
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  documentType: {
    type: DataTypes.ENUM(
      'id_proof',
      'address_proof',
      'bank_proof',
      'education_certificate',
      'experience_letter',
      'profile_photo',
      'resume',
      'contract',
      'policy',
      'other'
    ),
    defaultValue: 'other',
  },
  storagePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  encryptionKey: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isEncrypted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  uploadedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
}, {
  tableName: 'documents',
  timestamps: true,
  indexes: [
    {
      fields: ['employeeId'],
    },
    {
      fields: ['documentType'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['uploadedAt'],
    },
  ],
});

// Instance methods
Document.prototype.getSummary = function() {
  return {
    id: this.id,
    fileName: this.fileName,
    originalName: this.originalName,
    fileType: this.fileType,
    fileSize: this.fileSize,
    documentType: this.documentType,
    status: this.status,
    uploadedAt: this.uploadedAt,
    isEncrypted: this.isEncrypted,
  };
};

Document.prototype.isAccessibleBy = function(user) {
  // Document owner can access
  if (this.employeeId && user.employeeId && this.employeeId === user.employeeId) {
    return true;
  }
  
  // HR and Admin can access
  if (['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(user.role)) {
    return true;
  }
  
  return false;
};

export default Document;