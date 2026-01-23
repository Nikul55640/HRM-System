/**
 * Run Holiday Selection Template Migration
 */

import sequelize from './src/config/sequelize.js';

async function runMigration() {
  try {
    console.log('🔄 Creating holiday_selection_templates table...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Create the table directly
    await sequelize.getQueryInterface().createTable('holiday_selection_templates', {
      id: {
        type: sequelize.constructor.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: sequelize.constructor.STRING(100),
        allowNull: false,
        comment: 'Template name (e.g., "Company National Holidays")'
      },
      description: {
        type: sequelize.constructor.TEXT,
        allowNull: true,
        comment: 'Template description'
      },
      country: {
        type: sequelize.constructor.STRING(2),
        allowNull: false,
        comment: 'ISO country code (e.g., IN, US)'
      },
      holidayTypes: {
        type: sequelize.constructor.JSON,
        allowNull: false,
        comment: 'Array of holiday types (e.g., ["national", "religious"])'
      },
      selectedHolidays: {
        type: sequelize.constructor.JSON,
        allowNull: false,
        comment: 'Array of selected holiday names'
      },
      maxHolidays: {
        type: sequelize.constructor.INTEGER,
        allowNull: true,
        defaultValue: 10,
        comment: 'Maximum number of holidays in this template'
      },
      isActive: {
        type: sequelize.constructor.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this template is active'
      },
      isDefault: {
        type: sequelize.constructor.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether this is the default template for the country'
      },
      createdBy: {
        type: sequelize.constructor.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      updatedBy: {
        type: sequelize.constructor.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        type: sequelize.constructor.DATE,
        allowNull: false,
        defaultValue: sequelize.constructor.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: sequelize.constructor.DATE,
        allowNull: false,
        defaultValue: sequelize.constructor.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await sequelize.getQueryInterface().addIndex('holiday_selection_templates', {
      fields: ['name', 'country'],
      unique: true,
      name: 'unique_template_name_country'
    });

    await sequelize.getQueryInterface().addIndex('holiday_selection_templates', {
      fields: ['country', 'isActive'],
      name: 'idx_country_active'
    });

    await sequelize.getQueryInterface().addIndex('holiday_selection_templates', {
      fields: ['isDefault', 'country'],
      name: 'idx_default_country'
    });

    console.log('✅ Holiday selection templates table created successfully');
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️ Table already exists, skipping...');
    } else {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }
  } finally {
    await sequelize.close();
  }
}

runMigration();