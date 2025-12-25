/**
 * Lead Service Layer - Simplified for 8 Core Features
 * Handles all business logic for lead management using followUpNotes JSON
 */

import { Lead, Employee, User } from '../../models/sequelize/index.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';

class LeadService {
    /**
     * Get all leads with filtering and pagination
     */
    async getLeads(filters = {}, pagination = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                status,
                priority,
                assignedTo,
                source,
                search,
                dateFrom,
                dateTo,
                sortBy = 'createdAt',
                sortOrder = 'DESC'
            } = { ...filters, ...pagination };

            const offset = (page - 1) * limit;
            const whereClause = {};

            // Apply filters
            if (status) whereClause.status = status;
            if (priority) whereClause.priority = priority;
            if (assignedTo) whereClause.assignedTo = assignedTo;
            if (source) whereClause.source = source;

            if (search) {
                whereClause[Op.or] = [
                    { firstName: { [Op.iLike]: `%${search}%` } },
                    { lastName: { [Op.iLike]: `%${search}%` } },
                    { email: { [Op.iLike]: `%${search}%` } },
                    { company: { [Op.iLike]: `%${search}%` } },
                    { leadId: { [Op.iLike]: `%${search}%` } }
                ];
            }

            if (dateFrom && dateTo) {
                whereClause.createdAt = {
                    [Op.between]: [new Date(dateFrom), new Date(dateTo)]
                };
            }

            const { count, rows } = await Lead.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Employee,
                        as: 'assignedEmployee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'email'],
                        required: false
                    },
                    {
                        model: Employee,
                        as: 'creatorEmployee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'email'],
                        required: false
                    }
                ],
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [[sortBy, sortOrder]]
            });

            return {
                success: true,
                data: {
                    leads: rows,
                    pagination: {
                        total: count,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(count / limit)
                    }
                }
            };
        } catch (error) {
            logger.error('Error fetching leads:', error);
            return {
                success: false,
                message: 'Failed to fetch leads',
                error: error.message
            };
        }
    }

    /**
     * Get lead by ID with follow-up notes
     */
    async getLeadById(leadId) {
        try {
            const lead = await Lead.findByPk(leadId, {
                include: [
                    {
                        model: Employee,
                        as: 'assignedEmployee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'email'],
                        required: false
                    },
                    {
                        model: Employee,
                        as: 'creatorEmployee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'email'],
                        required: false
                    }
                ]
            });

            if (!lead) {
                return {
                    success: false,
                    message: 'Lead not found'
                };
            }

            return {
                success: true,
                data: { lead }
            };
        } catch (error) {
            logger.error('Error fetching lead:', error);
            return {
                success: false,
                message: 'Failed to fetch lead',
                error: error.message
            };
        }
    }

    /**
     * Create new lead
     */
    async createLead(leadData, createdBy) {
        try {
            // Generate lead ID if not provided
            if (!leadData.leadId) {
                const leadCount = await Lead.count();
                leadData.leadId = `LEAD-${String(leadCount + 1).padStart(6, '0')}`;
            }

            const lead = await Lead.create({
                ...leadData,
                createdBy,
                followUpNotes: leadData.notes ? [
                    {
                        content: leadData.notes,
                        createdBy,
                        createdAt: new Date(),
                        type: 'initial_note'
                    }
                ] : []
            });

            return {
                success: true,
                data: { lead },
                message: 'Lead created successfully'
            };
        } catch (error) {
            logger.error('Error creating lead:', error);
            return {
                success: false,
                message: 'Failed to create lead',
                error: error.message
            };
        }
    }

    /**
     * Update lead
     */
    async updateLead(leadId, leadData, updatedBy) {
        try {
            const lead = await Lead.findByPk(leadId);
            if (!lead) {
                return {
                    success: false,
                    message: 'Lead not found'
                };
            }

            const oldValues = lead.toJSON();

            await lead.update({
                ...leadData,
                updatedBy
            });

            return {
                success: true,
                data: { lead },
                message: 'Lead updated successfully'
            };
        } catch (error) {
            logger.error('Error updating lead:', error);
            return {
                success: false,
                message: 'Failed to update lead',
                error: error.message
            };
        }
    }

    /**
     * Delete lead (soft delete)
     */
    async deleteLead(leadId, deletedBy) {
        try {
            const lead = await Lead.findByPk(leadId);
            if (!lead) {
                return {
                    success: false,
                    message: 'Lead not found'
                };
            }

            await lead.destroy();

            return {
                success: true,
                message: 'Lead deleted successfully'
            };
        } catch (error) {
            logger.error('Error deleting lead:', error);
            return {
                success: false,
                message: 'Failed to delete lead',
                error: error.message
            };
        }
    }

    /**
     * Add follow-up note to lead
     */
    async addFollowUpNote(leadId, content, userId, metadata = {}) {
        try {
            const lead = await Lead.findByPk(leadId);
            if (!lead) {
                return {
                    success: false,
                    message: 'Lead not found'
                };
            }

            const currentNotes = lead.followUpNotes || [];
            const newNote = {
                id: Date.now(), // Simple ID for JSON array
                content,
                createdBy: userId,
                createdAt: new Date(),
                type: metadata.type || 'follow_up',
                ...metadata
            };

            await lead.update({
                followUpNotes: [...currentNotes, newNote]
            });

            return {
                success: true,
                data: { note: newNote },
                message: 'Follow-up note added successfully'
            };
        } catch (error) {
            logger.error('Error adding follow-up note:', error);
            return {
                success: false,
                message: 'Failed to add follow-up note',
                error: error.message
            };
        }
    }

    /**
     * Assign lead to employee
     */
    async assignLead(leadId, assignedTo, assignedBy) {
        try {
            const lead = await Lead.findByPk(leadId);
            if (!lead) {
                return {
                    success: false,
                    message: 'Lead not found'
                };
            }

            const employee = await Employee.findByPk(assignedTo);
            if (!employee) {
                return {
                    success: false,
                    message: 'Employee not found'
                };
            }

            await lead.update({
                assignedTo,
                updatedBy: assignedBy
            });

            // Add assignment note
            await this.addFollowUpNote(leadId, `Lead assigned to ${employee.firstName} ${employee.lastName}`, assignedBy, {
                type: 'assignment'
            });

            return {
                success: true,
                data: { lead },
                message: 'Lead assigned successfully'
            };
        } catch (error) {
            logger.error('Error assigning lead:', error);
            return {
                success: false,
                message: 'Failed to assign lead',
                error: error.message
            };
        }
    }

    /**
     * Update lead status
     */
    async updateStatus(leadId, status, userId, reason = null) {
        try {
            const lead = await Lead.findByPk(leadId);
            if (!lead) {
                return {
                    success: false,
                    message: 'Lead not found'
                };
            }

            const oldStatus = lead.status;
            await lead.update({
                status,
                updatedBy: userId
            });

            // Add status change note
            const noteContent = reason
                ? `Status changed from ${oldStatus} to ${status}. Reason: ${reason}`
                : `Status changed from ${oldStatus} to ${status}`;

            await this.addFollowUpNote(leadId, noteContent, userId, {
                type: 'status_change',
                oldStatus,
                newStatus: status
            });

            return {
                success: true,
                data: { lead },
                message: 'Lead status updated successfully'
            };
        } catch (error) {
            logger.error('Error updating lead status:', error);
            return {
                success: false,
                message: 'Failed to update lead status',
                error: error.message
            };
        }
    }

    /**
     * Get leads assigned to specific employee
     */
    async getAssignedLeads(employeeId, filters = {}) {
        try {
            const whereClause = { assignedTo: employeeId };

            if (filters.status) {
                whereClause.status = filters.status;
            }

            const leads = await Lead.findAll({
                where: whereClause,
                include: [
                    {
                        model: Employee,
                        as: 'creatorEmployee',
                        attributes: ['id', 'firstName', 'lastName', 'email'],
                        required: false
                    }
                ],
                order: [['updatedAt', 'DESC']]
            });

            return {
                success: true,
                data: { leads }
            };
        } catch (error) {
            logger.error('Error fetching assigned leads:', error);
            return {
                success: false,
                message: 'Failed to fetch assigned leads',
                error: error.message
            };
        }
    }
}

export default new LeadService();