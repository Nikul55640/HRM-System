/**
 * Script to check shift configuration and fix threshold issues
 */

import sequelize from './src/config/sequelize.js';
import { Shift } from './src/models/sequelize/index.js';

async function checkShiftConfig() {
  try {
    console.log('🔍 Checking shift configuration...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Get all shifts
    const shifts = await Shift.findAll({
      order: [['id', 'ASC']]
    });

    console.log(`\n📊 Found ${shifts.length} shifts:`);

    shifts.forEach((shift, index) => {
      console.log(`\n--- Shift ${index + 1} ---`);
      console.log(`ID: ${shift.id}`);
      console.log(`Name: ${shift.shiftName}`);
      console.log(`Code: ${shift.shiftCode}`);
      console.log(`Start Time: ${shift.shiftStartTime}`);
      console.log(`End Time: ${shift.shiftEndTime}`);
      console.log(`Full Day Hours: ${shift.fullDayHours}`);
      console.log(`Half Day Hours: ${shift.halfDayHours}`);
      console.log(`Grace Period: ${shift.gracePeriodMinutes} minutes`);
      console.log(`Is Default: ${shift.isDefault}`);
      console.log(`Is Active: ${shift.isActive}`);
    });

    // Check if we need to update shift thresholds
    const defaultShift = shifts.find(s => s.isDefault) || shifts[0];
    
    if (defaultShift) {
      console.log(`\n🔧 Default shift analysis:`);
      console.log(`Current Full Day Hours: ${defaultShift.fullDayHours}`);
      console.log(`Current Half Day Hours: ${defaultShift.halfDayHours}`);
      
      // Check if thresholds need adjustment
      if (defaultShift.fullDayHours > 8 || defaultShift.halfDayHours > 4) {
        console.log(`\n⚠️  Shift thresholds seem high. Recommended values:`);
        console.log(`   - Full Day Hours: 8 (currently ${defaultShift.fullDayHours})`);
        console.log(`   - Half Day Hours: 4 (currently ${defaultShift.halfDayHours})`);
        
        // Update the shift with more reasonable thresholds
        await defaultShift.update({
          fullDayHours: 8,
          halfDayHours: 4
        });
        
        console.log(`✅ Updated shift thresholds to more reasonable values`);
      } else {
        console.log(`✅ Shift thresholds look reasonable`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking shift config:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the check
checkShiftConfig();