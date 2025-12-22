import { Lead, LeadActivity, LeadNote, Employee } from '../../models/index.js';
import { Op } from 'sequelize';
import auditService from '../../services/audit/audit.service.js';

const LeadController={
  // Get all leads with filtering and pagination
  async getLeads(req, res) {
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
      } = req.query;

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

      const leads = await Lead.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Employee,
            as: 'assignedEmployee',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: Employee,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: leads.rows,
        pagination: {
          total: leads.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(leads.count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch leads'
      });
    }
  },

  // Get single lead with activities and notes
  async getLead(req, res) {
    try {
      const { id } = req.params;

      const lead = await Lead.findByPk(id, {
        include: [
          {
            model: Employee,
            as: 'assignedEmployee',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: Employee,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: LeadActivity,
            as: 'activities',
            include: [
              {
                model: Employee,
                as: 'assignedEmployee',
                attributes: ['id', 'firstName', 'lastName']
              },
              {
                model: Employee,
                as: 'creator',
                attributes: ['id', 'firstName', 'lastName']
              }
            ],
            order: [['createdAt', 'DESC']]
          },
          {
            model: LeadNote,
            as: 'notes',
            include: [
              {
                model: Employee,
                as: 'creator',
                attributes: ['id', 'firstName', 'lastName']
              }
            ],
            order: [['createdAt', 'DESC']]
          }
        ]
      });

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }

      res.json({
        success: true,
        data: lead
      });
    } catch (error) {
      console.error('Error fetching lead:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lead'
      });
    }
  },

  // Create new lead
  async createLead(req, res) {
    try {
      // Check if user has employee profile
      if (!req.user.employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee profile not linked to your account. Please contact HR.'
        });
      }

      const leadData = {
        ...req.body,
        createdBy: req.user.employeeId // Use employeeId instead of user id
      };

      const lead = await Lead.create(leadData);

      // Create initial activity
      await LeadActivity.create({
        leadId: lead.id,
        type: 'note',
        subject: 'Lead Created',
        description: 'New lead has been created in the system',
        status: 'completed',
        completedDate: new Date(),
        createdBy: req.user.employeeId // Use employeeId here too
      });

      // Audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'LEAD_CREATED',
        resource: 'Lead',
        resourceId: lead.id,
        details: {
          leadId: lead.leadId,
          name: `${lead.firstName} ${lead.lastName}`,
          email: lead.email,
          company: lead.company
        }
      });

      const createdLead = await Lead.findByPk(lead.id, {
        include: [
          {
            model: Employee,
            as: 'assignedEmployee',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: Employee,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Lead created successfully',
        data: createdLead
      });
    } catch (error) {
      console.error('Error creating lead:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        userId: req.user.id,
        employeeId: req.user.employeeId
      });
      res.status(500).json({
        success: false,
        message: 'Failed to create lead',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update lead
  async updateLead(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const lead = await Lead.findByPk(id);

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }

      const oldStatus = lead.status;
      const oldAssignedTo = lead.assignedTo;

      await lead.update(updateData);

      // Create activity for status change
      if (updateData.status && updateData.status !== oldStatus) {
        await LeadActivity.create({
          leadId: lead.id,
          type: 'status_change',
          subject: 'Status Changed',
          description: `Status changed from ${oldStatus} to ${updateData.status}`,
          status: 'completed',
          completedDate: new Date(),
          createdBy: req.user.employeeId, // Use employeeId
          metadata: {
            oldStatus,
            newStatus: updateData.status
          }
        });
      }

      // Create activity for assignment change
      if (updateData.assignedTo && updateData.assignedTo !== oldAssignedTo) {
        await LeadActivity.create({
          leadId: lead.id,
          type: 'assignment_change',
          subject: 'Assignment Changed',
          description: 'Lead has been reassigned',
          status: 'completed',
          completedDate: new Date(),
          createdBy: req.user.employeeId, // Use employeeId
          metadata: {
            oldAssignedTo,
            newAssignedTo: updateData.assignedTo
          }
        });
      }

      // Audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'LEAD_UPDATED',
        resource: 'Lead',
        resourceId: lead.id,
        details: {
          leadId: lead.leadId,
          changes: updateData
        }
      });

      const updatedLead = await Lead.findByPk(id, {
        include: [
          {
            model: Employee,
            as: 'assignedEmployee',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: Employee,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Lead updated successfully',
        data: updatedLead
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update lead'
      });
    }
  }

  // Delete lead (soft delete)
  async deleteLead(req, res) {
    try {
      const { id } = req.params;

      const lead = await Lead.findByPk(id);

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }

      await lead.update({ isActive: false });

      // Audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'LEAD_DELETED',
        resource: 'Lead',
        resourceId: lead.id,
        details: {
          leadId: lead.leadId,
          name: `${lead.firstName} ${lead.lastName}`
        }
      });

      res.json({
        success: true,
        message: 'Lead deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete lead'
      });
    }
  }

  // Get lead statistics
  async getLeadStats(req, res) {
    try {
      const { dateFrom, dateTo, assignedTo } = req.query;
      
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
        statusStats,
        priorityStats,
        sourceStats,
        recentLeads
      ] = await Promise.all([
        Lead.count({ where: whereClause }),
        Lead.findAll({
          where: whereClause,
          attributes: [
            'status',
            [Lead.sequelize.fn('COUNT', Lead.sequelize.col('id')), 'count']
          ],
          group: ['status']
        }),
        Lead.findAll({
          where: whereClause,
          attributes: [
            'priority',
            [Lead.sequelize.fn('COUNT', Lead.sequelize.col('id')), 'count']
          ],
          group: ['priority']
        }),
        Lead.findAll({
          where: whereClause,
          attributes: [
            'source',
            [Lead.sequelize.fn('COUNT', Lead.sequelize.col('id')), 'count']
          ],
          group: ['source']
        }),
        Lead.findAll({
          where: whereClause,
          include: [
            {
              model: Employee,
              as: 'assignedEmployee',
              attributes: ['firstName', 'lastName']
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: 5
        })
      ]);

      res.json({
        success: true,
        data: {
          totalLeads,
          statusStats: statusStats.reduce((acc, item) => {
            acc[item.status] = parseInt(item.dataValues.count);
            return acc;
          }, {}),
          priorityStats: priorityStats.reduce((acc, item) => {
            acc[item.priority] = parseInt(item.dataValues.count);
            return acc;
          }, {}),
          sourceStats: sourceStats.reduce((acc, item) => {
            acc[item.source] = parseInt(item.dataValues.count);
            return acc;
          }, {}),
          recentLeads
        }
      });
    } catch (error) {
      console.error('Error fetching lead stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lead statistics'
      });
    }
  }

  // Bulk operations
  async bulkUpdate(req, res) {
    try {
      const { leadIds, updateData } = req.body;

      await Lead.update(updateData, {
        where: {
          id: { [Op.in]: leadIds },
          isActive: true
        }
      });

      // Create activities for bulk update
      for (const leadId of leadIds) {
        await LeadActivity.create({
          leadId,
          type: 'note',
          subject: 'Bulk Update',
          description: `Lead updated via bulk operation: ${JSON.stringify(updateData)}`,
          status: 'completed',
          completedDate: new Date(),
          createdBy: req.user.employeeId // Use employeeId
        });
      }

      // Audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'LEADS_BULK_UPDATED',
        resource: 'Lead',
        details: {
          leadIds,
          updateData
        }
      });

      res.json({
        success: true,
        message: `${leadIds.length} leads updated successfully`
      });
    } catch (error) {
      console.error('Error in bulk update:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update leads'
      });
    }
  }
}

export default new LeadController();


