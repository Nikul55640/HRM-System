import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const EmergencyContact = sequelize.define('EmergencyContact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100],
    },
  },
  relationship: {
    type: DataTypes.ENUM('spouse', 'parent', 'child', 'sibling', 'friend', 'colleague', 'other'),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
    validate: {
      notEmpty: true,
      is: /^[+]?[\d\s\-\(\)]+$/,
    },
  },
  alternatePhone: {
    type: DataTypes.STRING(15),
    allowNull: true,
    validate: {
      is: /^[+]?[\d\s\-\(\)]+$/,
    },
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500],
    },
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'emergency_contacts',
  timestamps: true,
  indexes: [
    {
      fields: ['employeeId'],
    },
    {
      fields: ['employeeId', 'isPrimary'],
      unique: true,
      where: {
        isPrimary: true,
      },
      name: 'unique_primary_per_employee',
    },
  ],
  hooks: {
    beforeCreate: async (contact) => {
      // If this is being set as primary, unset other primary contacts for this employee
      if (contact.isPrimary) {
        await EmergencyContact.update(
          { isPrimary: false },
          {
            where: {
              employeeId: contact.employeeId,
              isPrimary: true,
            },
          }
        );
      }
    },
    beforeUpdate: async (contact) => {
      // If this is being set as primary, unset other primary contacts for this employee
      if (contact.isPrimary && contact.changed('isPrimary')) {
        await EmergencyContact.update(
          { isPrimary: false },
          {
            where: {
              employeeId: contact.employeeId,
              isPrimary: true,
              id: { [sequelize.Sequelize.Op.ne]: contact.id },
            },
          }
        );
      }
    },
  },
});

// Instance methods
EmergencyContact.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Format phone numbers for display
  if (values.phone) {
    values.formattedPhone = values.phone;
  }
  if (values.alternatePhone) {
    values.formattedAlternatePhone = values.alternatePhone;
  }
  
  return values;
};

// Static methods
EmergencyContact.getByEmployeeId = async function(employeeId) {
  return await this.findAll({
    where: { employeeId },
    order: [
      ['isPrimary', 'DESC'],
      ['createdAt', 'ASC'],
    ],
  });
};

EmergencyContact.getPrimaryContact = async function(employeeId) {
  return await this.findOne({
    where: {
      employeeId,
      isPrimary: true,
    },
  });
};

EmergencyContact.setPrimary = async function(contactId, employeeId) {
  const transaction = await sequelize.transaction();
  
  try {
    // Unset all primary contacts for this employee
    await this.update(
      { isPrimary: false },
      {
        where: { employeeId },
        transaction,
      }
    );
    
    // Set the specified contact as primary
    await this.update(
      { isPrimary: true },
      {
        where: { id: contactId, employeeId },
        transaction,
      }
    );
    
    await transaction.commit();
    
    return await this.findByPk(contactId);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export default EmergencyContact;