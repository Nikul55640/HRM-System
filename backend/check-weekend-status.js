// Check the actual status of weekend records
import { connectDB } from './src/config/sequelize.js';
import { AttendanceRecord } from './src/models/index.js';

async function checkWeekendStatus() {
  try {
    console.log('=== CHECKING WEEKEND RECORD STATUS ===\n');
    
    await connectDB();
    console.log('✅ Database connected\n');
    
    const weekendDates = ['2026-01-31', '2026-02-01'];
    
    for (const dateString of weekendDates) {
      console.log(`Checking ${dateString}:`);
      
      const records = await AttendanceRecord.findAll({
        where: { date: dateString },
        attributes: ['id', 'employeeId', 'status', 'statusReason'],
        raw: true
      });
      
      console.log(`  Found ${records.length} records`);
      
      if (records.length > 0) {
        records.forEach((record, index) => {
          console.log(`    Record ${index + 1}:`);
          console.log(`      ID: ${record.id}`);
          console.log(`      Employee ID: ${record.employeeId}`);
          console.log(`      Status: "${record.status}" (${record.status === null ? 'NULL' : record.status === '' ? 'EMPTY STRING' : 'HAS VALUE'})`);
          console.log(`      Status Reason: "${record.statusReason}"`);
        });
      }
      console.log('');
    }
    
    // Check if we can update these records to weekend status
    console.log('UPDATING WEEKEND RECORDS TO PROPER STATUS:\n');
    
    for (const dateString of weekendDates) {
      const date = new Date(dateString);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[date.getDay()];
      
      console.log(`Updating ${dateString} (${dayName}) records...`);
      
      const [updatedCount] = await AttendanceRecord.update(
        {
          status: 'weekend',
          statusReason: `Weekend: ${dayName}`
        },
        {
          where: {
            date: dateString,
            status: [null, ''] // Update records with null or empty status
          }
        }
      );
      
      console.log(`  ✅ Updated ${updatedCount} records to weekend status`);
    }
    
    console.log('\nVERIFYING UPDATES:\n');
    
    for (const dateString of weekendDates) {
      const records = await AttendanceRecord.findAll({
        where: { date: dateString },
        attributes: ['status'],
        raw: true
      });
      
      const statusCounts = {};
      records.forEach(record => {
        const status = record.status || 'NULL/EMPTY';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      console.log(`${dateString}: ${JSON.stringify(statusCounts)}`);
    }
    
    console.log('\n🎉 WEEKEND STATUS CHECK AND UPDATE COMPLETE!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

checkWeekendStatus();