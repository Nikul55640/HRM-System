/**
 * HRM System Model Restructure Migration
 * Date: 2024-12-24
 * 
 * This migration restructures the HRM system models according to the new requirements:
 * - Simplifies user roles to SuperAdmin, HR, Employee
 * - Restructures Employee model with proper fields
 * - Enhances AttendanceRecord with break tracking
 * - Simplifies leave management
 * - Adds AuditLog and SystemPolicy models
 * - Removes deprecated models
 */

import { DataTypes } from 'sequelize';

export const up = async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
        console.log('Starting HRM Model Restructure Migration...');

        // 1. Update Users table - Simplify roles
        console.log('1. Updating Users table roles...');
        await queryInterface.changeColumn('users', 'role', {
            type: DataTypes.ENUM('SuperAdmin', 'HR', 'Employee'),
            defaultValue: 'Employee',
            allowNull: false
        }, { transaction });

        // Update existing role values
        await queryInterface.sequelize.query(`
      UPDATE users SET role = 'HR' WHERE role IN ('HR Administrator', 'HR Manager', 'Manager');
    `, { transaction });

        // 2. Restructure Employees table
        console.log('2. Restructuring Employees table...');

        // Add new structured fields
        const employeeColumns = [
            { name: 'firstName', type: DataTypes.STRING, allowNull: false },
            { name: 'lastName', type: DataTypes.STRING, allowNull: false },
            { name: 'email', type: DataTypes.STRING, unique: true, allowNull: false },
            { name: 'phone', type: DataTypes.STRING, allowNull: true },
            { name: 'dateOfBirth', type: DataTypes.DATEONLY, allowNull: true },
            { name: 'gender', type: DataTypes.ENUM('male', 'female', 'other'), allowNull: true },
            { name: 'address', type: DataTypes.JSON, defaultValue: {} },
            { name: 'profilePicture', type: DataTypes.STRING, allowNull: true },
            { name: 'designation', type: DataTypes.STRING, allowNull: true },
            { name: 'department', type: DataTypes.STRING, allowNull: true },
            { name: 'joiningDate', type: DataTypes.DATEONLY, allowNull: true },
            { name: 'employmentType', type: DataTypes.ENUM('full_time', 'part_time', 'contract', 'intern'), defaultValue: 'full_time' },
            { name: 'reportingManager', type: DataTypes.INTEGER, allowNull: true },
            { name: 'bankDetails', type: DataTypes.JSON, defaultValue: {} },
            { name: 'emergencyContact', type: DataTypes.JSON, defaultValue: {} }
        ];

        for (const column of employeeColumns) {
            try {
                await queryInterface.addColumn('employees', column.name, column, { transaction });
            } catch (error) {
                if (!error.message.includes('already exists')) {
                    throw error;
                }
            }
        }

        // Update status enum
        await queryInterface.changeColumn('employees', 'status', {
            type: DataTypes.ENUM('Active', 'Inactive', 'Terminated'),
            defaultValue: 'Active'
        }, { transaction });

        // Add indexes for employees
        try {
            await queryInterface.addIndex('employees', ['email'], { unique: true, transaction });
            await queryInterface.addIndex('employees', ['department'], { transaction });
            await queryInterface.addIndex('employees', ['reportingManager'], { transaction });
        } catch (error) {
            console.log('Some employee indexes may already exist:', error.message);
        }

        // 3. Update AttendanceRecord table
        console.log('3. Updating AttendanceRecord table...');

        // Rename columns if they exist
        try {
            await queryInterface.renameColumn('attendance_records', 'checkIn', 'clockIn', { transaction });
        } catch (error) {
            console.log('clockIn column may already exist or checkIn may not exist');
        }

        try {
            await queryInterface.renameColumn('attendance_records', 'checkOut', 'clockOut', { transaction });
        } catch (error) {
            console.log('clockOut column may already exist or checkOut may not exist');
        }

        // Add new attendance columns
        const attendanceColumns = [
            { name: 'clockIn', type: DataTypes.DATE, allowNull: true },
            { name: 'clockOut', type: DataTypes.DATE, allowNull: true },
            { name: 'breakSessions', type: DataTypes.JSON, defaultValue: [] },
            { name: 'totalBreakMinutes', type: DataTypes.INTEGER, defaultValue: 0 },
            { name: 'totalWorkedMinutes', type: DataTypes.INTEGER, defaultValue: 0 },
            { name: 'correctionRequested', type: DataTypes.BOOLEAN, defaultValue: false },
            { name: 'correctionReason', type: DataTypes.TEXT, allowNull: true },
            { name: 'correctionStatus', type: DataTypes.ENUM('pending', 'approved', 'rejected'), allowNull: true }
        ];

        for (const column of attendanceColumns) {
            try {
                await queryInterface.addColumn('attendance_records', column.name, column, { transaction });
            } catch (error) {
                if (!error.message.includes('already exists')) {
                    console.log(`Column ${column.name} may already exist:`, error.message);
                }
            }
        }

        // Update status enum for attendance
        await queryInterface.changeColumn('attendance_records', 'status', {
            type: DataTypes.ENUM('present', 'absent', 'leave', 'half_day', 'holiday'),
            defaultValue: 'present'
        }, { transaction });

        // 4. Update LeaveRequest table
        console.log('4. Updating LeaveRequest table...');

        // Update leave type enum
        await queryInterface.changeColumn('leave_requests', 'leaveType', {
            type: DataTypes.ENUM('Casual', 'Sick', 'Paid'),
            allowNull: false
        }, { transaction });

        // Add leave cancellation columns
        const leaveColumns = [
            { name: 'cancelledAt', type: DataTypes.DATE, allowNull: true },
            { name: 'cancellationReason', type: DataTypes.TEXT, allowNull: true },
            { name: 'canCancel', type: DataTypes.BOOLEAN, defaultValue: true }
        ];

        for (const column of leaveColumns) {
            try {
                await queryInterface.addColumn('leave_requests', column.name, column, { transaction });
            } catch (error) {
                if (!error.message.includes('already exists')) {
                    console.log(`Column ${column.name} may already exist:`, error.message);
                }
            }
        }

        // 5. Update LeaveBalance table
        console.log('5. Updating LeaveBalance table...');

        // Update leave type enum
        await queryInterface.changeColumn('leave_balances', 'leaveType', {
            type: DataTypes.ENUM('Casual', 'Sick', 'Paid'),
            allowNull: false
        }, { transaction });

        // 6. Update Lead table
        console.log('6. Updating Lead table...');

        // Add followUpNotes column
        try {
            await queryInterface.addColumn('leads', 'followUpNotes', {
                type: DataTypes.JSON,
                defaultValue: []
            }, { transaction });
        } catch (error) {
            if (!error.message.includes('already exists')) {
                console.log('followUpNotes column may already exist:', error.message);
            }
        }

        try {
            await queryInterface.addColumn('leads', 'updatedBy', {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'employees',
                    key: 'id'
                }
            }, { transaction });
        } catch (error) {
            if (!error.message.includes('already exists')) {
                console.log('updatedBy column may already exist:', error.message);
            }
        }

        // 7. Create AuditLog table
        console.log('7. Creating AuditLog table...');
        await queryInterface.createTable('audit_logs', {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            action: {
                type: DataTypes.ENUM(
                    'login', 'logout', 'profile_update', 'password_change',
                    'attendance_clock_in', 'attendance_clock_out', 'attendance_break_in', 'attendance_break_out',
                    'attendance_edit', 'attendance_correction_request', 'attendance_correction_approve', 'attendance_correction_reject',
                    'leave_apply', 'leave_approve', 'leave_reject', 'leave_cancel', 'leave_balance_assign', 'leave_balance_adjust',
                    'employee_create', 'employee_update', 'employee_delete', 'employee_activate', 'employee_deactivate',
                    'role_change', 'permission_change', 'lead_create', 'lead_update', 'lead_assign',
                    'shift_create', 'shift_update', 'shift_assign', 'shift_change_request',
                    'holiday_create', 'holiday_update', 'event_create', 'event_update',
                    'policy_update', 'system_config_change', 'unauthorized_access_attempt'
                ),
                allowNull: false,
            },
            module: {
                type: DataTypes.ENUM('authentication', 'profile', 'attendance', 'leave', 'employee', 'lead', 'shift', 'calendar', 'system', 'security'),
                allowNull: false,
            },
            targetType: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            targetId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            oldValues: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            newValues: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            ipAddress: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            userAgent: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            sessionId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            severity: {
                type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
                defaultValue: 'low',
            },
            isSuccessful: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            errorMessage: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            metadata: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        }, { transaction });

        // Add indexes for audit_logs
        await queryInterface.addIndex('audit_logs', ['userId'], { transaction });
        await queryInterface.addIndex('audit_logs', ['action'], { transaction });
        await queryInterface.addIndex('audit_logs', ['module'], { transaction });
        await queryInterface.addIndex('audit_logs', ['createdAt'], { transaction });
        await queryInterface.addIndex('audit_logs', ['severity'], { transaction });
        await queryInterface.addIndex('audit_logs', ['isSuccessful'], { transaction });
        await queryInterface.addIndex('audit_logs', ['targetType', 'targetId'], { transaction });

        // 8. Create SystemPolicy table
        console.log('8. Creating SystemPolicy table...');
        await queryInterface.createTable('system_policies', {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            policyType: {
                type: DataTypes.ENUM('attendance', 'leave', 'shift', 'security', 'general'),
                allowNull: false,
            },
            policyKey: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            policyName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            policyValue: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            createdBy: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            updatedBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
        }, { transaction });

        // Add indexes for system_policies
        await queryInterface.addIndex('system_policies', ['policyType'], { transaction });
        await queryInterface.addIndex('system_policies', ['policyKey'], { unique: true, transaction });
        await queryInterface.addIndex('system_policies', ['isActive'], { transaction });

        // 9. Drop deprecated tables if they exist
        console.log('9. Dropping deprecated tables...');
        const tablesToDrop = ['employee_profiles', 'leave_types', 'lead_activities', 'lead_notes', 'notifications', 'configs'];

        for (const table of tablesToDrop) {
            try {
                await queryInterface.dropTable(table, { transaction });
                console.log(`Dropped table: ${table}`);
            } catch (error) {
                console.log(`Table ${table} may not exist or already dropped:`, error.message);
            }
        }

        // 10. Remove deprecated columns
        console.log('10. Removing deprecated columns...');
        try {
            await queryInterface.removeColumn('leave_requests', 'leaveTypeId', { transaction });
            await queryInterface.removeColumn('leave_requests', 'documents', { transaction });
            await queryInterface.removeColumn('leave_balances', 'leaveTypeId', { transaction });
        } catch (error) {
            console.log('Some deprecated columns may not exist:', error.message);
        }

        // Remove deprecated columns from leads
        try {
            await queryInterface.removeColumn('leads', 'tags', { transaction });
            await queryInterface.removeColumn('leads', 'customFields', { transaction });
        } catch (error) {
            console.log('Some lead columns may not exist:', error.message);
        }

        // Remove deprecated columns from employees
        try {
            await queryInterface.removeColumn('employees', 'personalInfo', { transaction });
            await queryInterface.removeColumn('employees', 'contactInfo', { transaction });
            await queryInterface.removeColumn('employees', 'jobInfo', { transaction });
            await queryInterface.removeColumn('employees', 'documentsList', { transaction });
        } catch (error) {
            console.log('Some employee columns may not exist:', error.message);
        }

        await transaction.commit();
        console.log('✅ HRM Model Restructure Migration completed successfully!');

    } catch (error) {
        await transaction.rollback();
        console.error('❌ Migration failed:', error);
        throw error;
    }
};

export const down = async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
        console.log('Rolling back HRM Model Restructure Migration...');

        // This is a complex rollback - in production, you might want to backup data first
        console.log('⚠️  Warning: This rollback will remove new tables and columns');

        // Drop new tables
        await queryInterface.dropTable('audit_logs', { transaction });
        await queryInterface.dropTable('system_policies', { transaction });

        // Revert user roles
        await queryInterface.changeColumn('users', 'role', {
            type: DataTypes.ENUM('SuperAdmin', 'HR Administrator', 'HR Manager', 'Manager', 'Employee'),
            defaultValue: 'Employee'
        }, { transaction });

        await transaction.commit();
        console.log('✅ Migration rollback completed');

    } catch (error) {
        await transaction.rollback();
        console.error('❌ Rollback failed:', error);
        throw error;
    }
};