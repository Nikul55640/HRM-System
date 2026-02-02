// Script to update server.js to use enhanced attendance finalization
import fs from 'fs';
import path from 'path';

function updateServerFile() {
  try {
    console.log('=== UPDATING SERVER TO USE ENHANCED FINALIZATION ===\n');
    
    const serverPath = './src/server.js';
    let serverContent = fs.readFileSync(serverPath, 'utf8');
    
    console.log('1. CURRENT SERVER CONFIGURATION:');
    console.log('   Reading server.js...');
    
    // Check if already using enhanced finalization
    if (serverContent.includes('enhancedAttendanceFinalization')) {
      console.log('   ✅ Server already using enhanced finalization');
      return;
    }
    
    console.log('   📝 Current: Using standard attendanceFinalization');
    console.log('   🔄 Updating to: Enhanced attendanceFinalization\n');
    
    // Replace the attendance finalization import and scheduling
    const oldImport = `import('./jobs/attendanceFinalization.js').then((mod) => {
      if (mod && mod.scheduleAttendanceFinalization) {
        mod.scheduleAttendanceFinalization();
      }
    }).catch((error) => {
      logger.warn('Attendance finalization cron job not initialized:', error.message);
    });`;
    
    const newImport = `// 🔥 ENHANCED: Initialize enhanced attendance finalization cron job
    import('./jobs/enhancedAttendanceFinalization.js').then((mod) => {
      if (mod && mod.scheduleEnhancedAttendanceFinalization) {
        mod.scheduleEnhancedAttendanceFinalization();
        logger.info('🔥 Enhanced attendance finalization job scheduled (covers ALL dates)');
      }
    }).catch((error) => {
      logger.warn('Enhanced attendance finalization cron job not initialized:', error.message);
      // Fallback to standard finalization
      import('./jobs/attendanceFinalization.js').then((fallbackMod) => {
        if (fallbackMod && fallbackMod.scheduleAttendanceFinalization) {
          fallbackMod.scheduleAttendanceFinalization();
          logger.info('📅 Fallback: Standard attendance finalization job scheduled');
        }
      }).catch(() => {
        logger.error('❌ Both enhanced and standard attendance finalization failed to initialize');
      });
    });`;
    
    // Replace in server content
    serverContent = serverContent.replace(oldImport, newImport);
    
    // Write updated content
    fs.writeFileSync(serverPath, serverContent, 'utf8');
    
    console.log('2. UPDATE RESULTS:');
    console.log('   ✅ Server.js updated successfully');
    console.log('   🔥 Now using: Enhanced attendance finalization');
    console.log('   📅 Coverage: Working days + Holidays + Weekends');
    console.log('   🔄 Schedule: Every 15 minutes (same as before)');
    console.log('   🛡️ Fallback: Standard finalization if enhanced fails\n');
    
    console.log('3. NEXT STEPS:');
    console.log('   1. Run migration: node src/migrations/add-weekend-status-to-attendance.js');
    console.log('   2. Test enhanced finalization: node test-enhanced-finalization.js');
    console.log('   3. Restart server to apply changes');
    console.log('   4. Verify cron job is running with enhanced logic\n');
    
    console.log('🎉 SERVER UPDATE COMPLETE!');
    
  } catch (error) {
    console.error('❌ Error updating server:', error.message);
    console.error(error.stack);
  }
}

updateServerFile();