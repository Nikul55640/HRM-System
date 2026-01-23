/**
 * Migration: Create Holiday Selection Templates table
 * Enables admin to save holiday selection templates for reuse
 */

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('holiday_selection_templates', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'Template name (e.g., "Company National Holidays")'
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Template description'
    },
    country: {
      type: Sequelize.STRING(2),
      allowNull: false,
      comment: 'ISO country code (e.g., IN, US)'
    },
    holidayTypes: {
      type: Sequelize.JSON,
      allowNull: false,
      comment: 'Array of holiday types (e.g., ["national", "religious"])'
    },
    selectedHolidays: {
      type: Sequelize.JSON,
      allowNull: false,
      comment: 'Array of selected holiday names'
    },
    maxHolidays: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 10,
      comment: 'Maximum number of holidays in this template'
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this template is active'
    },
    isDefault: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this is the default template for the country'
    },
    createdBy: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    updatedBy: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    }
  });

  // Add indexes
  await queryInterface.addIndex('holiday_selection_templates', {
    fields: ['name', 'country'],
    unique: true,
    name: 'unique_template_name_country'
  });

  await queryInterface.addIndex('holiday_selection_templates', {
    fields: ['country', 'isActive'],
    name: 'idx_country_active'
  });

  await queryInterface.addIndex('holiday_selection_templates', {
    fields: ['isDefault', 'country'],
    name: 'idx_default_country'
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('holiday_selection_templates');
};