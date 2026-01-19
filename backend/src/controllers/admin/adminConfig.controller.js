/**
 * Admin Configuration Controller
 * Handles system-wide configuration settings for administrators
 */

import logger from '../../utils/logger.js';

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

// Mock storage for settings (in production, this would be stored in database)
let systemSettings = {
    companyName: 'HRM Company',
    companyEmail: 'admin@hrmcompany.com',
    companyPhone: '+1 (555) 123-4567',
    companyAddress: '123 Business Street, City, State 12345',
    timezone: 'UTC',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'USD',
    language: 'en'
};

let emailSettings = {
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: true,
    fromEmail: '',
    fromName: 'HRM System'
};

let notificationSettings = {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    leaveRequestNotifications: true,
    attendanceAlerts: true,
    systemAlerts: true
};

let securitySettings = {
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

let backupSettings = {
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    backupLocation: 'local',
    lastBackup: new Date().toISOString()
};

const adminConfigController = {
    // System Configuration
    getSystemConfig: async (req, res) => {
        try {
            return sendResponse(res, true, "System configuration retrieved successfully", systemSettings);
        } catch (error) {
            logger.error("Controller: Get System Config Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    updateSystemConfig: async (req, res) => {
        try {
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

            // Update system settings
            systemSettings = {
                ...systemSettings,
                ...(companyName && { companyName }),
                ...(companyEmail && { companyEmail }),
                ...(companyPhone && { companyPhone }),
                ...(companyAddress && { companyAddress }),
                ...(timezone && { timezone }),
                ...(dateFormat && { dateFormat }),
                ...(timeFormat && { timeFormat }),
                ...(currency && { currency }),
                ...(language && { language })
            };

            logger.info("System configuration updated", { updatedBy: req.user?.id });
            return sendResponse(res, true, "System configuration updated successfully", systemSettings);
        } catch (error) {
            logger.error("Controller: Update System Config Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    // Email Configuration
    getEmailSettings: async (req, res) => {
        try {
            // Don't return password in response
            const safeEmailSettings = { ...emailSettings };
            delete safeEmailSettings.smtpPassword;
            
            return sendResponse(res, true, "Email settings retrieved successfully", safeEmailSettings);
        } catch (error) {
            logger.error("Controller: Get Email Settings Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    updateEmailSettings: async (req, res) => {
        try {
            const {
                smtpHost,
                smtpPort,
                smtpUser,
                smtpPassword,
                smtpSecure,
                fromEmail,
                fromName
            } = req.body;

            // Update email settings
            emailSettings = {
                ...emailSettings,
                ...(smtpHost && { smtpHost }),
                ...(smtpPort && { smtpPort: parseInt(smtpPort) }),
                ...(smtpUser && { smtpUser }),
                ...(smtpPassword && { smtpPassword }),
                ...(smtpSecure !== undefined && { smtpSecure }),
                ...(fromEmail && { fromEmail }),
                ...(fromName && { fromName })
            };

            logger.info("Email settings updated", { updatedBy: req.user?.id });
            
            // Don't return password in response
            const safeEmailSettings = { ...emailSettings };
            delete safeEmailSettings.smtpPassword;
            
            return sendResponse(res, true, "Email settings updated successfully", safeEmailSettings);
        } catch (error) {
            logger.error("Controller: Update Email Settings Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    testEmailSettings: async (req, res) => {
        try {
            // Mock email test - in production, this would actually send a test email
            logger.info("Email test requested", { 
                testBy: req.user?.id,
                smtpHost: emailSettings.smtpHost 
            });
            
            // Simulate email test delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return sendResponse(res, true, "Test email sent successfully");
        } catch (error) {
            logger.error("Controller: Test Email Error", error);
            return sendResponse(res, false, "Failed to send test email", null, 500);
        }
    },

    // Notification Settings
    getNotificationSettings: async (req, res) => {
        try {
            return sendResponse(res, true, "Notification settings retrieved successfully", notificationSettings);
        } catch (error) {
            logger.error("Controller: Get Notification Settings Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    updateNotificationSettings: async (req, res) => {
        try {
            const {
                emailNotifications,
                smsNotifications,
                pushNotifications,
                leaveRequestNotifications,
                attendanceAlerts,
                systemAlerts
            } = req.body;

            // Update notification settings
            notificationSettings = {
                ...notificationSettings,
                ...(emailNotifications !== undefined && { emailNotifications }),
                ...(smsNotifications !== undefined && { smsNotifications }),
                ...(pushNotifications !== undefined && { pushNotifications }),
                ...(leaveRequestNotifications !== undefined && { leaveRequestNotifications }),
                ...(attendanceAlerts !== undefined && { attendanceAlerts }),
                ...(systemAlerts !== undefined && { systemAlerts })
            };

            logger.info("Notification settings updated", { updatedBy: req.user?.id });
            return sendResponse(res, true, "Notification settings updated successfully", notificationSettings);
        } catch (error) {
            logger.error("Controller: Update Notification Settings Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    // Security Settings
    getSecuritySettings: async (req, res) => {
        try {
            return sendResponse(res, true, "Security settings retrieved successfully", securitySettings);
        } catch (error) {
            logger.error("Controller: Get Security Settings Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    updateSecuritySettings: async (req, res) => {
        try {
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

            // Update security settings
            securitySettings = {
                ...securitySettings,
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

            logger.info("Security settings updated", { updatedBy: req.user?.id });
            return sendResponse(res, true, "Security settings updated successfully", securitySettings);
        } catch (error) {
            logger.error("Controller: Update Security Settings Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    // Backup Settings
    getBackupSettings: async (req, res) => {
        try {
            return sendResponse(res, true, "Backup settings retrieved successfully", backupSettings);
        } catch (error) {
            logger.error("Controller: Get Backup Settings Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    updateBackupSettings: async (req, res) => {
        try {
            const {
                autoBackup,
                backupFrequency,
                backupRetention,
                backupLocation
            } = req.body;

            // Update backup settings
            backupSettings = {
                ...backupSettings,
                ...(autoBackup !== undefined && { autoBackup }),
                ...(backupFrequency && { backupFrequency }),
                ...(backupRetention && { backupRetention: parseInt(backupRetention) }),
                ...(backupLocation && { backupLocation })
            };

            logger.info("Backup settings updated", { updatedBy: req.user?.id });
            return sendResponse(res, true, "Backup settings updated successfully", backupSettings);
        } catch (error) {
            logger.error("Controller: Update Backup Settings Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    createBackup: async (req, res) => {
        try {
            // Mock backup creation - in production, this would create an actual backup
            logger.info("Manual backup requested", { requestedBy: req.user?.id });
            
            // Simulate backup creation delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update last backup time
            backupSettings.lastBackup = new Date().toISOString();
            
            return sendResponse(res, true, "Backup created successfully", {
                backupId: `backup_${Date.now()}`,
                createdAt: backupSettings.lastBackup,
                size: '125.4 MB'
            });
        } catch (error) {
            logger.error("Controller: Create Backup Error", error);
            return sendResponse(res, false, "Failed to create backup", null, 500);
        }
    },

    getBackupHistory: async (req, res) => {
        try {
            // Mock backup history - in production, this would come from database
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
            const { backupId } = req.params;
            
            // Mock backup restoration - in production, this would restore from actual backup
            logger.info("Backup restoration requested", { 
                backupId, 
                requestedBy: req.user?.id 
            });
            
            // Simulate restoration delay
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            return sendResponse(res, true, "Backup restored successfully", {
                backupId,
                restoredAt: new Date().toISOString()
            });
        } catch (error) {
            logger.error("Controller: Restore Backup Error", error);
            return sendResponse(res, false, "Failed to restore backup", null, 500);
        }
    }
};

export default adminConfigController;