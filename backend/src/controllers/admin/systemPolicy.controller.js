/**
 * System Policy Controller
 * Handles HTTP requests for system policy management (SuperAdmin only)
 * Manages attendance, leave, shift, security, and general policies
 */

import systemPolicyService from '../../services/admin/systemPolicy.service.js';
import logger from '../../utils/logger.js';
import { AuditLog } from '../../models/sequelize/index.js';

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

const systemPolicyController = {
    /**
     * Get all system policies (SuperAdmin only)
     */
    getAllPolicies: async (req, res) => {
        try {
            const result = await systemPolicyService.getAllPolicies(req.user);

            if (!result.success) {
                const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            return sendResponse(res, true, "System policies retrieved successfully", result.data);
        } catch (error) {
            logger.error("Controller: Get All Policies Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Get policies by type (SuperAdmin only)
     */
    getPoliciesByType: async (req, res) => {
        try {
            const { type } = req.params;
            const result = await systemPolicyService.getPoliciesByType(type, req.user);

            if (!result.success) {
                const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            return sendResponse(res, true, `${type} policies retrieved successfully`, result.data);
        } catch (error) {
            logger.error("Controller: Get Policies By Type Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Get specific policy by key (SuperAdmin only)
     */
    getPolicyByKey: async (req, res) => {
        try {
            const { key } = req.params;
            const result = await systemPolicyService.getPolicyByKey(key, req.user);

            if (!result.success) {
                const statusCode = result.message.includes('Unauthorized') ? 403 :
                    result.message.includes('not found') ? 404 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            return sendResponse(res, true, "Policy retrieved successfully", result.data);
        } catch (error) {
            logger.error("Controller: Get Policy By Key Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Update system policy (SuperAdmin only)
     */
    updatePolicy: async (req, res) => {
        try {
            const { key } = req.params;
            const metadata = {
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            };

            const result = await systemPolicyService.updatePolicy(key, req.body, req.user, metadata);

            if (!result.success) {
                const statusCode = result.message.includes('Unauthorized') ? 403 :
                    result.message.includes('not found') ? 404 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            return sendResponse(res, true, result.message, result.data);
        } catch (error) {
            logger.error("Controller: Update Policy Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Create new system policy (SuperAdmin only)
     */
    createPolicy: async (req, res) => {
        try {
            const metadata = {
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            };

            const result = await systemPolicyService.createPolicy(req.body, req.user, metadata);

            if (!result.success) {
                const statusCode = result.message.includes('Unauthorized') ? 403 :
                    result.message.includes('already exists') ? 409 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            return sendResponse(res, true, result.message, result.data, 201);
        } catch (error) {
            logger.error("Controller: Create Policy Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Initialize default policies (SuperAdmin only)
     */
    initializeDefaultPolicies: async (req, res) => {
        try {
            const metadata = {
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            };

            const result = await systemPolicyService.initializeDefaultPolicies(req.user, metadata);

            if (!result.success) {
                const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            // Log initialization
            await AuditLog.logAction({
                userId: req.user.id,
                action: 'system_config_change',
                module: 'system',
                description: 'Initialized default system policies',
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                severity: 'high'
            });

            return sendResponse(res, true, result.message, result.data);
        } catch (error) {
            logger.error("Controller: Initialize Default Policies Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Reset policy to default value (SuperAdmin only)
     */
    resetPolicyToDefault: async (req, res) => {
        try {
            const { key } = req.params;
            const metadata = {
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            };

            const result = await systemPolicyService.resetPolicyToDefault(key, req.user, metadata);

            if (!result.success) {
                const statusCode = result.message.includes('Unauthorized') ? 403 :
                    result.message.includes('not found') ? 404 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            return sendResponse(res, true, result.message, result.data);
        } catch (error) {
            logger.error("Controller: Reset Policy To Default Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Bulk update policies (SuperAdmin only)
     */
    bulkUpdatePolicies: async (req, res) => {
        try {
            const { policies } = req.body;
            const metadata = {
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            };

            if (!Array.isArray(policies) || policies.length === 0) {
                return sendResponse(res, false, "Policies array is required", null, 400);
            }

            const result = await systemPolicyService.bulkUpdatePolicies(policies, req.user, metadata);

            if (!result.success) {
                const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            // Log bulk update
            await AuditLog.logAction({
                userId: req.user.id,
                action: 'system_config_change',
                module: 'system',
                description: `Bulk updated ${policies.length} system policies`,
                metadata: { policyKeys: policies.map(p => p.policyKey) },
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                severity: 'high'
            });

            return sendResponse(res, true, result.message, result.data);
        } catch (error) {
            logger.error("Controller: Bulk Update Policies Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Export system policies (SuperAdmin only)
     */
    exportPolicies: async (req, res) => {
        try {
            const result = await systemPolicyService.exportPolicies(req.user);

            if (!result.success) {
                const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
                return sendResponse(res, false, result.message, null, statusCode);
            }

            // Log export
            await AuditLog.logAction({
                userId: req.user.id,
                action: 'system_config_change',
                module: 'system',
                description: 'Exported system policies configuration',
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                severity: 'medium'
            });

            // Set headers for JSON download
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=system-policies-${new Date().toISOString().split('T')[0]}.json`);

            return res.send(result.data);
        } catch (error) {
            logger.error("Controller: Export Policies Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    }
};

export default systemPolicyController;