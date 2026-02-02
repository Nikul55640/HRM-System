// Direct migration script to add 'weekend' status to attendance_records enum
import { connectDB } from './src/config/sequelize.js';
import sequelize from './src/config/sequelize.js';

async function addWeekendStatus() {
  try {
    console.log('=== ADDING WEEKEND STATUS TO ATTENDANCE RECORDS ===\n');
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected\n');
    
    console.log('1. CHECKING CURRENT ENUM VALUES:');
    
    // Check current enum values
    const [results] = await sequelize.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'hrm2' 
      AND TABLE_NAME = 'attendance_records' 
      AND COLUMN_NAME = 'status'
    `);
    
    console.log('   Current enum:', results[0]?.COLUMN_TYPE);
    
    // Check if 'weekend' already exists
    const currentEnum = results[0]?.COLUMN_TYPE || '';
    if (currentEnum.includes('weekend')) {
      console.log('   ✅ Weekend status already exists in enum');
      console.log('\n🎉 MIGRATION ALREADY COMPLETE!');
      return;
    }
    
    console.log('\n2. ADDING WEEKEND STATUS TO ENUM:');
    console.log('   🔄 Modifying attendance_records status enum...');
    
    // Add 'weekend' to the enum
    await sequelize.query(`
      ALTER TABLE attendance_records 
      MODIFY COLUMN status ENUM(
        'in_progress',
        'on_break', 
        'completed',
        'present',
        'half_day',
        'absent',
        'leave',
        'holiday',
        'weekend',
        'pending_correction'
      ) DEFAULT 'in_progress'
    `);
    
    console.log('   ✅ Successfully added weekend status to enum');
    
    console.log('\n3. VERIFYING MIGRATION:');
    
    // Verify the change
    const [newResults] = await sequelize.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'hrm2' 
      AND TABLE_NAME = 'attendance_records' 
      AND COLUMN_NAME = 'status'
    `);
    
    console.log('   New enum:', newResults[0]?.COLUMN_TYPE);
    
    if (newResults[0]?.COLUMN_TYPE.includes('weekend')) {
      console.log('   ✅ Migration verified successfully');
    } else {
      console.log('   ❌ Migration verification failed');
    }
    
    console.log('\n🎉 WEEKEND STATUS MIGRATION COMPLETE!');
    console.log('\nNext steps:');
    console.log('1. Run: node fix-jan30-attendance.js');
    console.log('2. Run: node test-enhanced-finalization.js');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

addWeekendStatus();