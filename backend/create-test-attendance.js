/**
 * Create Test Attendance Data
 * This script creates sample attendance records for testing the live attendance feature
 */

import sequelize from './src/config/sequelize.js';
import { AttendanceRecord, Employee } from './src/models/sequelize/index.js';

const createTestAttendance = async () => {
  try {
    console.log('🕐 Creating test attendance data...');

    // Get all active employees
    const employees = await Employee.findAll({
      where: { status: 'Active' },
      limit: 5 // Just use first 5 employees for testing
    });

    if (employees.length === 0) {
      console.log('❌ No employees found. Please run the seed script first.');
      return;
    }

    console.log(`📊 Found ${employees.length} employees to create attendance for`);

    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Create attendance records for today
    const attendancePromises = employees.map(async (employee, index) => {
      // Create different scenarios for testing
      const scenarios = [
        // Employee 1: Currently active (clocked in 4 hours ago)
        {
          checkIn: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          checkOut: null,
          status: 'present',
          sessions: [{
            sessionId: `session-${employee.id}-1`,
            checkIn: new Date(Date.now() - 4 * 60 * 60 * 1000),
            workLocation: 'office',
            locationDetails: 'Main Office - Floor 3',
            status: 'active',
            breaks: [{
              breakId: `break-${employee.id}-1`,
              startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
              endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15 * 60 * 1000), // 15 min break
              durationMinutes: 15
            }],
            totalBreakMinutes: 15,
            workedMinutes: 225 // 4 hours - 15 min break
          }]
        },
        // Employee 2: On break (clocked in 3 hours ago, on break for 10 minutes)
        {
          checkIn: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          checkOut: null,
          status: 'present',
          sessions: [{
            sessionId: `session-${employee.id}-1`,
            checkIn: new Date(Date.now() - 3 * 60 * 60 * 1000),
            workLocation: 'wfh',
            locationDetails: 'Home Office',
            status: 'on_break',
            breaks: [{
              breakId: `break-${employee.id}-1`,
              startTime: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
              endTime: null, // Currently on break
              durationMinutes: 10
            }],
            totalBreakMinutes: 10,
            workedMinutes: 170 // 3 hours - 10 min current break
          }]
        },
        // Employee 3: Full day completed
        {
          checkIn: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          checkOut: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          status: 'present',
          sessions: [{
            sessionId: `session-${employee.id}-1`,
            checkIn: new Date(Date.now() - 8 * 60 * 60 * 1000),
            checkOut: new Date(Date.now() - 30 * 60 * 1000),
            workLocation: 'client_site',
            locationDetails: 'Client Office - Downtown',
            status: 'completed',
            breaks: [
              {
                breakId: `break-${employee.id}-1`,
                startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
                endTime: new Date(Date.now() - 6 * 60 * 60 * 1000 + 15 * 60 * 1000),
                durationMinutes: 15
              },
              {
                breakId: `break-${employee.id}-2`,
                startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
                endTime: new Date(Date.now() - 4 * 60 * 60 * 1000 + 30 * 60 * 1000),
                durationMinutes: 30
              }
            ],
            totalBreakMinutes: 45,
            workedMinutes: 405 // 7.5 hours - 45 min breaks
          }]
        },
        // Employee 4: Just clocked in
        {
          checkIn: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          checkOut: null,
          status: 'present',
          sessions: [{
            sessionId: `session-${employee.id}-1`,
            checkIn: new Date(Date.now() - 30 * 60 * 1000),
            workLocation: 'office',
            locationDetails: 'Main Office - Floor 2',
            status: 'active',
            breaks: [],
            totalBreakMinutes: 0,
            workedMinutes: 30
          }]
        },
        // Employee 5: Late arrival, currently active
        {
          checkIn: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (late)
          checkOut: null,
          status: 'present',
          sessions: [{
            sessionId: `session-${employee.id}-1`,
            checkIn: new Date(Date.now() - 2 * 60 * 60 * 1000),
            workLocation: 'wfh',
            locationDetails: 'Home Office',
            status: 'active',
            breaks: [],
            totalBreakMinutes: 0,
            workedMinutes: 120
          }],
          isLate: true,
          lateMinutes: 60 // 1 hour late
        }
      ];

      const scenario = scenarios[index % scenarios.length];
      
      // Check if record already exists for today
      const existingRecord = await AttendanceRecord.findOne({
        where: {
          employeeId: employee.id,
          date: dateOnly
        }
      });

      if (existingRecord) {
        console.log(`⚠️  Attendance record already exists for employee ${employee.employeeId}`);
        return existingRecord;
      }

      // Create the attendance record
      const record = await AttendanceRecord.create({
        employeeId: employee.id,
        date: dateOnly,
        checkIn: scenario.checkIn,
        checkOut: scenario.checkOut,
        status: scenario.status,
        statusReason: 'Test data',
        sessions: scenario.sessions || [],
        isLate: scenario.isLate || false,
        lateMinutes: scenario.lateMinutes || 0,
        workedMinutes: scenario.sessions?.[0]?.workedMinutes || 0,
        workHours: Math.round((scenario.sessions?.[0]?.workedMinutes || 0) / 60 * 100) / 100,
        breakTime: scenario.sessions?.[0]?.totalBreakMinutes || 0,
        source: 'test',
        createdBy: 1, // Admin user
        updatedBy: 1
      });

      console.log(`✅ Created attendance record for ${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName} (${employee.employeeId})`);
      return record;
    });

    const records = await Promise.all(attendancePromises);
    
    console.log(`🎉 Successfully created ${records.length} test attendance records!`);
    console.log('');
    console.log('📋 Test Data Summary:');
    console.log('- Employee 1: Currently active (4 hours worked)');
    console.log('- Employee 2: On break (3 hours worked, currently on break)');
    console.log('- Employee 3: Completed full day (7.5 hours worked)');
    console.log('- Employee 4: Just clocked in (30 minutes worked)');
    console.log('- Employee 5: Late arrival, currently active (2 hours worked)');
    console.log('');
    console.log('🔄 Now refresh your AttendanceAdminList page to see the live attendance data!');

  } catch (error) {
    console.error('❌ Error creating test attendance data:', error);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
};

// Run the script
createTestAttendance();