/**
 * System Policy Controller
 * Handles policy configuration for SuperAdmin
 */

import { SystemPolicy, AuditLog, User } from '../../models/sequelize/index.js';
import { Op } from 'sequelize';

export const systemPolicyController = {
    // Get all policies
    getAllPolicies: async (req, res) => {
        try {
            const policies = await SystemPolicy.findAll({
                where: { isActive: true },
                order: [['policyType', 'ASC'], ['policyName', 'ASC']],
                include: [
                    { model: User, as: 'creator', attributes: ['id', 'name'] },
                    { model: User, as: 'updater', attributes: ['id', 'name'] }
                ]
            });

            res.json({
                success: true,
                data: policies,
                message: 'Policies retrieved successfully'
            });
        } catch (error) {
            console.error('Error fetching policies:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch policies',
                error: error.message
            });
        }
    },

    // Get policies by type
    getPoliciesByType: async (req, res) => {
        try {
            const { type } = req.params;

            const policies = await SystemPolicy.getPoliciesByType(type);

            res.json({
                success: true,
                data: policies,
                message: `${type} policies retrieved successfully`
            });
        } catch (error) {
            console.error('Error fetching policies by type:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch policies',
                error: error.message
            });
        }
    },

    // Get specific policy
    getPolicy: async (req, res) => {
        try {
            const { policyKey } = req.params;

            const policy = await SystemPolicy.findOne({
                where: { policyKey, isActive: true },
                include: [
                    { model: User, as: 'creator', attributes: ['id', 'name'] },
                    { model: User, as: 'updater', attributes: ['id', 'name'] }
                ]
            });

            if (!policy) {
                return res.status(404).json({
                    success: false,
                    message: 'Policy not found'
                });
            }

            res.json({
                success: true,
                data: policy,
                message: 'Policy retrieved successfully'
            });
        } catch (error) {
            console.error('Error fetching policy:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch policy',
                error: error.message
            });
        }
    },

    // Update policy
    updatePolicy: async (req, res) => {
        try {
            const { policyKey } = req.params;
            const { policyValue, description } = req.body;
            const userId = req.user.id;

            const policy = await SystemPolicy.findOne({
                where: { policyKey, isActive: true }
            });

            if (!policy) {
                return res.status(404).json({
                    success: false,
                    message: 'Policy not found'
                });
            }

            const oldValue = policy.policyValue;

            // Update policy
            await SystemPolicy.setPolicy(policyKey, policyValue, userId);

            // Log the policy change
            await AuditLog.logAction({
                userId,
                action: 'policy_update',
                module: 'system',
                targetType: 'SystemPolicy',
                targetId: policy.id,
                oldValues: { policyValue: oldValue },
                newValues: { policyValue },
                description: `Updated policy: ${policy.policyName}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                severity: 'medium'
            });

            res.json({
                success: true,
                message: 'Policy updated successfully'
            });
        } catch (error) {
            console.error('Error updating policy:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update policy',
                error: error.message
            });
        }
    },

    // Create new policy
    createPolicy: async (req, res) => {
        try {
            const {
                policyType,
                policyKey,
                policyName,
                policyValue,
                description
            } = req.body;
            const userId = req.user.id;

            const policy = await SystemPolicy.create({
                policyType,
                policyKey,
                policyName,
                policyValue,
                description,
                isActive: true,
                createdBy: userId
            });

            // Log the policy creation
            await AuditLog.logAction({
                userId,
                action: 'policy_update',
                module: 'system',
                targetType: 'SystemPolicy',
                targetId: policy.id,
                newValues: { policyKey, policyValue },
                description: `Created new policy: ${policyName}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                severity: 'medium'
            });

            res.status(201).json({
                success: true,
                data: policy,
                message: 'Policy created successfully'
            });
        } catch (error) {
            console.error('Error creating policy:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create policy',
                error: error.message
            });
        }
    },

    // Delete policy (deactivate)
    deletePolicy: async (req, res) => {
        try {
            const { policyKey } = req.params;
            const userId = req.user.id;

            const policy = await SystemPolicy.findOne({
                where: { policyKey, isActive: true }
            });

            if (!policy) {
                return res.status(404).json({
                    success: false,
                    message: 'Policy not found'
                });
            }

            // Deactivate instead of delete
            policy.isActive = false;
            policy.updatedBy = userId;
            await policy.save();

            // Log the policy deletion
            await AuditLog.logAction({
                userId,
                action: 'policy_update',
                module: 'system',
                targetType: 'SystemPolicy',
                targetId: policy.id,
                oldValues: { isActive: true },
                newValues: { isActive: false },
                description: `Deactivated policy: ${policy.policyName}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                severity: 'high'
            });

            res.json({
                success: true,
                message: 'Policy deactivated successfully'
            });
        } catch (error) {
            console.error('Error deleting policy:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete policy',
                error: error.message
            });
        }
    },

    // Get default policies template
    getDefaultPolicies: async (req, res) => {
        try {
            const defaultPolicies = SystemPolicy.getDefaultPolicies();

            res.json({
                success: true,
                data: defaultPolicies,
                message: 'Default policies template retrieved successfully'
            });
        } catch (error) {
            console.error('Error fetching default policies:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch default policies',
                error: error.message
            });
        }
    }
};

export default systemPolicyController;