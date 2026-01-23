import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const HolidaySelectionTemplate = sequelize.define('HolidaySelectionTemplate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Template name (e.g., "Company National Holidays")'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Template description'
  },
  country: {
    type: DataTypes.STRING(2),
    allowNull: false,
    comment: 'ISO country code (e.g., IN, US)'
  },
  holidayTypes: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Array of holiday types (e.g., ["national", "religious"])'
  },
  selectedHolidays: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Array of selected holiday names'
  },
  maxHolidays: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 10,
    comment: 'Maximum number of holidays in this template'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether this template is active'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this is the default template for the country'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'holiday_selection_templates',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['name', 'country'],
      name: 'unique_template_name_country'
    },
    {
      fields: ['country', 'isActive'],
      name: 'idx_country_active'
    },
    {
      fields: ['isDefault', 'country'],
      name: 'idx_default_country'
    }
  ]
});

// Associations
HolidaySelectionTemplate.associate = (models) => {
  HolidaySelectionTemplate.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });
  
  HolidaySelectionTemplate.belongsTo(models.User, {
    foreignKey: 'updatedBy',
    as: 'updater'
  });
};

export default HolidaySelectionTemplate;