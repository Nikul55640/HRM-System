/**
 * Fix Holiday Table Structure
 * This script fixes the holiday table structure issues
 */

import sequelize from './src/config/sequelize.js';

async function fixHolidayTable() {
  try {
    console.log('🔧 Fixing Holiday Table Structure...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    const queryInterface = sequelize.getQueryInterface();

    // Check current table structure
    console.log('📋 Checking current holiday table structure...');
    const columns = await queryInterface.describeTable('holidays');
    console.log('Current columns:', Object.keys(columns));

    // Check if we need to rename 'type' to 'category'
    if (columns.type && !columns.category) {
      console.log('📋 Renaming type column to category...');
      
      // First, add the category column
      await queryInterface.addColumn('holidays', 'category', {
        type: sequelize.Sequelize.ENUM('public', 'optional', 'national', 'religious', 'company'),
        allowNull: false,
        defaultValue: 'public',
        comment: 'Holiday category for classification'
      });

      // Copy data from type to category
      await queryInterface.sequelize.query(`
        UPDATE holidays SET category = type WHERE type IS NOT NULL
      `);

      console.log('✅ Category column added and data copied');
    }

    // Add missing columns if they don't exist
    if (!columns.recurringDate) {
      console.log('📋 Adding recurringDate column...');
      await queryInterface.addColumn('holidays', 'recurringDate', {
        type: sequelize.Sequelize.STRING(5),
        allowNull: true,
        comment: 'MM-DD format for recurring holidays (e.g., "08-15" for Independence Day)'
      });
    }

    if (!columns.type || columns.type.type !== 'ENUM') {
      console.log('📋 Adding/updating type column for holiday type...');
      
      // Remove old type column if it exists and is not the right type
      if (columns.type) {
        await queryInterface.removeColumn('holidays', 'type');
      }
      
      await queryInterface.addColumn('holidays', 'type', {
        type: sequelize.Sequelize.ENUM('ONE_TIME', 'RECURRING'),
        allowNull: false,
        defaultValue: 'ONE_TIME',
        comment: 'Holiday type: ONE_TIME for specific year, RECURRING for every year'
      });
    }

    if (!columns.appliesEveryYear) {
      console.log('📋 Adding appliesEveryYear column...');
      await queryInterface.addColumn('holidays', 'appliesEveryYear', {
        type: sequelize.Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether this holiday applies every year (for recurring holidays)'
      });
    }

    // Make date nullable if it isn't already
    if (columns.date && columns.date.allowNull === false) {
      console.log('📋 Making date column nullable...');
      await queryInterface.changeColumn('holidays', 'date', {
        type: sequelize.Sequelize.DATEONLY,
        allowNull: true,
        comment: 'Full date for one-time holidays (YYYY-MM-DD)'
      });
    }

    // Update existing holidays to use new structure
    console.log('📋 Updating existing holidays...');
    await queryInterface.sequelize.query(`
      UPDATE holidays 
      SET type = 'ONE_TIME', appliesEveryYear = false 
      WHERE type IS NULL OR type = 'ONE_TIME'
    `);

    // Verify the final structure
    const finalColumns = await queryInterface.describeTable('holidays');
    console.log('✅ Final holiday table structure:', Object.keys(finalColumns));

    console.log('🎉 Holiday table structure fixed successfully!');

  } catch (error) {
    console.error('❌ Failed to fix holiday table:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixHolidayTable();