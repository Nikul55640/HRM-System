import { User } from '../../models/index.js';
import logger from '../../utils/logger.js';

/**
 * Get user settings
 */
export const getSettings = async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own settings (unless admin)
    if (req.user.id.toString() !== userId && req.user.role !== 'SuperAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'settings']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const settings = user.settings || {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false,
      language: 'en',
      timezone: 'UTC',
      theme: 'light',
      twoFactorAuth: false
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logger.error('Error fetching user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
};

/**
 * Update user settings
 */
export const updateSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      emailNotifications,
      pushNotifications,
      smsNotifications,
      language,
      timezone,
      theme,
      twoFactorAuth
    } = req.body;

    // Users can only update their own settings (unless admin)
    if (req.user.id.toString() !== userId && req.user.role !== 'SuperAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update settings
    const updatedSettings = {
      emailNotifications: emailNotifications !== undefined ? emailNotifications : user.settings?.emailNotifications ?? true,
      pushNotifications: pushNotifications !== undefined ? pushNotifications : user.settings?.pushNotifications ?? false,
      smsNotifications: smsNotifications !== undefined ? smsNotifications : user.settings?.smsNotifications ?? false,
      language: language || user.settings?.language || 'en',
      timezone: timezone || user.settings?.timezone || 'UTC',
      theme: theme || user.settings?.theme || 'light',
      twoFactorAuth: twoFactorAuth !== undefined ? twoFactorAuth : user.settings?.twoFactorAuth ?? false
    };

    await user.update({ settings: updatedSettings });

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings
    });
  } catch (error) {
    logger.error('Error updating user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
};
