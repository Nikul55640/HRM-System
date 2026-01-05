/**
 * Smart Calendar Migration Runner
 * Applies the database changes needed for the smart calendar system
 */

import sequelize from './src/config/sequelize.js';

async function runSmartCalendarMigration() {
  try {
    console.log('🚀 Starting Smart Calendar Migration...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    const queryInterface = sequelize.getQueryInterface();

    // Check if working_rules table already exists
    const tables = await queryInterface.showAllTables();
    const hasWorkingRules = tables.includes('working_rules');
    
    if (!hasWorkingRules) {
      console.log('📋 Creating working_rules table...');
      
      // Create working_rules table manually
      await queryInterface.createTable('working_rules', {
        id: {
          type: sequelize.Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        ruleName: {
          type: sequelize.Sequelize.STRING(100),
          allowNull: false,
          comment: 'Human-readable name for the working rule'
        },
        workingDays: {
          type: sequelize.Sequelize.JSON,
          allowNull: false,
          defaultValue: [1, 2, 3, 4, 5],
          comment: 'Array of working days (0=Sunday, 1=Monday, ..., 6=Saturday)'
        },
        weekendDays: {
          type: sequelize.Sequelize.JSON,
          allowNull: false,
          defaultValue: [0, 6],
          comment: 'Array of weekend days (0=Sunday, 1=Monday, ..., 6=Saturday)'
        },
        effectiveFrom: {
          type: sequelize.Sequelize.DATEONLY,
          allowNull: false,
          defaultValue: sequelize.Sequelize.NOW,
          comment: 'Date from which this rule is effective'
        },
        effectiveTo: {
          type: sequelize.Sequelize.DATEONLY,
          allowNull: true,
          comment: 'Date until which this rule is valid (null = ongoing)'
        },
        isActive: {
          type: sequelize.Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        isDefault: {
          type: sequelize.Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Whether this is the default working rule'
        },
        description: {
          type: sequelize.Sequelize.TEXT,
          allowNull: true,
          comment: 'Description of this working rule'
        },
        createdBy: {
          type: sequelize.Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        updatedBy: {
          type: sequelize.Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        createdAt: {
          type: sequelize.Sequelize.DATE,
          allowNull: false,
          defaultValue: sequelize.Sequelize.NOW
        },
        updatedAt: {
          type: sequelize.Sequelize.DATE,
          allowNull: false,
          defaultValue: sequelize.Sequelize.NOW
        }
      });

      // Add indexes
      await queryInterface.addIndex('working_rules', ['effectiveFrom']);
      await queryInterface.addIndex('working_rules', ['effectiveTo']);
      await queryInterface.addIndex('working_rules', ['isActive']);
      await queryInterface.addIndex('working_rules', ['isDefault']);

      // Insert default working rule
      await queryInterface.bulkInsert('working_rules', [{
        ruleName: 'Standard Monday-Friday',
        workingDays: JSON.stringify([1, 2, 3, 4, 5]),
        weekendDays: JSON.stringify([0, 6]),
        effectiveFrom: '2024-01-01',
        effectiveTo: null,
        isActive: true,
        isDefault: true,
        description: 'Standard working week: Monday to Friday, weekends on Saturday and Sunday',
        createdBy: 1, // Assuming admin user ID is 1
        createdAt: new Date(),
        updatedAt: new Date()
      }]);

      console.log('✅ Working rules table created successfully');
    } else {
      console.log('ℹ️ Working rules table already exists, skipping creation');
    }

    // Check if holidays table needs updating
    const holidayColumns = await queryInterface.describeTable('holidays');
    const hasRecurringDate = holidayColumns.recurringDate;
    
    if (!hasRecurringDate) {
      console.log('📋 Updating holidays table structure...');
      
      // Add new columns for smart holiday management
      await queryInterface.addColumn('holidays', 'recurringDate', {
        type: sequelize.Sequelize.STRING(5),
        allowNull: true,
        comment: 'MM-DD format for recurring holidays (e.g., "08-15" for Independence Day)'
      });

      await queryInterface.addColumn('holidays', 'type', {
        type: sequelize.Sequelize.ENUM('ONE_TIME', 'RECURRING'),
        allowNull: false,
        defaultValue: 'ONE_TIME',
        comment: 'Holiday type: ONE_TIME for specific year, RECURRING for every year'
      });

      await queryInterface.addColumn('holidays', 'appliesEveryYear', {
        type: sequelize.Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether this holiday applies every year (for recurring holidays)'
      });

      // Make date nullable (since recurring holidays won't have specific dates)
      await queryInterface.changeColumn('holidays', 'date', {
        type: sequelize.Sequelize.DATEONLY,
        allowNull: true,
        comment: 'Full date for one-time holidays (YYYY-MM-DD)'
      });

      // Update existing holidays to use new structure
      await queryInterface.sequelize.query(`
        UPDATE holidays 
        SET type = 'ONE_TIME', appliesEveryYear = false 
        WHERE type IS NULL OR type = 'ONE_TIME'
      `);

      console.log('✅ Holidays table updated successfully');
    } else {
      console.log('ℹ️ Holidays table already updated, skipping update');
    }

    // Verify tables exist
    const finalTables = await queryInterface.showAllTables();
    const finalHasWorkingRules = finalTables.includes('working_rules');
    const finalHasHolidays = finalTables.includes('holidays');

    if (finalHasWorkingRules && finalHasHolidays) {
      console.log('✅ All tables verified successfully');
      console.log('🎉 Smart Calendar Migration completed successfully!');
      
      // Print next steps
      console.log('\n📋 Next Steps:');
      console.log('1. Restart your backend server to load the new models');
      console.log('2. Access the Smart Calendar Management page in the admin panel');
      console.log('3. Configure your working rules and holidays');
      console.log('4. Test the new smart calendar endpoints');
      
    } else {
      throw new Error('Migration verification failed - tables not found');
    }

  } catch (error) {
    console.error('❌ Smart Calendar Migration failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check database connection settings');
    console.error('2. Ensure you have proper database permissions');
    console.error('3. Check the error logs above for specific issues');
    console.error('4. You may need to run migrations manually');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migration
runSmartCalendarMigration();