import { LeadActivity, Lead, Employee } from '../../models/index.js';
import { Op } from 'sequelize';
import auditService from '../../services/audit/audit.service.js';

class LeadActivityController {
  // Get activities for a lead
  async getActivities(req, res) {
    try {
      const { leadId } = req.params;
      const { page = 1, limit = 20, type, status } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { leadId };
      if (type) whereClause.type = type;
      if (status) whereClause.status = status;

      const activities = await LeadActivity.findAndCountAll({
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
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: activities.rows,
        pagination: {
          total: activities.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(activities.count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch activities'
      });
    }
  }

  // Create new activity
  async createActivity(req, res) {
    try {
      const { leadId } = req.params;
      const activityData = {
        ...req.body,
        leadId: parseInt(leadId),
        createdBy: req.user.id
      };

      // Verify lead exists
      const lead = await Lead.findByPk(leadId);
      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }

      const activity = await LeadActivity.create(activityData);

      // Update lead's last contact date if this is a contact activity
      if (['call', 'email', 'meeting'].includes(activity.type) && activity.status === 'completed') {
        await lead.update({ lastContactDate: new Date() });
      }

      // Audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'LEAD_ACTIVITY_CREATED',
        resource: 'LeadActivity',
        resourceId: activity.id,
        details: {
          leadId: lead.leadId,
          activityType: activity.type,
          subject: activity.subject
        }
      });

      const createdActivity = await LeadActivity.findByPk(activity.id, {
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
        message: 'Activity created successfully',
        data: createdActivity
      });
    } catch (error) {
      console.error('Error creating activity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create activity'
      });
    }
  }

  // Update activity
  async updateActivity(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const activity = await LeadActivity.findByPk(id);

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activity not found'
        });
      }

      await activity.update(updateData);

      // Update lead's last contact date if activity is completed
      if (updateData.status === 'completed' && ['call', 'email', 'meeting'].includes(activity.type)) {
        const lead = await Lead.findByPk(activity.leadId);
        if (lead) {
          await lead.update({ lastContactDate: new Date() });
        }
      }

      // Audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'LEAD_ACTIVITY_UPDATED',
        resource: 'LeadActivity',
        resourceId: activity.id,
        details: {
          changes: updateData
        }
      });

      const updatedActivity = await LeadActivity.findByPk(id, {
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
        message: 'Activity updated successfully',
        data: updatedActivity
      });
    } catch (error) {
      console.error('Error updating activity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update activity'
      });
    }
  }

  // Delete activity
  async deleteActivity(req, res) {
    try {
      const { id } = req.params;

      const activity = await LeadActivity.findByPk(id);

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activity not found'
        });
      }

      await activity.destroy();

      // Audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'LEAD_ACTIVITY_DELETED',
        resource: 'LeadActivity',
        resourceId: id,
        details: {
          subject: activity.subject,
          type: activity.type
        }
      });

      res.json({
        success: true,
        message: 'Activity deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting activity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete activity'
      });
    }
  }

  // Get upcoming activities
  async getUpcomingActivities(req, res) {
    try {
      const { assignedTo, days = 7 } = req.query;
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(days));

      const whereClause = {
        status: 'pending',
        scheduledDate: {
          [Op.between]: [new Date(), endDate]
        }
      };

      if (assignedTo) {
        whereClause.assignedTo = assignedTo;
      }

      const activities = await LeadActivity.findAll({
        where: whereClause,
        include: [
          {
            model: Lead,
            as: 'lead',
            attributes: ['id', 'leadId', 'firstName', 'lastName', 'company', 'status']
          },
          {
            model: Employee,
            as: 'assignedEmployee',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['scheduledDate', 'ASC']]
      });

      res.json({
        success: true,
        data: activities
      });
    } catch (error) {
      console.error('Error fetching upcoming activities:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch upcoming activities'
      });
    }
  }

  // Mark activity as completed
  async completeActivity(req, res) {
    try {
      const { id } = req.params;
      const { outcome, nextAction, duration } = req.body;

      const activity = await LeadActivity.findByPk(id);

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activity not found'
        });
      }

      await activity.update({
        status: 'completed',
        completedDate: new Date(),
        outcome,
        nextAction,
        duration
      });

      // Update lead's last contact date
      if (['call', 'email', 'meeting'].includes(activity.type)) {
        const lead = await Lead.findByPk(activity.leadId);
        if (lead) {
          await lead.update({ lastContactDate: new Date() });
        }
      }

      // Audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'LEAD_ACTIVITY_COMPLETED',
        resource: 'LeadActivity',
        resourceId: activity.id,
        details: {
          subject: activity.subject,
          outcome,
          nextAction
        }
      });

      const updatedActivity = await LeadActivity.findByPk(id, {
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
        message: 'Activity marked as completed',
        data: updatedActivity
      });
    } catch (error) {
      console.error('Error completing activity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete activity'
      });
    }
  }
}

export default new LeadActivityController();