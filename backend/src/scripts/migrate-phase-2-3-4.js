import sequelize from '../config/sequelize.js';
import Lead from '../models/sequelize/Lead.js';
import LeadActivity from '../models/sequelize/LeadActivity.js';
import LeadNote from '../models/sequelize/LeadNote.js';
import LeaveType from '../models/sequelize/LeaveType.js';
import Holiday from '../models/sequelize/Holiday.js';
import AttendanceRecord from '../models/sequelize/AttendanceRecord.js';

const runMigration = async () => {
  try {
    console.log('🔄 Starting Phase 2, 3, 4 Migration...');
    console.log('');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    console.log('');

    // ============================================
    // PHASE 2: Leave Types and Holiday Management
    // ============================================
    console.log('📋 Phase 2: Creating Leave Types and Holiday tables...');

    // Create LeaveType table
    await LeaveType.sync({ alter: true });
    console.log('✅ LeaveType table created/updated');

    // Create Holiday table
    await Holiday.sync({ alter: true });
    console.log('✅ Holiday table created/updated');

    // Seed default leave types if table is empty
    const leaveTypeCount = await LeaveType.count();
    if (leaveTypeCount === 0) {
      console.log('📝 Seeding default leave types...');
      
      const defaultLeaveTypes = [
        {
          name: 'Annual Leave',
          code: 'AL',
          description: 'Annual paid leave for employees',
          defaultDays: 20,
          maxDaysPerYear: 25,
          carryForward: true,
          maxCarryForward: 5,
          requiresApproval: true,
          isPaid: true,
          color: '#3b82f6',
          isActive: true
        },
        {
          name: 'Sick Leave',
          code: 'SL',
          description: 'Leave for medical reasons',
          defaultDays: 10,
          maxDaysPerYear: 15,
          carryForward: false,
          maxCarryForward: 0,
          requiresApproval: true,
          requiresDocument: true,
          isPaid: true,
          color: '#ef4444',
          isActive: true
        },
        {
          name: 'Casual Leave',
          code: 'CL',
          description: 'Short-term casual leave',
          defaultDays: 7,
          maxDaysPerYear: 10,
          carryForward: false,
          maxCarryForward: 0,
          requiresApproval: true,
          isPaid: true,
          color: '#10b981',
          isActive: true
        },
        {
          name: 'Maternity Leave',
          code: 'ML',
          description: 'Maternity leave for female employees',
          defaultDays: 90,
          maxDaysPerYear: 120,
          carryForward: false,
          maxCarryForward: 0,
          requiresApproval: true,
          requiresDocument: true,
          isPaid: true,
          gender: 'female',
          color: '#ec4899',
          isActive: true
        },
        {
          name: 'Paternity Leave',
          code: 'PL',
          description: 'Paternity leave for male employees',
          defaultDays: 7,
          maxDaysPerYear: 10,
          carryForward: false,
          maxCarryForward: 0,
          requiresApproval: true,
          isPaid: true,
          gender: 'male',
          color: '#8b5cf6',
          isActive: true
        },
        {
          name: 'Unpaid Leave',
          code: 'UL',
          description: 'Leave without pay',
          defaultDays: 0,
          maxDaysPerYear: 30,
          carryForward: false,
          maxCarryForward: 0,
          requiresApproval: true,
          isPaid: false,
          color: '#6b7280',
          isActive: true
        }
      ];

      await LeaveType.bulkCreate(defaultLeaveTypes);
      console.log(`✅ Created ${defaultLeaveTypes.length} default leave types`);
    }

    // Seed sample holidays if table is empty
    const holidayCount = await Holiday.count();
    if (holidayCount === 0) {
      console.log('📝 Seeding sample holidays for 2025...');
      
      const currentYear = new Date().getFullYear();
      const sampleHolidays = [
        {
          name: "New Year's Day",
          date: new Date(`${currentYear}-01-01`),
          type: 'public',
          description: 'New Year celebration',
          isRecurring: true,
          isActive: true
        },
        {
          name: 'Independence Day',
          date: new Date(`${currentYear}-07-04`),
          type: 'public',
          description: 'National Independence Day',
          isRecurring: true,
          isActive: true
        },
        {
          name: 'Christmas Day',
          date: new Date(`${currentYear}-12-25`),
          type: 'public',
          description: 'Christmas celebration',
          isRecurring: true,
          isActive: true
        }
      ];

      await Holiday.bulkCreate(sampleHolidays);
      console.log(`✅ Created ${sampleHolidays.length} sample holidays`);
    }

    console.log('');

    // ============================================
    // PHASE 3: Manual Attendance Corrections
    // ============================================
    console.log('🔧 Phase 3: Updating AttendanceRecord table for corrections...');

    // Update AttendanceRecord table with correction fields
    await AttendanceRecord.sync({ alter: true });
    console.log('✅ AttendanceRecord table updated with correction fields');
    console.log('   - Added: correctionReason, correctionType, correctedBy, correctedAt');
    console.log('   - Added: flaggedReason, flaggedBy, flaggedAt');
    console.log('   - Updated: status enum to include pending_correction, corrected');

    console.log('');

    // ============================================
    // PHASE 4: Lead Management System
    // ============================================
    console.log('💼 Phase 4: Creating Lead Management tables...');

    // Create Lead table
    await Lead.sync({ alter: true });
    console.log('✅ Lead table created/updated');

    // Create LeadActivity table
    await LeadActivity.sync({ alter: true });
    console.log('✅ LeadActivity table created/updated');

    // Create LeadNote table
    await LeadNote.sync({ alter: true });
    console.log('✅ LeadNote table created/updated');

    console.log('');

    // ============================================
    // VERIFICATION
    // ============================================
    console.log('🔍 Verifying tables...');

    const tables = await sequelize.getQueryInterface().showAllTables();
    const requiredTables = [
      'leave_types',
      'holidays',
      'leads',
      'lead_activities',
      'lead_notes'
    ];

    const missingTables = requiredTables.filter(table => !tables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('⚠️  Warning: Some tables were not created:');
      missingTables.forEach(table => console.log(`   - ${table}`));
    } else {
      console.log('✅ All required tables verified');
    }

    console.log('');
    console.log('🎉 Phase 2, 3, 4 Migration completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('   Phase 2: Leave Types & Holiday Management ✅');
    console.log('   Phase 3: Attendance Corrections ✅');
    console.log('   Phase 4: Lead Management System ✅');
    console.log('');
    console.log('🚀 You can now:');
    console.log('   1. Test Leave Types API: /api/admin/leave-types');
    console.log('   2. Test Holidays API: /api/admin/holidays');
    console.log('   3. Test Attendance Corrections: /api/admin/attendance-corrections');
    console.log('   4. Test Lead Management: /api/admin/leads');
    console.log('');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default runMigration;
