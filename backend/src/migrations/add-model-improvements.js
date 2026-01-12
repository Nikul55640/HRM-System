/**
 * Migration: Add Model Improvements
 * Adds new fields to CompanyEvent, Holiday, and WorkingRule models
 * Based on enterprise HRM best practices
 */

import { DataTypes } from 'sequelize';

export const up = async (queryInterface, Sequelize) => {
  const { DataTypes } = Sequelize;

  // Helper function to check if column exists
  const columnExists = async (tableName, columnName) => {
    try {
      const tableDescription = await queryInterface.describeTable(tableName);
      return tableDescription[columnName] !== undefined;
    } catch (error) {
      return false;
    }
  };

  console.log('🔍 Checking existing columns...');

  // 1. Add blocksWorkingDay to CompanyEvent (if not exists)
  if (!(await columnExists('company_events', 'blocksWorkingDay'))) {
    console.log('   Adding CompanyEvent.blocksWorkingDay...');
    await queryInterface.addColumn('company_events', 'blocksWorkingDay', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'If true, attendance is not required for this event (company offsite, mandatory training, emergency shutdown)'
    });
  } else {
    console.log('   ✅ CompanyEvent.blocksWorkingDay already exists');
  }

  // 2. Add HR decision fields to Holiday
  if (!(await columnExists('holidays', 'hrApprovalStatus'))) {
    console.log('   Adding Holiday.hrApprovalStatus...');
    await queryInterface.addColumn('holidays', 'hrApprovalStatus', {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'approved',
      comment: 'HR approval status for holiday visibility and payroll inclusion'
    });
  } else {
    console.log('   ✅ Holiday.hrApprovalStatus already exists');
  }

  if (!(await columnExists('holidays', 'visibleToEmployees'))) {
    console.log('   Adding Holiday.visibleToEmployees...');
    await queryInterface.addColumn('holidays', 'visibleToEmployees', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this holiday is visible to employees in calendar'
    });
  } else {
    console.log('   ✅ Holiday.visibleToEmployees already exists');
  }

  if (!(await columnExists('holidays', 'includeInPayroll'))) {
    console.log('   Adding Holiday.includeInPayroll...');
    await queryInterface.addColumn('holidays', 'includeInPayroll', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this holiday should be included in payroll calculations'
    });
  } else {
    console.log('   ✅ Holiday.includeInPayroll already exists');
  }

  if (!(await columnExists('holidays', 'locationScope'))) {
    console.log('   Adding Holiday.locationScope...');
    await queryInterface.addColumn('holidays', 'locationScope', {
      type: DataTypes.ENUM('GLOBAL', 'STATE', 'CITY'),
      allowNull: false,
      defaultValue: 'GLOBAL',
      comment: 'Geographic scope of the holiday (useful for India state-specific holidays)'
    });
  } else {
    console.log('   ✅ Holiday.locationScope already exists');
  }

  // 3. Add shiftType to WorkingRule
  if (!(await columnExists('working_rules', 'shiftType'))) {
    console.log('   Adding WorkingRule.shiftType...');
    await queryInterface.addColumn('working_rules', 'shiftType', {
      type: DataTypes.ENUM('GENERAL', 'SHIFT'),
      allowNull: false,
      defaultValue: 'GENERAL',
      comment: 'Type of working rule - GENERAL for standard office hours, SHIFT for shift-based work'
    });
  } else {
    console.log('   ✅ WorkingRule.shiftType already exists');
  }

  // 4. Update CompanyEvent eventType enum (MySQL approach)
  console.log('   Checking CompanyEvent.eventType enum...');
  
  // Check if we need to update the enum by looking for birthday/anniversary values
  const [results] = await queryInterface.sequelize.query(`
    SELECT COUNT(*) as count 
    FROM company_events 
    WHERE eventType IN ('birthday', 'anniversary')
  `);
  
  const hasOldValues = results[0].count > 0;
  
  if (hasOldValues) {
    console.log('   Found birthday/anniversary events, updating to "other"...');
    
    // Update existing birthday/anniversary events to 'other'
    await queryInterface.sequelize.query(`
      UPDATE company_events 
      SET eventType = 'other' 
      WHERE eventType IN ('birthday', 'anniversary')
    `);
  }

  console.log('   ✅ CompanyEvent eventType enum update completed');
  console.log('✅ Model improvements migration completed successfully');
};

export const down = async (queryInterface, Sequelize) => {
  // Remove added columns
  await queryInterface.removeColumn('company_events', 'blocksWorkingDay');
  await queryInterface.removeColumn('holidays', 'hrApprovalStatus');
  await queryInterface.removeColumn('holidays', 'visibleToEmployees');
  await queryInterface.removeColumn('holidays', 'includeInPayroll');
  await queryInterface.removeColumn('holidays', 'locationScope');
  await queryInterface.removeColumn('working_rules', 'shiftType');

  // Restore original eventType enum (MySQL approach)
  // Add temporary column with original enum
  await queryInterface.addColumn('company_events', 'eventType_old', {
    type: DataTypes.ENUM(
      'meeting',
      'training',
      'company_event',
      'birthday',
      'anniversary',
      'deadline',
      'announcement',
      'other'
    ),
    allowNull: true
  });

  // Copy data back
  await queryInterface.sequelize.query(`
    UPDATE company_events 
    SET eventType_old = eventType
  `);

  // Drop new column
  await queryInterface.removeColumn('company_events', 'eventType');

  // Rename old column back
  await queryInterface.renameColumn('company_events', 'eventType_old', 'eventType');

  // Set proper constraints
  await queryInterface.changeColumn('company_events', 'eventType', {
    type: DataTypes.ENUM(
      'meeting',
      'training',
      'company_event',
      'birthday',
      'anniversary',
      'deadline',
      'announcement',
      'other'
    ),
    allowNull: false,
    defaultValue: 'other'
  });

  console.log('✅ Model improvements migration rolled back successfully');
};