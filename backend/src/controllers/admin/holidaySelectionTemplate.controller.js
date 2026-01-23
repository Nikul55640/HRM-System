/**
 * Holiday Selection Template Controller
 * Handles HTTP requests for holiday selection template management
 */

import holidaySelectionTemplateService from '../../services/admin/holidaySelectionTemplate.service.js';
import  ResponseFormatter from '../../utils/ResponseFormatter.js';

class HolidaySelectionTemplateController {
  /**
   * Get all holiday selection templates
   */
  async getTemplates(req, res) {
    try {
      const { page, limit, search, country, isActive } = req.query;
      
      const result = await holidaySelectionTemplateService.getTemplates(
        { search, country, isActive },
        { page, limit }
      );

      if (result.success) {
        return ResponseFormatter.success(res, result.data, 'Templates fetched successfully');
      } else {
        return ResponseFormatter.error(res, result.message, 400);
      }
    } catch (error) {
      return ResponseFormatter.error(res, 'Failed to fetch templates', 500, error.message);
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(req, res) {
    try {
      const { id } = req.params;
      
      const result = await holidaySelectionTemplateService.getTemplateById(id);

      if (result.success) {
        return ResponseFormatter.success(res, result.data, 'Template fetched successfully');
      } else {
        return ResponseFormatter.error(res, result.message, 404);
      }
    } catch (error) {
      return ResponseFormatter.error(res, 'Failed to fetch template', 500, error.message);
    }
  }

  /**
   * Create new holiday selection template
   */
  async createTemplate(req, res) {
    try {
      const templateData = req.body;
      const userId = req.user.id;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const result = await holidaySelectionTemplateService.createTemplate(
        templateData,
        userId,
        metadata
      );

      if (result.success) {
        return ResponseFormatter.success(res, result.data, result.message, 201);
      } else {
        return ResponseFormatter.error(res, result.message, 400);
      }
    } catch (error) {
      return ResponseFormatter.error(res, 'Failed to create template', 500, error.message);
    }
  }

  /**
   * Update holiday selection template
   */
  async updateTemplate(req, res) {
    try {
      const { id } = req.params;
      const templateData = req.body;
      const userId = req.user.id;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const result = await holidaySelectionTemplateService.updateTemplate(
        id,
        templateData,
        userId,
        metadata
      );

      if (result.success) {
        return ResponseFormatter.success(res, result.data, result.message);
      } else {
        return ResponseFormatter.error(res, result.message, 400);
      }
    } catch (error) {
      return ResponseFormatter.error(res, 'Failed to update template', 500, error.message);
    }
  }

  /**
   * Delete holiday selection template
   */
  async deleteTemplate(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const result = await holidaySelectionTemplateService.deleteTemplate(
        id,
        userId,
        metadata
      );

      if (result.success) {
        return ResponseFormatter.success(res, null, result.message);
      } else {
        return ResponseFormatter.error(res, result.message, 404);
      }
    } catch (error) {
      return ResponseFormatter.error(res, 'Failed to delete template', 500, error.message);
    }
  }

  /**
   * Get default template for country
   */
  async getDefaultTemplate(req, res) {
    try {
      const { country } = req.params;
      
      const result = await holidaySelectionTemplateService.getDefaultTemplate(country);

      if (result.success) {
        return ResponseFormatter.success(res, result.data, 'Default template fetched successfully');
      } else {
        return ResponseFormatter.error(res, result.message, 404);
      }
    } catch (error) {
      return ResponseFormatter.error(res, 'Failed to fetch default template', 500, error.message);
    }
  }

  /**
   * Apply template to filter holidays
   */
  async applyTemplate(req, res) {
    try {
      const { templateId } = req.params;
      const { holidays } = req.body;

      if (!Array.isArray(holidays)) {
        return ResponseFormatter.error(res, 'Holidays must be an array', 400);
      }

      const result = await holidaySelectionTemplateService.applyTemplateToHolidays(
        templateId,
        holidays
      );

      if (result.success) {
        return ResponseFormatter.success(res, result.data, 'Template applied successfully');
      } else {
        return ResponseFormatter.error(res, result.message, 400);
      }
    } catch (error) {
      return ResponseFormatter.error(res, 'Failed to apply template', 500, error.message);
    }
  }

  /**
   * Clone template
   */
  async cloneTemplate(req, res) {
    try {
      const { id } = req.params;
      const cloneData = req.body;
      const userId = req.user.id;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const result = await holidaySelectionTemplateService.cloneTemplate(
        id,
        cloneData,
        userId,
        metadata
      );

      if (result.success) {
        return ResponseFormatter.success(res, result.data, result.message, 201);
      } else {
        return ResponseFormatter.error(res, result.message, 400);
      }
    } catch (error) {
      return ResponseFormatter.error(res, 'Failed to clone template', 500, error.message);
    }
  }

  /**
   * Preview holidays with template selection
   * This combines Calendarific preview with template filtering
   */
  async previewWithTemplate(req, res) {
    try {
      const { templateId } = req.params;
      const { country, year, types } = req.query;

      // First get the template
      const templateResult = await holidaySelectionTemplateService.getTemplateById(templateId);
      
      if (!templateResult.success) {
        return ResponseFormatter.error(res, templateResult.message, 404);
      }

      const template = templateResult.data;

      // Mock Calendarific holidays for preview (in real implementation, call Calendarific API)
      // For now, return template data with preview structure
      const previewData = {
        template: template,
        country: country || template.country,
        year: parseInt(year) || new Date().getFullYear(),
        types: types ? types.split(',') : template.holidayTypes,
        selectedHolidays: template.selectedHolidays,
        maxHolidays: template.maxHolidays,
        message: `This template will select ${template.selectedHolidays.length} holidays from ${template.holidayTypes.join(', ')} categories`
      };

      return ResponseFormatter.success(res, previewData, 'Template preview generated successfully');
    } catch (error) {
      return ResponseFormatter.error(res, 'Failed to generate template preview', 500, error.message);
    }
  }
}

export default new HolidaySelectionTemplateController();