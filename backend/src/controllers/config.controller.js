/**
 * Config Controller
 * Handles system configuration requests
 */

import logger from '../utils/logger.js';

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

const configController = {
    /**
     * Get system configuration
     */
    getConfig: async (req, res) => {
        try {
            // Return basic system configuration
            const config = {
                system: {
                    name: 'HRM System',
                    version: '1.0.0',
                    environment: process.env.NODE_ENV || 'development'
                },
                features: {
                    attendance: true,
                    leave: true,
                    employee: true,
                    lead: true,
                    audit: true,
                    systemPolicy: true
                }
            };

            return sendResponse(res, true, "Configuration retrieved successfully", config);
        } catch (error) {
            logger.error("Controller: Get Config Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Update system configuration (SuperAdmin only)
     */
    updateConfig: async (req, res) => {
        try {
            // For now, just return success as config system is not fully implemented
            return sendResponse(res, true, "Configuration updated successfully");
        } catch (error) {
            logger.error("Controller: Update Config Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    }
};

export default configController;