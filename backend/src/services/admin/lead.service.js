/**
 * Lead Service Layer
 * Handles all business logic for lead management
 */

import { Lead, LeadActivity, LeadNote, Employee, User, AuditLog } from '../../models/sequelize/index.js';
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
            const whereClause = { isActive: true };

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
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email'],
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
     * Get lead by ID
     */
    async getLeadById(id) {
        try {
            const lead = await Lead.findByPk(id, {
                include: [
                    {
                        model: Employee,
                        as: 'assignedEmployee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'email'],
                        required: false
                    },
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email'],
                        required: false
                    },
                    {
                        model: LeadActivity,
                        as: 'activities',
                        include: [
                            {
                                model: User,
                                as: 'user',
                                attributes: ['id', 'name', 'email']
                            }
                        ],
                        order: [['createdAt', 'DESC']]
                    },
                    {
                        model: LeadNote,
                        as: 'notes',
                        include: [
                            {
                                model: User,
                                as: 'author',
                                attributes: ['id', 'name', 'email']
                            }
                        ],
                        order: [['createdAt', 'DESC']]
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
                data: lead
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
    async createLead(leadData, userId, metadata = {}) {
        try {
            const {
                firstName,
                lastName,
                email,
                phone,
                company,
                jobTitle,
                source,
                priority,
                status,
                assignedTo,
                notes,
                customFields
            } = leadData;

            // Check if lead with same email exists
            const existingLead = await Lead.findOne({
                where: {
                    email: email.toLowerCase(),
                    isActive: true
                }
            });

            if (existingLead) {
                return {
                    success: false,
                    message: 'Lead with this email already exists'
                };
            }

            // Generate lead ID
            const lastLead = await Lead.findOne({
                order: [['createdAt', 'DESC']]
            });

            let nextNumber = 1;
            if (lastLead?.leadId) {
                const lastNumber = parseInt(lastLead.leadId.split('-').pop(), 10);
                nextNumber = lastNumber + 1;
            }

            const leadId = `LEAD-${new Date().getFullYear()}-${String(nextNumber).padStart(4, '0')}`;

            const lead = await Lead.create({
                leadId,
                firstName,
                lastName,
                email: email.toLowerCase(),
                phone,
                company,
                jobTitle,
                source,
                priority: priority || 'Medium',
                status: status || 'New',
                assignedTo,
                customFields: customFields || {},
                createdBy: userId
            });

            // Add initial note if provided
            if (notes) {
                await LeadNote.create({
                    leadId: lead.id,
                    content: notes,
                    authorId: userId
                });
            }

            // Log activity
            await LeadActivity.create({
                leadId: lead.id,
                activityType: 'created',
                description: 'Lead created',
                userId
            });

            // Log creation in audit log
            await AuditLog.logAction({
                userId,
                action: 'lead_create',
                module: 'lead',
                targetType: 'Lead',
                targetId: lead.id,
                newValues: leadData,
                description: `Created new lead: ${lead.firstName} ${lead.lastName} (${lead.leadId})`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'medium'
            });

            const createdLead = await Lead.findByPk(lead.id, {
                include: [
                    {
                        model: Employee,
                        as: 'assignedEmployee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'email'],
                        required: false
                    }
                ]
            });

            return {
                success: true,
                message: 'Lead created successfully',
                data: createdLead
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
    async updateLead(id, leadData, userId, metadata = {}) {
        try {
            const lead = await Lead.findByPk(id);

            if (!lead) {
                return {
                    success: false,
                    message: 'Lead not found'
                };
            }

            // Check email uniqueness if email is being updated
            if (leadData.email && leadData.email.toLowerCase() !== lead.email.toLowerCase()) {
                const existingLead = await Lead.findOne({
                    where: {
                        email: leadData.email.toLowerCase(),
                        isActive: true,
                        id: { [Op.ne]: id }
                    }
                });

                if (existingLead) {
                    return {
                        success: false,
                        message: 'Another lead with this email already exists'
                    };
                }
            }

            const oldValues = {
                status: lead.status,
                priority: lead.priority,
                assignedTo: lead.assignedTo
            };

            // Update lead
            await lead.update({
                ...leadData,
                email: leadData.email ? leadData.email.toLowerCase() : lead.email,
                updatedBy: userId
            });

            // Log status change activity
            if (leadData.status && leadData.status !== oldValues.status) {
                await LeadActivity.create({
                    leadId: lead.id,
                    activityType: 'status_changed',
                    description: `Status changed from ${oldValues.status} to ${leadData.status}`,
                    userId
                });
            }

            // Log assignment change activity
            if (leadData.assignedTo && leadData.assignedTo !== oldValues.assignedTo) {
                await LeadActivity.create({
                    leadId: lead.id,
                    activityType: 'assigned',
                    description: `Lead assigned to new employee`,
                    userId
                });
            }

            // Log update in audit log
            await AuditLog.logAction({
                userId,
                action: 'lead_update',
                module: 'lead',
                targetType: 'Lead',
                targetId: lead.id,
                oldValues,
                newValues: leadData,
                description: `Updated lead: ${lead.firstName} ${lead.lastName}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'medium'
            });

            const updatedLead = await Lead.findByPk(id, {
                include: [
                    {
                        model: Employee,
                        as: 'assignedEmployee',
                        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'email'],
                        required: false
                    }
                ]
            });

            return {
                success: true,
                message: 'Lead updated successfully',
                data: updatedLead
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
    async deleteLead(id, userId, metadata = {}) {
        try {
            const lead = await Lead.findByPk(id);

            if (!lead) {
                return {
                    success: false,
                    message: 'Lead not found'
                };
            }

            await lead.update({
                isActive: false,
                updatedBy: userId
            });

            // Log activity
            await LeadActivity.create({
                leadId: lead.id,
                activityType: 'deleted',
                description: 'Lead deleted',
                userId
            });

            // Log deletion in audit log
            await AuditLog.logAction({
                userId,
                action: 'lead_delete',
                module: 'lead',
                targetType: 'Lead',
                targetId: lead.id,
                description: `Deleted lead: ${lead.firstName} ${lead.lastName}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'high'
            });

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
     * Add note to lead
     */
    async addLeadNote(leadId, content, userId, metadata = {}) {
        try {
            const lead = await Lead.findByPk(leadId);

            if (!lead) {
                return {
                    success: false,
                    message: 'Lead not found'
                };
            }

            const note = await LeadNote.create({
                leadId,
                content,
                authorId: userId
            });

            // Log activity
            await LeadActivity.create({
                leadId,
                activityType: 'note_added',
                description: 'Note added to lead',
                userId
            });

            const createdNote = await LeadNote.findByPk(note.id, {
                include: [
                    {
                        model: User,
                        as: 'author',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            return {
                success: true,
                message: 'Note added successfully',
                data: createdNote
            };
        } catch (error) {
            logger.error('Error adding lead note:', error);
            return {
                success: false,
                message: 'Failed to add note',
                error: error.message
            };
        }
    }

    /**
     * Get lead statistics
     */
    async getLeadStats(filters = {}) {
        try {
            const { assignedTo, dateFrom, dateTo } = filters;

            const whereClause = { isActive: true };

            if (assignedTo) {
                whereClause.assignedTo = assignedTo;
            }

            if (dateFrom && dateTo) {
                whereClause.createdAt = {
                    [Op.between]: [new Date(dateFrom), new Date(dateTo)]
                };
            }

            const [
                totalLeads,
                newLeads,
                qualifiedLeads,
                convertedLeads,
                lostLeads,
                statusDistribution,
                priorityDistribution,
                sourceDistribution
            ] = await Promise.all([
                Lead.count({ where: whereClause }),
                Lead.count({ where: { ...whereClause, status: 'New' } }),
                Lead.count({ where: { ...whereClause, status: 'Qualified' } }),
                Lead.count({ where: { ...whereClause, status: 'Converted' } }),
                Lead.count({ where: { ...whereClause, status: 'Lost' } }),
                Lead.findAll({
                    attributes: [
                        'status',
                        [Lead.sequelize.fn('COUNT', Lead.sequelize.col('id')), 'count']
                    ],
                    where: whereClause,
                    group: ['status'],
                    raw: true
                }),
                Lead.findAll({
                    attributes: [
                        'priority',
                        [Lead.sequelize.fn('COUNT', Lead.sequelize.col('id')), 'count']
                    ],
                    where: whereClause,
                    group: ['priority'],
                    raw: true
                }),
                Lead.findAll({
                    attributes: [
                        'source',
                        [Lead.sequelize.fn('COUNT', Lead.sequelize.col('id')), 'count']
                    ],
                    where: whereClause,
                    group: ['source'],
                    raw: true
                })
            ]);

            return {
                success: true,
                data: {
                    totalLeads,
                    newLeads,
                    qualifiedLeads,
                    convertedLeads,
                    lostLeads,
                    statusDistribution,
                    priorityDistribution,
                    sourceDistribution
                }
            };
        } catch (error) {
            logger.error('Error fetching lead stats:', error);
            return {
                success: false,
                message: 'Failed to fetch lead statistics',
                error: error.message
            };
        }
    }

    /**
     * Convert lead to customer/employee
     */
    async convertLead(id, conversionData, userId, metadata = {}) {
        try {
            const lead = await Lead.findByPk(id);

            if (!lead) {
                return {
                    success: false,
                    message: 'Lead not found'
                };
            }

            if (lead.status === 'Converted') {
                return {
                    success: false,
                    message: 'Lead is already converted'
                };
            }

            // Update lead status
            await lead.update({
                status: 'Converted',
                convertedAt: new Date(),
                conversionData,
                updatedBy: userId
            });

            // Log activity
            await LeadActivity.create({
                leadId: lead.id,
                activityType: 'converted',
                description: 'Lead converted successfully',
                userId
            });

            // Log conversion in audit log
            await AuditLog.logAction({
                userId,
                action: 'lead_convert',
                module: 'lead',
                targetType: 'Lead',
                targetId: lead.id,
                newValues: { status: 'Converted', conversionData },
                description: `Converted lead: ${lead.firstName} ${lead.lastName}`,
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
                severity: 'high'
            });

            return {
                success: true,
                message: 'Lead converted successfully',
                data: lead
            };
        } catch (error) {
            logger.error('Error converting lead:', error);
            return {
                success: false,
                message: 'Failed to convert lead',
                error: error.message
            };
        }
    }
}

export default new LeadService();