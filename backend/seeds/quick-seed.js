/**
 * Quick Seed for HRM System - Fixed Dependencies
 * This creates data in the correct order to avoid foreign key issues
 */

import bcrypt from 'bcryptjs';
import {
    User, Employee, Department, Shift, EmployeeShift,
    LeaveBalance, Holiday, SystemPolicy, AuditLog
} from '../src/models/sequelize/index.js';

const quickSeed = async () => {
    try {
        console.log('🌱 Starting Quick HRM Seed...');

        // 1. Create Employees FIRST (no foreign key dependencies)
        // Note: SuperAdmin users don't need employee records
        console.log('1. Creating employees...');
        const employees = [
            {
                employeeId: 'EMP-002',
                firstName: 'HR',
                lastName: 'Manager',
                email: 'hr@hrm.com',
                phone: '+1234567892',
                designation: 'HR Manager',
                department: 'Human Resources',
                status: 'Active',
                isActive: true
            },
            {
                employeeId: 'EMP-003',
                firstName: 'John',
                lastName: 'Employee',
                email: 'john@hrm.com',
                phone: '+1234567894',
                designation: 'Software Developer',
                department: 'Information Technology',
                status: 'Active',
                isActive: true
            }
        ];

        const createdEmployees = [];
        for (const emp of employees) {
            const [employee, created] = await Employee.findOrCreate({
                where: { employeeId: emp.employeeId },
                defaults: emp
            });
            createdEmployees.push(employee);
            if (created) {
                console.log(`✅ Created employee: ${emp.firstName} ${emp.lastName}`);
            }
        }

        // 2. Create Users (SuperAdmin without employee record, others with employee records)
        console.log('2. Creating users...');
        const users = [
            {
                name: 'Super Admin',
                email: 'admin@hrm.com',
                password: 'admin123', // Let the model hook handle hashing
                role: 'SuperAdmin',
                isActive: true,
                employeeId: null // SuperAdmin doesn't have an employee record
            },
            {
                name: 'HR Manager',
                email: 'hr@hrm.com',
                password: 'hr123', // Let the model hook handle hashing
                role: 'HR Manager',
                isActive: true,
                employeeId: createdEmployees[0].id // HR Manager employee
            },
            {
                name: 'John Employee',
                email: 'john@hrm.com',
                password: 'john123', // Let the model hook handle hashing
                role: 'Employee',
                isActive: true,
                employeeId: createdEmployees[1].id // Regular employee
            }
        ];

        const createdUsers = [];
        for (const user of users) {
            const [userRecord, created] = await User.findOrCreate({
                where: { email: user.email },
                defaults: user
            });
            createdUsers.push(userRecord);
            if (created) {
                console.log(`✅ Created user: ${user.name}`);
            }
        }

        // 3. Create Departments (no dependencies)
        console.log('3. Creating departments...');
        const departments = [
            { name: 'Human Resources', code: 'HR', isActive: true },
            { name: 'Information Technology', code: 'IT', isActive: true },
            { name: 'Finance', code: 'FIN', isActive: true },
            { name: 'Sales', code: 'SALES', isActive: true }
        ];

        for (const dept of departments) {
            const [department, created] = await Department.findOrCreate({
                where: { code: dept.code },
                defaults: dept
            });
            if (created) {
                console.log(`✅ Created department: ${dept.name}`);
            }
        }

        // 4. Create Shifts (now we have users for createdBy)
        console.log('4. Creating shifts...');
        const shifts = [
            {
                shiftName: 'Regular Day Shift',
                shiftCode: 'DAY-001',
                shiftStartTime: '09:00:00',
                shiftEndTime: '17:00:00',
                fullDayHours: 8.00,
                halfDayHours: 4.00,
                gracePeriodMinutes: 10,
                lateThresholdMinutes: 15,
                earlyDepartureThresholdMinutes: 15,
                defaultBreakMinutes: 60,
                maxBreakMinutes: 120,
                overtimeEnabled: true,
                overtimeThresholdMinutes: 30,
                weeklyOffDays: [0, 6],
                isActive: true,
                isDefault: true,
                description: 'Standard 9 AM to 5 PM shift',
                createdBy: createdUsers[0].id // Now we have a valid user ID
            }
        ];

        const createdShifts = [];
        for (const shift of shifts) {
            const [shiftRecord, created] = await Shift.findOrCreate({
                where: { shiftCode: shift.shiftCode },
                defaults: shift
            });
            createdShifts.push(shiftRecord);
            if (created) {
                console.log(`✅ Created shift: ${shift.shiftName}`);
            }
        }

        // 5. Create System Policies
        console.log('5. Creating system policies...');
        const policies = [
            {
                policyKey: 'attendance_grace_period_minutes',
                policyType: 'attendance',
                policyName: 'Attendance Grace Period (Minutes)',
                policyValue: { value: 10, unit: 'minutes' },
                description: 'Grace period for late clock-in before marking as late',
                createdBy: createdUsers[0].id
            },
            {
                policyKey: 'leave_annual_quota',
                policyType: 'leave',
                policyName: 'Annual Leave Quota',
                policyValue: { Casual: 12, Sick: 12, Paid: 21 },
                description: 'Default annual leave quotas for new employees',
                createdBy: createdUsers[0].id
            }
        ];

        for (const policy of policies) {
            const [policyRecord, created] = await SystemPolicy.findOrCreate({
                where: { policyKey: policy.policyKey },
                defaults: policy
            });
            if (created) {
                console.log(`✅ Created policy: ${policy.policyName}`);
            }
        }

        // 6. Create Leave Balances (only for employees, not SuperAdmin)
        console.log('6. Creating leave balances...');
        const currentYear = new Date().getFullYear();
        const leaveTypes = ['Casual', 'Sick', 'Paid'];
        const defaultQuotas = { Casual: 12, Sick: 12, Paid: 21 };

        // Only create leave balances for actual employees (not SuperAdmin)
        for (const employee of createdEmployees) {
            for (const leaveType of leaveTypes) {
                const [leaveBalance, created] = await LeaveBalance.findOrCreate({
                    where: {
                        employeeId: employee.id,
                        year: currentYear,
                        leaveType: leaveType
                    },
                    defaults: {
                        employeeId: employee.id,
                        year: currentYear,
                        leaveType: leaveType,
                        allocated: defaultQuotas[leaveType],
                        used: 0,
                        pending: 0,
                        remaining: defaultQuotas[leaveType],
                        carryForward: 0,
                        createdBy: createdUsers[1].id // HR Manager (index 1 since SuperAdmin is index 0)
                    }
                });
                if (created) {
                    console.log(`✅ Created ${leaveType} leave balance for ${employee.firstName}`);
                }
            }
        }

        // 7. Assign Shifts to Employees (only for employees, not SuperAdmin)
        console.log('7. Assigning shifts...');
        const currentDate = new Date(`${currentYear}-01-01`);

        // Only assign shifts to actual employees (not SuperAdmin)
        for (const employee of createdEmployees) {
            const [shiftAssignment, created] = await EmployeeShift.findOrCreate({
                where: {
                    employeeId: employee.id,
                    effectiveDate: currentDate
                },
                defaults: {
                    employeeId: employee.id,
                    shiftId: createdShifts[0].id,
                    effectiveDate: currentDate,
                    isActive: true,
                    assignedBy: createdUsers[0].id, // SuperAdmin assigns shifts
                    notes: 'Initial shift assignment'
                }
            });
            if (created) {
                console.log(`✅ Assigned shift to ${employee.firstName}`);
            }
        }

        // 8. Create Sample Holiday
        console.log('8. Creating sample holiday...');
        const [holiday, created] = await Holiday.findOrCreate({
            where: {
                name: 'New Year\'s Day',
                date: `${currentYear}-01-01`
            },
            defaults: {
                name: 'New Year\'s Day',
                date: `${currentYear}-01-01`,
                type: 'public',
                description: 'New Year celebration',
                isPaid: true,
                isRecurring: true,
                recurrencePattern: 'yearly',
                color: '#dc2626',
                isActive: true,
                createdBy: createdUsers[0].id
            }
        });
        if (created) {
            console.log('✅ Created New Year holiday');
        }

        // 9. Create Initial Audit Log
        console.log('9. Creating audit log...');
        await AuditLog.logAction({
            userId: createdUsers[0].id,
            action: 'system_config_change',
            module: 'system',
            description: 'HRM System initialized with quick seed data',
            severity: 'medium',
            isSuccessful: true
        });

        console.log('🎉 Quick Seed completed successfully!');
        console.log('\n📋 Default Login Credentials:');
        console.log('SuperAdmin: admin@hrm.com / admin123');
        console.log('HR Manager: hr@hrm.com / hr123');
        console.log('Employee: john@hrm.com / john123');

    } catch (error) {
        console.error('❌ Quick Seed failed:', error);
        throw error;
    }
};

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    quickSeed()
        .then(() => {
            console.log('Quick seed completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Quick seed failed:', error);
            process.exit(1);
        });
}

export default quickSeed;