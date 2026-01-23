/**
 * Holiday Selection Template Service
 * Manages holiday selection templates for reusable holiday configurations
 */

import { HolidaySelectionTemplate, User, AuditLog } from '../../models/index.js';
import { Op } from 'sequelize';

class HolidaySelectionTemplateService {
  /**
   * Get all holiday selection templates
   */
  async getTemplates(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 50, search, country, isActive } = { ...filters, ...pagination };
      const offset = (page - 1) * limit;

      const whereClause = {};

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      if (country) {
        whereClause.country = country;
      }

      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }

      const { count, rows } = await HolidaySelectionTemplate.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'email', 'firstName', 'lastName']
          },
          {
            model: User,
            as: 'updater',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['isDefault', 'DESC'], ['name', 'ASC']]
      });

      return {
        success: true,
        data: {
          templates: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch holiday selection templates',
        error: error.message
      };
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(id) {
    try {
      const template = await HolidaySelectionTemplate.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'email', 'firstName', 'lastName']
          },
          {
            model: User,
            as: 'updater',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }
        ]
      });

      if (!template) {
        return {
          success: false,
          message: 'Holiday selection template not found'
        };
      }

      return {
        success: true,
        data: template
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch holiday selection template',
        error: error.message
      };
    }
  }

  /**
   * Create new holiday selection template
   */
  async createTemplate(templateData, userId, metadata = {}) {
    try {
      const {
        name,
        description,
        country,
        holidayTypes,
        selectedHolidays,
        maxHolidays,
        isDefault
      } = templateData;

      // Validation
      if (!name || !country || !holidayTypes || !selectedHolidays) {
        return {
          success: false,
          message: 'Name, country, holiday types, and selected holidays are required'
        };
      }

      if (!Array.isArray(holidayTypes) || holidayTypes.length === 0) {
        return {
          success: false,
          message: 'Holiday types must be a non-empty array'
        };
      }

      if (!Array.isArray(selectedHolidays) || selectedHolidays.length === 0) {
        return {
          success: false,
          message: 'Selected holidays must be a non-empty array'
        };
      }

      if (maxHolidays && selectedHolidays.length > maxHolidays) {
        return {
          success: false,
          message: `Selected holidays (${selectedHolidays.length}) exceed maximum limit (${maxHolidays})`
        };
      }

      // Check if template with same name and country exists
      const existingTemplate = await HolidaySelectionTemplate.findOne({
        where: {
          name: name,
          country: country
        }
      });

      if (existingTemplate) {
        return {
          success: false,
          message: 'Template with this name already exists for this country'
        };
      }

      // If setting as default, unset other defaults for this country
      if (isDefault) {
        await HolidaySelectionTemplate.update(
          { isDefault: false },
          { 
            where: { 
              country: country,
              isDefault: true 
            } 
          }
        );
      }

      const template = await HolidaySelectionTemplate.create({
        name,
        description,
        country,
        holidayTypes,
        selectedHolidays,
        maxHolidays: maxHolidays || 10,
        isDefault: isDefault || false,
        createdBy: userId
      });

      // Log creation
      await AuditLog.logAction({
        userId,
        action: 'holiday_template_create',
        module: 'holiday_template',
        targetType: 'HolidaySelectionTemplate',
        targetId: template.id,
        newValues: templateData,
        description: `Created holiday selection template: ${template.name}`,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        severity: 'medium'
      });

      const createdTemplate = await HolidaySelectionTemplate.findByPk(template.id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }
        ]
      });

      return {
        success: true,
        message: 'Holiday selection template created successfully',
        data: createdTemplate
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create holiday selection template',
        error: error.message
      };
    }
  }

  /**
   * Update holiday selection template
   */
  async updateTemplate(id, templateData, userId, metadata = {}) {
    try {
      const template = await HolidaySelectionTemplate.findByPk(id);

      if (!template) {
        return {
          success: false,
          message: 'Holiday selection template not found'
        };
      }

      const {
        name,
        description,
        holidayTypes,
        selectedHolidays,
        maxHolidays,
        isActive,
        isDefault
      } = templateData;

      // Validation
      if (holidayTypes && (!Array.isArray(holidayTypes) || holidayTypes.length === 0)) {
        return {
          success: false,
          message: 'Holiday types must be a non-empty array'
        };
      }

      if (selectedHolidays && (!Array.isArray(selectedHolidays) || selectedHolidays.length === 0)) {
        return {
          success: false,
          message: 'Selected holidays must be a non-empty array'
        };
      }

      if (maxHolidays && selectedHolidays && selectedHolidays.length > maxHolidays) {
        return {
          success: false,
          message: `Selected holidays (${selectedHolidays.length}) exceed maximum limit (${maxHolidays})`
        };
      }

      // Check if another template with same name exists for this country
      if (name && name !== template.name) {
        const existingTemplate = await HolidaySelectionTemplate.findOne({
          where: {
            id: { [Op.ne]: id },
            name: name,
            country: template.country
          }
        });

        if (existingTemplate) {
          return {
            success: false,
            message: 'Another template with this name already exists for this country'
          };
        }
      }

      // If setting as default, unset other defaults for this country
      if (isDefault && !template.isDefault) {
        await HolidaySelectionTemplate.update(
          { isDefault: false },
          { 
            where: { 
              country: template.country,
              isDefault: true,
              id: { [Op.ne]: id }
            } 
          }
        );
      }

      const oldValues = {
        name: template.name,
        description: template.description,
        holidayTypes: template.holidayTypes,
        selectedHolidays: template.selectedHolidays,
        maxHolidays: template.maxHolidays,
        isActive: template.isActive,
        isDefault: template.isDefault
      };

      await template.update({
        name: name || template.name,
        description: description !== undefined ? description : template.description,
        holidayTypes: holidayTypes || template.holidayTypes,
        selectedHolidays: selectedHolidays || template.selectedHolidays,
        maxHolidays: maxHolidays !== undefined ? maxHolidays : template.maxHolidays,
        isActive: isActive !== undefined ? isActive : template.isActive,
        isDefault: isDefault !== undefined ? isDefault : template.isDefault,
        updatedBy: userId
      });

      // Log update
      await AuditLog.logAction({
        userId,
        action: 'holiday_template_update',
        module: 'holiday_template',
        targetType: 'HolidaySelectionTemplate',
        targetId: template.id,
        oldValues,
        newValues: templateData,
        description: `Updated holiday selection template: ${template.name}`,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        severity: 'medium'
      });

      const updatedTemplate = await HolidaySelectionTemplate.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'email', 'firstName', 'lastName']
          },
          {
            model: User,
            as: 'updater',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }
        ]
      });

      return {
        success: true,
        message: 'Holiday selection template updated successfully',
        data: updatedTemplate
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update holiday selection template',
        error: error.message
      };
    }
  }

  /**
   * Delete holiday selection template
   */
  async deleteTemplate(id, userId, metadata = {}) {
    try {
      const template = await HolidaySelectionTemplate.findByPk(id);

      if (!template) {
        return {
          success: false,
          message: 'Holiday selection template not found'
        };
      }

      await template.destroy();

      // Log deletion
      await AuditLog.logAction({
        userId,
        action: 'holiday_template_delete',
        module: 'holiday_template',
        targetType: 'HolidaySelectionTemplate',
        targetId: template.id,
        description: `Deleted holiday selection template: ${template.name}`,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        severity: 'high'
      });

      return {
        success: true,
        message: 'Holiday selection template deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete holiday selection template',
        error: error.message
      };
    }
  }

  /**
   * Get default template for country
   */
  async getDefaultTemplate(country) {
    try {
      const template = await HolidaySelectionTemplate.findOne({
        where: {
          country: country,
          isDefault: true,
          isActive: true
        },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }
        ]
      });

      return {
        success: true,
        data: template
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch default template',
        error: error.message
      };
    }
  }

  /**
   * Apply template to sync holidays
   * This method filters Calendarific holidays based on template selection
   */
  async applyTemplateToHolidays(templateId, calendarificHolidays) {
    try {
      const template = await HolidaySelectionTemplate.findByPk(templateId);

      if (!template) {
        return {
          success: false,
          message: 'Holiday selection template not found'
        };
      }

      if (!Array.isArray(calendarificHolidays)) {
        return {
          success: false,
          message: 'Invalid holidays data'
        };
      }

      // Filter holidays based on template selection
      const selectedHolidayNames = template.selectedHolidays;
      const filteredHolidays = calendarificHolidays.filter(holiday => 
        selectedHolidayNames.includes(holiday.name)
      );

      return {
        success: true,
        data: {
          template: template,
          originalCount: calendarificHolidays.length,
          filteredCount: filteredHolidays.length,
          holidays: filteredHolidays,
          skippedHolidays: calendarificHolidays.filter(holiday => 
            !selectedHolidayNames.includes(holiday.name)
          )
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to apply template to holidays',
        error: error.message
      };
    }
  }

  /**
   * Clone template for different country/year
   */
  async cloneTemplate(id, cloneData, userId, metadata = {}) {
    try {
      const sourceTemplate = await HolidaySelectionTemplate.findByPk(id);

      if (!sourceTemplate) {
        return {
          success: false,
          message: 'Source template not found'
        };
      }

      const {
        name,
        country,
        description
      } = cloneData;

      if (!name || !country) {
        return {
          success: false,
          message: 'Name and country are required for cloning'
        };
      }

      // Check if template with same name and country exists
      const existingTemplate = await HolidaySelectionTemplate.findOne({
        where: {
          name: name,
          country: country
        }
      });

      if (existingTemplate) {
        return {
          success: false,
          message: 'Template with this name already exists for this country'
        };
      }

      const clonedTemplate = await HolidaySelectionTemplate.create({
        name,
        description: description || `Cloned from ${sourceTemplate.name}`,
        country,
        holidayTypes: sourceTemplate.holidayTypes,
        selectedHolidays: sourceTemplate.selectedHolidays,
        maxHolidays: sourceTemplate.maxHolidays,
        isDefault: false, // Cloned templates are never default
        createdBy: userId
      });

      // Log cloning
      await AuditLog.logAction({
        userId,
        action: 'holiday_template_clone',
        module: 'holiday_template',
        targetType: 'HolidaySelectionTemplate',
        targetId: clonedTemplate.id,
        description: `Cloned holiday selection template from ${sourceTemplate.name} to ${clonedTemplate.name}`,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        severity: 'medium'
      });

      const createdTemplate = await HolidaySelectionTemplate.findByPk(clonedTemplate.id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }
        ]
      });

      return {
        success: true,
        message: 'Holiday selection template cloned successfully',
        data: createdTemplate
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to clone holiday selection template',
        error: error.message
      };
    }
  }
}

export default new HolidaySelectionTemplateService();