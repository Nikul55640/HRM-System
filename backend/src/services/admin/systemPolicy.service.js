/**
 * System Policy Service Layer
 * Handles all business logic for system policy management
 * SuperAdmin only access for policy configuration
 */

import { SystemPolicy, AuditLog } from "../../models/sequelize/index.js";
import logger from "../../utils/logger.js";
import { ROLES } from "../../config/rolePermissions.js";

class SystemPolicyService {
    /**
     * Get all system policies (SuperAdmin only)
     * @param {Object} user - User requesting policies
     * @returns {Promise<Object>} All policies grouped by type
     */
    async getAllPolicies(user) {
        try {
            // Only SuperAdmin can access system policies
            if (user.role !== ROLES.SUPER_ADMIN) {
                throw { message: "Unauthorized: Only SuperAdmin can access system policies", statusCode: 403 };
            }

            const policies = await SystemPolicy.findAll({
                where: { isActive: true },
                order: [['policyType', 'ASC'], ['policyName', 'ASC']]
            });

            // Group policies by type
            const groupedPolicies = {
                attendance: [],
                leave: [],
                shift: [],
                security: [],
                general: []
            };

            policies.forEach(policy => {
                if (groupedPolicies[policy.policyType]) {
                    groupedPolicies[policy.policyType].push(policy);
                }
            });

            return {
                success: true,
                data: {
                    policies: groupedPolicies,
                    total: policies.length
                }
            };
        } catch (error) {
            logger.error('Error getting all policies:', error);
            return {
                success: false,
                message: error.message || 'Failed to get system policies',
                error: error.message
            };
        }
    }

    /**
     * Get policies by type (SuperAdmin only)
     * @param {String} policyType - Type of policies to retrieve
     * @param {Object} user - User requesting policies
     * @returns {Promise<Object>} Policies of specified type
     */
    async getPoliciesByType(policyType, user) {
        try {
            // Only SuperAdmin can access system policies
            if (user.role !== ROLES.SUPER_ADMIN) {
                throw { message: "Unauthorized: Only SuperAdmin can access system policies", statusCode: 403 };
            }

            const validTypes = ['attendance', 'leave', 'shift', 'security', 'general'];
            if (!validTypes.includes(policyType)) {
                throw { message: "Invalid policy type", statusCode: 400 };
            }

            const policies = await SystemPolicy.findAll({
                where: {
                    policyType,
                    isActive: true
                },
                order: [['policyName', 'ASC']]
            });

            return {
                success: true,
                data: policies
            };
        } catch (error) {
            logger.error('Error getting policies by type:', error);
            return {
                success: false,
                message: error.message || 'Failed to get policies by type',
                error: error.message
            };
        }
    }

    /**
     * Get specific policy by key (SuperAdmin only)
     * @param {String} policyKey - Policy key to retrieve
     * @param {Object} user - User requesting policy
     * @returns {Promise<Object>} Specific policy
     */
    async getPolicyByKey(policyKey, user) {
        try {
            // Only SuperAdmin can access system policies
            if (user.role !== ROLES.SUPER_ADMIN) {
                throw { message: "Unauthorized: Only SuperAdmin can access system policies", statusCode: 403 };
            }

            const policy = await SystemPolicy.findOne({
                where: {
                    policyKey,
                    isActive: true
                }
            });

            if (!policy) {
                throw { message: "Policy not found", statusCode: 404 };
            }

            return {
                success: true,
                data: policy
            };
        } catch (error) {
            logger.error('Error getting policy by key:', error);
            return {
                success: false,
                message: error.message || 'Failed to get policy',
                error: error.message
            };
        }
    }

    /**
     * Update system policy (SuperAdmin only)
     * @param {String} policyKey - Policy key to update
     * @param {Object} updateData - Policy data to update
     * @param {Object} user - User updating policy
     * @param {Object} metadata - Request metadata
     * @returns {Promise<Object>} Updated policy
     */
    async updatePolicy(policyKey, updateData, user, metadata = {}) {
        try {
            // Only SuperAdmin can update system policies
            if (user.role !== ROLES.SUPER_ADMIN) {
                throw { message: "Unauthorized: Only SuperAdmin can update system policies", statusCode: 403 };
            }

            const policy = await SystemPolicy.findOne({
                where: { policyKey }
            });

            if (!policy) {
                throw { message: "Policy not found", statusCode: 404 };
            }

            const oldValue = policy.policyValue;

            // Update policy
            await policy.update({
                policyValue: updateData.policyValue,
                description: updateData.description || policy.description,
                updatedBy: user.id
            });

            // Log policy update
            await AuditLog.logAction({
                userId: user.id,
                action: 'policy_update',
                module: 'system',
                targetType: 'SystemPolicy',
                targetId: policy.id,
                oldValues: { policyValue: oldValue },
                newValues: { policyValue: updateData.policyValue },
                description: `Updated policy: ${policy.policyName}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'high'
            });

            logger.info(`Policy updated: ${policyKey} by user ${user.email}`);

            return {
                success: true,
                data: policy,
                message: 'Policy updated successfully'
            };
        } catch (error) {
            logger.error('Error updating policy:', error);
            return {
                success: false,
                message: error.message || 'Failed to update policy',
                error: error.message
            };
        }
    }

    /**
     * Create new system policy (SuperAdmin only)
     * @param {Object} policyData - Policy data
     * @param {Object} user - User creating policy
     * @param {Object} metadata - Request metadata
     * @returns {Promise<Object>} Created policy
     */
    async createPolicy(policyData, user, metadata = {}) {
        try {
            // Only SuperAdmin can create system policies
            if (user.role !== ROLES.SUPER_ADMIN) {
                throw { message: "Unauthorized: Only SuperAdmin can create system policies", statusCode: 403 };
            }

            // Validation
            if (!policyData.policyKey || !policyData.policyName || !policyData.policyValue) {
                throw { message: "Policy key, name, and value are required", statusCode: 400 };
            }

            // Check if policy already exists
            const existingPolicy = await SystemPolicy.findOne({
                where: { policyKey: policyData.policyKey }
            });

            if (existingPolicy) {
                throw { message: "Policy with this key already exists", statusCode: 409 };
            }

            // Create policy
            const policy = await SystemPolicy.create({
                policyType: policyData.policyType || 'general',
                policyKey: policyData.policyKey,
                policyName: policyData.policyName,
                policyValue: policyData.policyValue,
                description: policyData.description || null,
                createdBy: user.id
            });

            // Log policy creation
            await AuditLog.logAction({
                userId: user.id,
                action: 'policy_create',
                module: 'system',
                targetType: 'SystemPolicy',
                targetId: policy.id,
                newValues: policy.toJSON(),
                description: `Created new policy: ${policy.policyName}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'high'
            });

            logger.info(`Policy created: ${policyData.policyKey} by user ${user.email}`);

            return {
                success: true,
                data: policy,
                message: 'Policy created successfully'
            };
        } catch (error) {
            logger.error('Error creating policy:', error);
            return {
                success: false,
                message: error.message || 'Failed to create policy',
                error: error.message
            };
        }
    }

    /**
     * Initialize default system policies (SuperAdmin only)
     * @param {Object} user - User initializing policies
     * @param {Object} metadata - Request metadata
     * @returns {Promise<Object>} Initialization result
     */
    async initializeDefaultPolicies(user, metadata = {}) {
        try {
            // Only SuperAdmin can initialize policies
            if (user.role !== ROLES.SUPER_ADMIN) {
                throw { message: "Unauthorized: Only SuperAdmin can initialize system policies", statusCode: 403 };
            }

            const defaultPolicies = SystemPolicy.getDefaultPolicies();
            const createdPolicies = [];
            const skippedPolicies = [];

            for (const policyData of defaultPolicies) {
                const existingPolicy = await SystemPolicy.findOne({
                    where: { policyKey: policyData.policyKey }
                });

                if (!existingPolicy) {
                    const policy = await SystemPolicy.create({
                        ...policyData,
                        createdBy: user.id
                    });
                    createdPolicies.push(policy);
                } else {
                    skippedPolicies.push(policyData.policyKey);
                }
            }

            logger.info(`Default policies initialized: ${createdPolicies.length} created, ${skippedPolicies.length} skipped`);

            return {
                success: true,
                data: {
                    created: createdPolicies,
                    skipped: skippedPolicies,
                    total: defaultPolicies.length
                },
                message: `Initialized ${createdPolicies.length} default policies`
            };
        } catch (error) {
            logger.error('Error initializing default policies:', error);
            return {
                success: false,
                message: error.message || 'Failed to initialize default policies',
                error: error.message
            };
        }
    }

    /**
     * Reset policy to default value (SuperAdmin only)
     * @param {String} policyKey - Policy key to reset
     * @param {Object} user - User resetting policy
     * @param {Object} metadata - Request metadata
     * @returns {Promise<Object>} Reset result
     */
    async resetPolicyToDefault(policyKey, user, metadata = {}) {
        try {
            // Only SuperAdmin can reset policies
            if (user.role !== ROLES.SUPER_ADMIN) {
                throw { message: "Unauthorized: Only SuperAdmin can reset system policies", statusCode: 403 };
            }

            const policy = await SystemPolicy.findOne({
                where: { policyKey }
            });

            if (!policy) {
                throw { message: "Policy not found", statusCode: 404 };
            }

            // Find default value
            const defaultPolicies = SystemPolicy.getDefaultPolicies();
            const defaultPolicy = defaultPolicies.find(p => p.policyKey === policyKey);

            if (!defaultPolicy) {
                throw { message: "No default value found for this policy", statusCode: 400 };
            }

            const oldValue = policy.policyValue;

            // Reset to default
            await policy.update({
                policyValue: defaultPolicy.policyValue,
                updatedBy: user.id
            });

            // Log policy reset
            await AuditLog.logAction({
                userId: user.id,
                action: 'policy_reset',
                module: 'system',
                targetType: 'SystemPolicy',
                targetId: policy.id,
                oldValues: { policyValue: oldValue },
                newValues: { policyValue: defaultPolicy.policyValue },
                description: `Reset policy to default: ${policy.policyName}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'high'
            });

            return {
                success: true,
                data: policy,
                message: 'Policy reset to default successfully'
            };
        } catch (error) {
            logger.error('Error resetting policy to default:', error);
            return {
                success: false,
                message: error.message || 'Failed to reset policy',
                error: error.message
            };
        }
    }

    /**
     * Bulk update policies (SuperAdmin only)
     * @param {Array} policies - Array of policies to update
     * @param {Object} user - User updating policies
     * @param {Object} metadata - Request metadata
     * @returns {Promise<Object>} Bulk update result
     */
    async bulkUpdatePolicies(policies, user, metadata = {}) {
        try {
            // Only SuperAdmin can bulk update policies
            if (user.role !== ROLES.SUPER_ADMIN) {
                throw { message: "Unauthorized: Only SuperAdmin can update system policies", statusCode: 403 };
            }

            const updatedPolicies = [];
            const errors = [];

            for (const policyUpdate of policies) {
                try {
                    const result = await this.updatePolicy(policyUpdate.policyKey, policyUpdate, user, metadata);
                    if (result.success) {
                        updatedPolicies.push(result.data);
                    } else {
                        errors.push({ policyKey: policyUpdate.policyKey, error: result.message });
                    }
                } catch (error) {
                    errors.push({ policyKey: policyUpdate.policyKey, error: error.message });
                }
            }

            return {
                success: true,
                data: {
                    updated: updatedPolicies,
                    errors,
                    total: policies.length
                },
                message: `Bulk update completed: ${updatedPolicies.length} updated, ${errors.length} errors`
            };
        } catch (error) {
            logger.error('Error bulk updating policies:', error);
            return {
                success: false,
                message: error.message || 'Failed to bulk update policies',
                error: error.message
            };
        }
    }

    /**
     * Export system policies (SuperAdmin only)
     * @param {Object} user - User exporting policies
     * @returns {Promise<Object>} Export data
     */
    async exportPolicies(user) {
        try {
            // Only SuperAdmin can export policies
            if (user.role !== ROLES.SUPER_ADMIN) {
                throw { message: "Unauthorized: Only SuperAdmin can export system policies", statusCode: 403 };
            }

            const policies = await SystemPolicy.findAll({
                where: { isActive: true },
                order: [['policyType', 'ASC'], ['policyName', 'ASC']]
            });

            const exportData = {
                exportDate: new Date().toISOString(),
                exportedBy: user.email,
                totalPolicies: policies.length,
                policies: policies.map(policy => ({
                    policyType: policy.policyType,
                    policyKey: policy.policyKey,
                    policyName: policy.policyName,
                    policyValue: policy.policyValue,
                    description: policy.description
                }))
            };

            return {
                success: true,
                data: exportData
            };
        } catch (error) {
            logger.error('Error exporting policies:', error);
            return {
                success: false,
                message: error.message || 'Failed to export policies',
                error: error.message
            };
        }
    }
}

export default new SystemPolicyService();