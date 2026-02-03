/**
 * Admin Configuration Controller
 * Handles system-wide configuration settings for administrators
 * Uses live database integration with SystemPolicy model
 */

import logger from '../../utils/logger.js';
import { SystemPolicy, AuditLog } from '../../models/index.js';
import { ROLES } from '../../config/roles.js';

/**
 * Wrapper for consistent API responses
 */
const sendResponse = (res, success, message, data = null, statusCode = 200) => {
    return res.status(statusCode).json({
        success,
        message,
        data,
    });
};

const adminConfigController = {
    // System Configuration
    getSystemConfig: async (req, res) => {
        try {
            // Role-based access control
            const userSystemRole = req.user.systemRole || req.user.role;
            if (userSystemRole !== ROLES.SUPER_ADMIN) {
                return sendResponse(res, false, "Unauthorized: Only Super Admin can access system configuration", null, 403);
            }

            // Get system-related policies from database
            const systemPolicies = await SystemPolicy.getPoliciesByType('general');
            
            // Transform policies into configuration format
            const systemConfig = {
                companyName: await SystemPolicy.getPolicy('company_name') || 'HRM Company',
                companyEmail: await SystemPolicy.getPolicy('company_email') || 'admin@hrmcompany.com',
                companyPhone: await SystemPolicy.getPolicy('company_phone') || '+1 (555) 123-4567',
                companyAddress: await SystemPolicy.getPolicy('company_address') || '123 Business Street, City, State 12345',
                timezone: await SystemPolicy.getPolicy('system_timezone') || 'UTC',
                dateFormat: await SystemPolicy.getPolicy('system_date_format') || 'DD/MM/YYYY',
                timeFormat: await SystemPolicy.getPolicy('system_time_format') || '24h',
                currency: await SystemPolicy.getPolicy('system_currency') || 'USD',
                language: await SystemPolicy.getPolicy('system_language') || 'en'
            };

            return sendResponse(res, true, "System configuration retrieved successfully", systemConfig);
        } catch (error) {
            logger.error("Controller: Get System Config Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    updateSystemConfig: async (req, res) => {
        try {
            // Role-based access control
            const userSystemRole = req.user.systemRole || req.user.role;
            if (userSystemRole !== ROLES.SUPER_ADMIN) {
                return sendResponse(res, false, "Unauthorized: Only Super Admin can update system configuration", null, 403);
            }

            const {
                companyName,
                companyEmail,
                companyPhone,
                companyAddress,
                timezone,
                dateFormat,
                timeFormat,
                currency,
                language
            } = req.body;

            const updates = [];

            // Update each configuration if provided
            if (companyName) {
                await SystemPolicy.setPolicy('company_name', companyName, req.user.id);
                updates.push('companyName');
            }
            if (companyEmail) {
                await SystemPolicy.setPolicy('company_email', companyEmail, req.user.id);
                updates.push('companyEmail');
            }
            if (companyPhone) {
                await SystemPolicy.setPolicy('company_phone', companyPhone, req.user.id);
                updates.push('companyPhone');
            }
            if (companyAddress) {
                await SystemPolicy.setPolicy('company_address', companyAddress, req.user.id);
                updates.push('companyAddress');
            }
            if (timezone) {
                await SystemPolicy.setPolicy('system_timezone', timezone, req.user.id);
                updates.push('timezone');
            }
            if (dateFormat) {
                await SystemPolicy.setPolicy('system_date_format', dateFormat, req.user.id);
                updates.push('dateFormat');
            }
            if (timeFormat) {
                await SystemPolicy.setPolicy('system_time_format', timeFormat, req.user.id);
                updates.push('timeFormat');
            }
            if (currency) {
                await SystemPolicy.setPolicy('system_currency', currency, req.user.id);
                updates.push('currency');
            }
            if (language) {
                await SystemPolicy.setPolicy('system_language', language, req.user.id);
                updates.push('language');
            }

            // Log the configuration update
            await AuditLog.logAction({
                userId: req.user.id,
                action: 'system_config_update',
                module: 'system',
                targetType: 'SystemConfiguration',
                newValues: req.body,
                description: `Updated system configuration: ${updates.join(', ')}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                severity: 'high'
            });

            logger.info("System configuration updated", { 
                updatedBy: req.user.id,
                updates: updates
            });

            // Return updated configuration
            const updatedConfig = {
                companyName: await SystemPolicy.getPolicy('company_name'),
                companyEmail: await SystemPolicy.getPolicy('company_email'),
                companyPhone: await SystemPolicy.getPolicy('company_phone'),
                companyAddress: await SystemPolicy.getPolicy('company_address'),
                timezone: await SystemPolicy.getPolicy('system_timezone'),
                dateFormat: await SystemPolicy.getPolicy('system_date_format'),
                timeFormat: await SystemPolicy.getPolicy('system_time_format'),
                currency: await SystemPolicy.getPolicy('system_currency'),
                language: await SystemPolicy.getPolicy('system_language')
            };

            return sendResponse(res, true, "System configuration updated successfully", updatedConfig);
        } catch (error) {
            logger.error("Controller: Update System Config Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    // Email Configuration
    getEmailSettings: async (req, res) => {
        try {
            // Role-based access control
            const userSystemRole = req.user.systemRole || req.user.role;
            if (userSystemRole !== ROLES.SUPER_ADMIN) {
                return sendResponse(res, false, "Unauthorized: Only Super Admin can access email settings", null, 403);
            }

            // Get email settings from database
            const emailConfig = await SystemPolicy.getPolicy('email_configuration') || {
                smtpHost: '',
                smtpPort: 587,
                smtpUser: '',
                smtpSecure: true,
                fromEmail: '',
                fromName: 'HRM System'
            };

            // Don't return password in response
            const safeEmailSettings = { ...emailConfig };
            delete safeEmailSettings.smtpPassword;
            
            return sendResponse(res, true, "Email settings retrieved successfully", safeEmailSettings);
        } catch (error) {
            logger.error("Controller: Get Email Settings Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    updateEmailSettings: async (req, res) => {
        try {
            // Role-based access control
            const userSystemRole = req.user.systemRole || req.user.role;
            if (userSystemRole !== ROLES.SUPER_ADMIN) {
                return sendResponse(res, false, "Unauthorized: Only Super Admin can update email settings", null, 403);
            }

            const {
                smtpHost,
                smtpPort,
                smtpUser,
                smtpPassword,
                smtpSecure,
                fromEmail,
                fromName
            } = req.body;

            // Get current email configuration
            const currentConfig = await SystemPolicy.getPolicy('email_configuration') || {};

            // Update email settings
            const updatedConfig = {
                ...currentConfig,
                ...(smtpHost && { smtpHost }),
                ...(smtpPort && { smtpPort: parseInt(smtpPort) }),
                ...(smtpUser && { smtpUser }),
                ...(smtpPassword && { smtpPassword }),
                ...(smtpSecure !== undefined && { smtpSecure }),
                ...(fromEmail && { fromEmail }),
                ...(fromName && { fromName })
            };

            // Save to database
            await SystemPolicy.setPolicy('email_configuration', updatedConfig, req.user.id);

            // Log the email settings update
            await AuditLog.logAction({
                userId: req.user.id,
                action: 'email_config_update',
                module: 'system',
                targetType: 'EmailConfiguration',
                newValues: { ...req.body, smtpPassword: smtpPassword ? '***' : undefined },
                description: 'Updated email configuration settings',
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                severity: 'high'
            });

            logger.info("Email settings updated", { updatedBy: req.user.id });
            
            // Don't return password in response
            const safeEmailSettings = { ...updatedConfig };
            delete safeEmailSettings.smtpPassword;
            
            return sendResponse(res, true, "Email settings updated successfully", safeEmailSettings);
        } catch (error) {
            logger.error("Controller: Update Email Settings Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    testEmailSettings: async (req, res) => {
        try {
            // Role-based access control
            const userSystemRole = req.user.systemRole || req.user.role;
            if (userSystemRole !== ROLES.SUPER_ADMIN) {
                return sendResponse(res, false, "Unauthorized: Only Super Admin can test email settings", null, 403);
            }

            // Get current email configuration
            const emailConfig = await SystemPolicy.getPolicy('email_configuration');
            
            if (!emailConfig || !emailConfig.smtpHost) {
                return sendResponse(res, false, "Email configuration not found. Please configure email settings first.", null, 400);
            }

            // Import email service and test
            const { sendEmail } = await import('../../services/email/email.service.js');
            
            const testResult = await sendEmail({
                to: emailConfig.fromEmail || req.user.email,
                subject: 'HRM System - Email Configuration Test',
                html: `
                    <h2>Email Configuration Test</h2>
                    <p>This is a test email to verify your email configuration is working correctly.</p>
                    <p><strong>Test Details:</strong></p>
                    <ul>
                        <li>SMTP Host: ${emailConfig.smtpHost}</li>
                        <li>SMTP Port: ${emailConfig.smtpPort}</li>
                        <li>From Email: ${emailConfig.fromEmail}</li>
                        <li>Test Time: ${new Date().toISOString()}</li>
                        <li>Tested By: ${req.user.firstName} ${req.user.lastName}</li>
                    </ul>
                    <p>If you received this email, your configuration is working correctly!</p>
                `,
                text: 'HRM System Email Configuration Test - If you received this email, your configuration is working correctly!'
            });

            // Log the email test
            await AuditLog.logAction({
                userId: req.user.id,
                action: 'email_test',
                module: 'system',
                targetType: 'EmailConfiguration',
                description: `Email configuration test ${testResult.success ? 'successful' : 'failed'}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                severity: 'low'
            });

            logger.info("Email test requested", { 
                testBy: req.user.id,
                smtpHost: emailConfig.smtpHost,
                success: testResult.success
            });
            
            if (testResult.success) {
                return sendResponse(res, true, "Test email sent successfully", {
                    messageId: testResult.messageId,
                    provider: testResult.provider
                });
            } else {
                return sendResponse(res, false, "Failed to send test email", {
                    error: testResult.error
                }, 500);
            }
        } catch (error) {
            logger.error("Controller: Test Email Error", error);
            return sendResponse(res, false, "Failed to send test email", { error: error.message }, 500);
        }
    },

    // Notification Settings
    getNotificationSettings: async (req, res) => {
        try {
            // Role-based access control
            const userSystemRole = req.user.systemRole || req.user.role;
            if (userSystemRole !== ROLES.SUPER_ADMIN) {
                return sendResponse(res, false, "Unauthorized: Only Super Admin can access notification settings", null, 403);
            }

            const notificationSettings = await SystemPolicy.getPolicy('notification_settings') || {
                emailNotifications: true,
                smsNotifications: false,
                pushNotifications: true,
                leaveRequestNotifications: true,
                attendanceAlerts: true,
                systemAlerts: true
            };

            return sendResponse(res, true, "Notification settings retrieved successfully", notificationSettings);
        } catch (error) {
            logger.error("Controller: Get Notification Settings Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    updateNotificationSettings: async (req, res) => {
        try {
            // Role-based access control
            const userSystemRole = req.user.systemRole || req.user.role;
            if (userSystemRole !== ROLES.SUPER_ADMIN) {
                return sendResponse(res, false, "Unauthorized: Only Super Admin can update notification settings", null, 403);
            }

            const {
                emailNotifications,
                smsNotifications,
                pushNotifications,
                leaveRequestNotifications,
                attendanceAlerts,
                systemAlerts
            } = req.body;

            // Get current settings
            const currentSettings = await SystemPolicy.getPolicy('notification_settings') || {};

            // Update notification settings
            const updatedSettings = {
                ...currentSettings,
                ...(emailNotifications !== undefined && { emailNotifications }),
                ...(smsNotifications !== undefined && { smsNotifications }),
                ...(pushNotifications !== undefined && { pushNotifications }),
                ...(leaveRequestNotifications !== undefined && { leaveRequestNotifications }),
                ...(attendanceAlerts !== undefined && { attendanceAlerts }),
                ...(systemAlerts !== undefined && { systemAlerts })
            };

            // Save to database
            await SystemPolicy.setPolicy('notification_settings', updatedSettings, req.user.id);

            // Log the update
            await AuditLog.logAction({
                userId: req.user.id,
                action: 'notification_config_update',
                module: 'system',
                targetType: 'NotificationConfiguration',
                newValues: req.body,
                description: 'Updated notification settings',
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                severity: 'medium'
            });

            logger.info("Notification settings updated", { updatedBy: req.user.id });
            return sendResponse(res, true, "Notification settings updated successfully", updatedSettings);
        } catch (error) {
            logger.error("Controller: Update Notification Settings Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    // Security Settings
    getSecuritySettings: async (req, res) => {
        try {
            // Role-based access control
            const userSystemRole = req.user.systemRole || req.user.role;
            if (userSystemRole !== ROLES.SUPER_ADMIN) {
                return sendResponse(res, false, "Unauthorized: Only Super Admin can access security settings", null, 403);
            }

            const securitySettings = await SystemPolicy.getPolicy('security_password_policy') || {
                passwordMinLength: 8,
                passwordRequireUppercase: true,
                passwordRequireLowercase: true,
                passwordRequireNumbers: true,
                passwordRequireSymbols: false,
                sessionTimeout: 30,
                maxLoginAttempts: 5,
                twoFactorAuth: false,
                ipWhitelist: ''
            };

            return sendResponse(res, true, "Security settings retrieved successfully", securitySettings);
        } catch (error) {
            logger.error("Controller: Get Security Settings Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    updateSecuritySettings: async (req, res) => {
        try {
            // Role-based access control
            const userSystemRole = req.user.systemRole || req.user.role;
            if (userSystemRole !== ROLES.SUPER_ADMIN) {
                return sendResponse(res, false, "Unauthorized: Only Super Admin can update security settings", null, 403);
            }

            const {
                passwordMinLength,
                passwordRequireUppercase,
                passwordRequireLowercase,
                passwordRequireNumbers,
                passwordRequireSymbols,
                sessionTimeout,
                maxLoginAttempts,
                twoFactorAuth,
                ipWhitelist
            } = req.body;

            // Get current settings
            const currentSettings = await SystemPolicy.getPolicy('security_password_policy') || {};

            // Update security settings
            const updatedSettings = {
                ...currentSettings,
                ...(passwordMinLength && { passwordMinLength: parseInt(passwordMinLength) }),
                ...(passwordRequireUppercase !== undefined && { passwordRequireUppercase }),
                ...(passwordRequireLowercase !== undefined && { passwordRequireLowercase }),
                ...(passwordRequireNumbers !== undefined && { passwordRequireNumbers }),
                ...(passwordRequireSymbols !== undefined && { passwordRequireSymbols }),
                ...(sessionTimeout && { sessionTimeout: parseInt(sessionTimeout) }),
                ...(maxLoginAttempts && { maxLoginAttempts: parseInt(maxLoginAttempts) }),
                ...(twoFactorAuth !== undefined && { twoFactorAuth }),
                ...(ipWhitelist !== undefined && { ipWhitelist })
            };

            // Save to database
            await SystemPolicy.setPolicy('security_password_policy', updatedSettings, req.user.id);

            // Log the update
            await AuditLog.logAction({
                userId: req.user.id,
                action: 'security_config_update',
                module: 'system',
                targetType: 'SecurityConfiguration',
                newValues: req.body,
                description: 'Updated security settings',
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                severity: 'high'
            });

            logger.info("Security settings updated", { updatedBy: req.user.id });
            return sendResponse(res, true, "Security settings updated successfully", updatedSettings);
        } catch (error) {
            logger.error("Controller: Update Security Settings Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    // Backup Settings
    getBackupSettings: async (req, res) => {
        try {
            // Role-based access control
            const userSystemRole = req.user.systemRole || req.user.role;
            if (userSystemRole !== ROLES.SUPER_ADMIN) {
                return sendResponse(res, false, "Unauthorized: Only Super Admin can access backup settings", null, 403);
            }

            const backupSettings = await SystemPolicy.getPolicy('backup_configuration') || {
                autoBackup: true,
                backupFrequency: 'daily',
                backupRetention: 30,
                backupLocation: 'local',
                lastBackup: new Date().toISOString()
            };

            return sendResponse(res, true, "Backup settings retrieved successfully", backupSettings);
        } catch (error) {
            logger.error("Controller: Get Backup Settings Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    updateBackupSettings: async (req, res) => {
        try {
            // Role-based access control
            const userSystemRole = req.user.systemRole || req.user.role;
            if (userSystemRole !== ROLES.SUPER_ADMIN) {
                return sendResponse(res, false, "Unauthorized: Only Super Admin can update backup settings", null, 403);
            }

            const {
                autoBackup,
                backupFrequency,
                backupRetention,
                backupLocation
            } = req.body;

            // Get current settings
            const currentSettings = await SystemPolicy.getPolicy('backup_configuration') || {};

            // Update backup settings
            const updatedSettings = {
                ...currentSettings,
                ...(autoBackup !== undefined && { autoBackup }),
                ...(backupFrequency && { backupFrequency }),
                ...(backupRetention && { backupRetention: parseInt(backupRetention) }),
                ...(backupLocation && { backupLocation })
            };

            // Save to database
            await SystemPolicy.setPolicy('backup_configuration', updatedSettings, req.user.id);

            // Log the update
            await AuditLog.logAction({
                userId: req.user.id,
                action: 'backup_config_update',
                module: 'system',
                targetType: 'BackupConfiguration',
                newValues: req.body,
                description: 'Updated backup settings',
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                severity: 'medium'
            });

            logger.info("Backup settings updated", { updatedBy: req.user.id });
            return sendResponse(res, true, "Backup settings updated successfully", updatedSettings);
        } catch (error) {
            logger.error("Controller: Update Backup Settings Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    createBackup: async (req, res) => {
        try {
            // Role-based access control
            const userSystemRole = req.user.systemRole || req.user.role;
            if (userSystemRole !== ROLES.SUPER_ADMIN) {
                return sendResponse(res, false, "Unauthorized: Only Super Admin can create backups", null, 403);
            }

            // Mock backup creation - in production, this would create an actual backup
            logger.info("Manual backup requested", { requestedBy: req.user.id });
            
            // Simulate backup creation delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const backupId = `backup_${Date.now()}`;
            const createdAt = new Date().toISOString();
            
            // Update last backup time in settings
            const currentSettings = await SystemPolicy.getPolicy('backup_configuration') || {};
            await SystemPolicy.setPolicy('backup_configuration', {
                ...currentSettings,
                lastBackup: createdAt
            }, req.user.id);

            // Log the backup creation
            await AuditLog.logAction({
                userId: req.user.id,
                action: 'backup_create',
                module: 'system',
                targetType: 'SystemBackup',
                newValues: { backupId, createdAt },
                description: 'Manual backup created',
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                severity: 'medium'
            });
            
            return sendResponse(res, true, "Backup created successfully", {
                backupId,
                createdAt,
                size: '125.4 MB'
            });
        } catch (error) {
            logger.error("Controller: Create Backup Error", error);
            return sendResponse(res, false, "Failed to create backup", null, 500);
        }
    },

    getBackupHistory: async (req, res) => {
        try {
            // Role-based access control
            const userSystemRole = req.user.systemRole || req.user.role;
            if (userSystemRole !== ROLES.SUPER_ADMIN) {
                return sendResponse(res, false, "Unauthorized: Only Super Admin can view backup history", null, 403);
            }

            // In production, this would query actual backup records from database
            // For now, return mock data
            const backupHistory = [
                {
                    id: 'backup_1640995200000',
                    createdAt: '2024-01-01T00:00:00.000Z',
                    size: '120.1 MB',
                    type: 'automatic',
                    status: 'completed'
                },
                {
                    id: 'backup_1640908800000',
                    createdAt: '2023-12-31T00:00:00.000Z',
                    size: '118.7 MB',
                    type: 'automatic',
                    status: 'completed'
                }
            ];

            return sendResponse(res, true, "Backup history retrieved successfully", backupHistory);
        } catch (error) {
            logger.error("Controller: Get Backup History Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    restoreBackup: async (req, res) => {
        try {
            // Role-based access control
            const userSystemRole = req.user.systemRole || req.user.role;
            if (userSystemRole !== ROLES.SUPER_ADMIN) {
                return sendResponse(res, false, "Unauthorized: Only Super Admin can restore backups", null, 403);
            }

            const { backupId } = req.params;
            
            // Mock backup restoration - in production, this would restore from actual backup
            logger.info("Backup restoration requested", { 
                backupId, 
                requestedBy: req.user.id 
            });
            
            // Simulate restoration delay
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const restoredAt = new Date().toISOString();

            // Log the backup restoration
            await AuditLog.logAction({
                userId: req.user.id,
                action: 'backup_restore',
                module: 'system',
                targetType: 'SystemBackup',
                newValues: { backupId, restoredAt },
                description: `Backup restored: ${backupId}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                severity: 'high'
            });
            
            return sendResponse(res, true, "Backup restored successfully", {
                backupId,
                restoredAt
            });
        } catch (error) {
            logger.error("Controller: Restore Backup Error", error);
            return sendResponse(res, false, "Failed to restore backup", null, 500);
        }
    }
};

export default adminConfigController;