import sequelize from '../config/sequelize.js';
import LeaveType from '../models/sequelize/LeaveType.js';
import Holiday from '../models/sequelize/Holiday.js';

const runPhase2Migration = async () => {
  try {
    console.log('🔄 Starting Phase 2 Migration: Leave Types & Holiday Management...');
    console.log('');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Create LeaveType table
    await LeaveType.sync({ alter: true });
    console.log('✅ LeaveType table created/updated');

    // Create Holiday table
    await Holiday.sync({ alter: true });
    console.log('✅ Holiday table created/updated');

    // Seed default leave types
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
        }
      ];

      await LeaveType.bulkCreate(defaultLeaveTypes);
      co