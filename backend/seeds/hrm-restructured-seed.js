/**
 * HRM System Restructured Seed Data
 * Date: 2024-12-24
 * 
 * This seed file creates initial data for the restructured HRM system:
 * - Default SuperAdmin user
 * - Sample HR and Employee users
 * - Default system policies
 * - Sample departments and shifts
 * - Initial leave balances
 */

import bcrypt from 'bcryptjs';
import {
    User, Employee, Department, Shift, EmployeeShift,
    LeaveBalance, Holiday, SystemPolicy, AuditLog
} from '../src/models/sequelize/index.js';

const seedData = async () => {
    try {
        console.log('🌱 Starting HRM Restructured Seed...');

        // 1. Create Default System Policies
        console.log('1. Creating default system policies...');
        const defaultPolicies = [
            {
                policyKey: 'attendance_grace_period_minutes',
                policyType: 'attendance',
                policyName: 'Attendance Grace Period (Minutes)',
                policyValue: { value: 10, unit: 'minutes' },
                description: 'Grace period for late clock-in before marking as late',
                createdBy: 1 // Will be SuperAdmin
            },
            {
                policyKey: 'attendance_late_threshold_minutes',
                policyType: 'attendance',
                policyName: 'Late Threshold (Minutes)',
                policyValue: { value: 15, unit: 'minutes' },
                description: 'Minutes after grace period to mark as late',
                createdBy: 1
            },
            {
                policyKey: 'attendance_max_break_minutes',
                policyType: 'attendance',
                policyName: 'Maximum Break Duration (Minutes)',
                policyValue: { value: 120, unit: 'minutes' },
                description: 'Maximum allowed break duration per day',
                createdBy: 1
            },
            {
                policyKey: 'leave_annual_quota',
                policyType: 'leave',
                policyName: 'Annual Leave Quota',
                policyValue: { Casual: 12, Sick: 12, Paid: 21 },
                description: 'Default annual leave quotas for new employees',
                createdBy: 1
            },
            {
                policyKey: 'leave_advance_notice_days',
                policyType: 'leave',
                policyName: 'Leave Advance Notice (Days)',
                policyValue: { Casual: 1, Sick: 0, Paid: 7 },
                description: 'Required advance notice for different leave types',
                createdBy: 1
            },
            {
                policyKey: 'leave_cancellation_policy',
                policyType: 'leave',
                policyName: 'Leave Cancellation Policy',
                policyValue: {
                    allowCancellation: true,
                    cutoffHours: 24,
                    refundPolicy: 'full'
                },
                description: 'Policy for leave cancellation and balance refund',
                createdBy: 1
            },
            {
                policyKey: 'security_session_timeout_minutes',
                policyType: 'security',
                policyName: 'Session Timeout (Minutes)',
                policyValue: { value: 480, unit: 'minutes' },
                description: 'User session timeout duration',
                createdBy: 1
            },
            {
                policyKey: 'security_password_policy',
                policyType: 'security',
                policyName: 'Password Policy',
                policyValue: {
                    minLength: 8,
                    requireUppercase: true,
                    requireLowercase: true,
                    requireNumbers: true,
                    requireSpecialChars: true,
                    expiryDays: 90
                },
                description: 'Password complexity and expiry requirements',
                createdBy: 1
            }
        ];

        // 2. Create Departments
        console.log('2. Creating departments...');
        const departments = [
            {
                name: 'Human Resources',
                code: 'HR',
                description: 'Human Resources Department',
                location: 'Head Office',
                isActive: true
            },
            {
                name: 'Information Technology',
                code: 'IT',
                description: 'Information Technology Department',
                location: 'Tech Center',
                isActive: true
            },
            {
                name: 'Finance',
                code: 'FIN',
                description: 'Finance and Accounting Department',
                location: 'Head Office',
                isActive: true
            },
            {
                name: 'Sales',
                code: 'SALES',
                description: 'Sales and Marketing Department',
                location: 'Sales Office',
                isActive: true
            }
        ];

        const createdDepartments = [];
        for (const dept of departments) {
            const [department, created] = await Department.findOrCreate({
                where: { code: dept.code },
                defaults: dept
            });
            createdDepartments.push(department);
            if (created) {
                console.log(`✅ Created department: ${dept.name}`);
            }
        }

        // 3. Create Default Shifts
        console.log('3. Creating default shifts...');
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
                weeklyOffDays: [0, 6], // Sunday and Saturday
                isActive: true,
                isDefault: true,
                description: 'Standard 9 AM to 5 PM shift',
                createdBy: 1
            },
            {
                shiftName: 'Early Morning Shift',
                shiftCode: 'EARLY-001',
                shiftStartTime: '07:00:00',
                shiftEndTime: '15:00:00',
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
                isDefault: false,
                description: 'Early morning 7 AM to 3 PM shift',
                createdBy: 1
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

        // 4. Create Sample Employees
        console.log('4. Creating sample employees...');
        const employees = [
            {
                employeeId: 'EMP-001',
                firstName: 'Super',
                lastName: 'Admin',
                email: 'admin@hrm.com',
                phone: '+1234567890',
                dateOfBirth: '1985-01-15',
                gender: 'male',
                address: {
                    street: '123 Admin Street',
                    city: 'Admin City',
                    state: 'Admin State',
                    country: 'Admin Country',
                    zipCode: '12345'
                },
                designation: 'System Administrator',
                department: 'Information Technology',
                joiningDate: '2020-01-01',
                employmentType: 'full_time',
                bankDetails: {
                    accountHolderName: 'Super Admin',
                    bankName: 'Admin Bank',
                    accountNumber: '1234567890',
                    ifscCode: 'ADMIN001',
                    isVerified: true
                },
                emergencyContact: {
                    name: 'Emergency Contact',
                    relationship: 'Spouse',
                    phone: '+1234567891',
                    email: 'emergency@example.com'
                },
                status: 'Active',
                isActive: true
            },
            {
                employeeId: 'EMP-002',
                firstName: 'HR',
                lastName: 'Manager',
                email: 'hr@hrm.com',
                phone: '+1234567892',
                dateOfBirth: '1988-03-20',
                gender: 'female',
                address: {
                    street: '456 HR Avenue',
                    city: 'HR City',
                    state: 'HR State',
                    country: 'HR Country',
                    zipCode: '23456'
                },
                designation: 'HR Manager',
                department: 'Human Resources',
                joiningDate: '2021-02-15',
                employmentType: 'full_time',
                reportingManager: 1, // Reports to Super Admin
                bankDetails: {
                    accountHolderName: 'HR Manager',
                    bankName: 'HR Bank',
                    accountNumber: '2345678901',
                    ifscCode: 'HR001',
                    isVerified: true
                },
                emergencyContact: {
                    name: 'HR Emergency',
                    relationship: 'Parent',
                    phone: '+1234567893',
                    email: 'hr-emergency@example.com'
                },
                status: 'Active',
                isActive: true
            },
            {
                employeeId: 'EMP-003',
                firstName: 'John',
                lastName: 'Employee',
                email: 'john@hrm.com',
                phone: '+1234567894',
                dateOfBirth: '1992-07-10',
                gender: 'male',
                address: {
                    street: '789 Employee Lane',
                    city: 'Employee City',
                    state: 'Employee State',
                    country: 'Employee Country',
                    zipCode: '34567'
                },
                designation: 'Software Developer',
                department: 'Information Technology',
                joiningDate: '2022-06-01',
                employmentType: 'full_time',
                reportingManager: 1, // Reports to Super Admin
                bankDetails: {
                    accountHolderName: 'John Employee',
                    bankName: 'Employee Bank',
                    accountNumber: '3456789012',
                    ifscCode: 'EMP001',
                    isVerified: false
                },
                emergencyContact: {
                    name: 'John Emergency',
                    relationship: 'Sibling',
                    phone: '+1234567895',
                    email: 'john-emergency@example.com'
                },
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

        // 5. Create Users
        console.log('5. Creating users...');
        const users = [
            {
                name: 'Super Admin',
                email: 'admin@hrm.com',
                password: 'admin123', // Let the model hook handle hashing
                role: 'SuperAdmin',
                isActive: true,
                employeeId: createdEmployees[0].id
            },
            {
                name: 'HR Manager',
                email: 'hr@hrm.com',
                password: 'hr123', // Let the model hook handle hashing
                role: 'HR',
                isActive: true,
                employeeId: createdEmployees[1].id
            },
            {
                name: 'John Employee',
                email: 'john@hrm.com',
                password: 'john123', // Let the model hook handle hashing
                role: 'Employee',
                isActive: true,
                employeeId: createdEmployees[2].id
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

        // Update policy createdBy with actual SuperAdmin ID
        for (const policy of defaultPolicies) {
            policy.createdBy = createdUsers[0].id;
        }

        // Create policies
        for (const policy of defaultPolicies) {
            const [policyRecord, created] = await SystemPolicy.findOrCreate({
                where: { policyKey: policy.policyKey },
                defaults: policy
            });
            if (created) {
                console.log(`✅ Created policy: ${policy.policyName}`);
            }
        }

        // 6. Assign Shifts to Employees
        console.log('6. Assigning shifts to employees...');
        const currentYear = new Date().getFullYear();
        const currentDate = new Date(`${currentYear}-01-01`);

        for (let i = 0; i < createdEmployees.length; i++) {
            const [shiftAssignment, created] = await EmployeeShift.findOrCreate({
                where: {
                    employeeId: createdEmployees[i].id,
                    effectiveDate: currentDate
                },
                defaults: {
                    employeeId: createdEmployees[i].id,
                    shiftId: createdShifts[0].id, // Assign default shift
                    effectiveDate: currentDate,
                    isActive: true,
                    assignedBy: createdUsers[0].id,
                    notes: 'Initial shift assignment'
                }
            });
            if (created) {
                console.log(`✅ Assigned shift to employee: ${createdEmployees[i].firstName}`);
            }
        }

        // 7. Create Leave Balances
        console.log('7. Creating leave balances...');
        const leaveTypes = ['Casual', 'Sick', 'Paid'];
        const defaultQuotas = { Casual: 12, Sick: 12, Paid: 21 };

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
                        createdBy: createdUsers[1].id // HR Manager
                    }
                });
                if (created) {
                    console.log(`✅ Created ${leaveType} leave balance for ${employee.firstName}`);
                }
            }
        }

        // 8. Create Sample Holidays
        console.log('8. Creating sample holidays...');
        const holidays = [
            {
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
            },
            {
                name: 'Independence Day',
                date: `${currentYear}-07-04`,
                type: 'national',
                description: 'National Independence Day',
                isPaid: true,
                isRecurring: true,
                recurrencePattern: 'yearly',
                color: '#dc2626',
                isActive: true,
                createdBy: createdUsers[0].id
            },
            {
                name: 'Christmas Day',
                date: `${currentYear}-12-25`,
                type: 'public',
                description: 'Christmas celebration',
                isPaid: true,
                isRecurring: true,
                recurrencePattern: 'yearly',
                color: '#dc2626',
                isActive: true,
                createdBy: createdUsers[0].id
            }
        ];

        for (const holiday of holidays) {
            const [holidayRecord, created] = await Holiday.findOrCreate({
                where: {
                    name: holiday.name,
                    date: holiday.date
                },
                defaults: holiday
            });
            if (created) {
                console.log(`✅ Created holiday: ${holiday.name}`);
            }
        }

        // 9. Create Initial Audit Log Entry
        console.log('9. Creating initial audit log entry...');
        await AuditLog.logAction({
            userId: createdUsers[0].id,
            action: 'system_config_change',
            module: 'system',
            description: 'HRM System initialized with seed data',
            severity: 'medium',
            isSuccessful: true,
            metadata: {
                seedVersion: '1.0',
                seedDate: new Date().toISOString(),
                itemsCreated: {
                    users: createdUsers.length,
                    employees: createdEmployees.length,
                    departments: createdDepartments.length,
                    shifts: createdShifts.length,
                    policies: defaultPolicies.length
                }
            }
        });

        console.log('🎉 HRM Restructured Seed completed successfully!');
        console.log('\n📋 Default Login Credentials:');
        console.log('SuperAdmin: admin@hrm.com / admin123');
        console.log('HR Manager: hr@hrm.com / hr123');
        console.log('Employee: john@hrm.com / john123');
        console.log('\n⚠️  Please change default passwords in production!');

    } catch (error) {
        console.error('❌ Seed failed:', error);
        throw error;
    }
};

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedData()
        .then(() => {
            console.log('Seed completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Seed failed:', error);
            process.exit(1);
        });
}

export default seedData;