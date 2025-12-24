/**
 * System Policy Service
 * Handles all system policy management operations
 */

import { SystemPolicy, AuditLog } from '../../models/sequelize/index.js';
import { Op } from 'sequelize';

class SystemPolicyService {
    /**
     * Get all system policies
     */
    async getAllPolicies(filters = {}) {
        try {
            const { policyType, isActive = true } = filters;

            const whereClause = { isActive };
            if (policyType) {
                whereClause.policyType = policyType;
            }

            const policies = await SystemPolicy.findAll({
                where: whereClause,
                include: [
                    {
                        model: SystemPolicy.sequelize.models.User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: SystemPolicy.sequelize.models.User,
                        as: 'updater',
                        attributes: ['id', 'name', 'email']
                    }
                ],
                order: [['policyType', 'ASC'], ['policyName', 'ASC']]
            });

            return {
                success: true,
                data: policies,
                message: 'Policies retrieved successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to retrieve policies',
                error: error.message
            };
        }
    }

    /**
     * Get policies by type
     */
    async getPoliciesByType(policyType) {
        try {
            const policies = await SystemPolicy.getPoliciesByType(policyType);

            return {
                success: true,
                data: policies,
                message: `${policyType} policies retrieved successfully`
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to retrieve ${policyType} policies`,
                error: error.message
            };
        }
    }

    /**
     * Get a specific policy by key
     */
    async getPolicyByKey(policyKey) {
        try {
            const policy = await SystemPolicy.findOne({
                where: { policyKey, isActive: true },
                include: [
                    {
                        model: SystemPolicy.sequelize.models.User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            if (!policy) {
                return {
                    success: false,
                    message: 'Policy not found'
                };
            }

            return {
                success: true,
                data: policy,
                message: 'Policy retrieved successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to retrieve policy',
                error: error.message
            };
        }
    }

    /**
     * Create or update a policy
     */
    async setPolicy(policyData, userId) {
        try {
            const { policyKey, policyName, policyValue, description, policyType } = policyData;

            const policy = await SystemPolicy.setPolicy(policyKey, policyValue, userId);

            // Update other fields if provided
            if (policyName) policy.policyName = policyName;
            if (description) policy.description = description;
            if (policyType) policy.policyType = policyType;

            await policy.save();

            return {
                success: true,
                data: policy,
                message: 'Policy updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to update policy',
                error: error.message
            };
        }
    }

    /**
     * Create a new policy
     */
    async createPolicy(policyData, userId) {
        try {
            const policy = await SystemPolicy.create({
                ...policyData,
                createdBy: userId
            });

            // Log the policy creation
            await AuditLog.logAction({
                userId,
                action: 'policy_update',
                module: 'system',
                targetType: 'SystemPolicy',
                targetId: policy.id,
                newValues: policyData,
                description: `Created new policy: ${policy.policyName}`,
                severity: 'medium'
            });

            return {
                success: true,
                data: policy,
                message: 'Policy created successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to create policy',
                error: error.message
            };
        }
    }

    /**
     * Update an existing policy
     */
    async updatePolicy(policyId, policyData, userId) {
        try {
            const policy = await SystemPolicy.findByPk(policyId);

            if (!policy) {
                return {
                    success: false,
                    message: 'Policy not found'
                };
            }

            const oldValues = {
                policyName: policy.policyName,
                policyValue: policy.policyValue,
                description: policy.description
            };

            // Update policy
            await policy.update({
                ...policyData,
                updatedBy: userId
            });

            // Log the policy update
            await AuditLog.logAction({
                userId,
                action: 'policy_update',
                module: 'system',
                targetType: 'SystemPolicy',
                targetId: policy.id,
                oldValues,
                newValues: policyData,
                description: `Updated policy: ${policy.policyName}`,
                severity: 'medium'
            });

            return {
                success: true,
                data: policy,
                message: 'Policy updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to update policy',
                error: error.message
            };
        }
    }

    /**
     * Delete a policy (soft delete)
     */
    async deletePolicy(policyId, userId) {
        try {
            const policy = await SystemPolicy.findByPk(policyId);

            if (!policy) {
                return {
                    success: false,
                    message: 'Policy not found'
                };
            }

            // Soft delete
            await policy.update({
                isActive: false,
                updatedBy: userId
            });

            // Log the policy deletion
            await AuditLog.logAction({
                userId,
                action: 'policy_update',
                module: 'system',
                targetType: 'SystemPolicy',
                targetId: policy.id,
                description: `Deleted policy: ${policy.policyName}`,
                severity: 'high'
            });

            return {
                success: true,
                message: 'Policy deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to delete policy',
                error: error.message
            };
        }
    }

    /**
     * Get default policies for system initialization
     */
    async getDefaultPolicies() {
        try {
            const defaultPolicies = SystemPolicy.getDefaultPolicies();

            return {
                success: true,
                data: defaultPolicies,
                message: 'Default policies retrieved successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to retrieve default policies',
                error: error.message
            };
        }
    }

    /**
     * Initialize default policies
     */
    async initializeDefaultPolicies(userId) {
        try {
            const defaultPolicies = SystemPolicy.getDefaultPolicies();
            const createdPolicies = [];

            for (const policyData of defaultPolicies) {
                const [policy, created] = await SystemPolicy.findOrCreate({
                    where: { policyKey: policyData.policyKey },
                    defaults: {
                        ...policyData,
                        createdBy: userId
                    }
                });

                if (created) {
                    createdPolicies.push(policy);
                }
            }

            return {
                success: true,
                data: createdPolicies,
                message: `Initialized ${createdPolicies.length} default policies`
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to initialize default policies',
                error: error.message
            };
        }
    }
}

export default new SystemPolicyService();