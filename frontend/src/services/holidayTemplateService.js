/**
 * Holiday Template Service
 * Frontend service for managing holiday selection templates
 */

import api from './api';

class HolidayTemplateService {
  /**
   * Get all holiday selection templates
   */
  async getTemplates(filters = {}) {
    try {
      const { page = 1, limit = 50, search, country, isActive } = filters;
      
      const response = await api.get('/admin/holiday-templates', {
        params: { page, limit, search, country, isActive }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(id) {
    try {
      const response = await api.get(`/admin/holiday-templates/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new holiday selection template
   */
  async createTemplate(templateData) {
    try {
      const response = await api.post('/admin/holiday-templates', templateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update holiday selection template
   */
  async updateTemplate(id, templateData) {
    try {
      const response = await api.put(`/admin/holiday-templates/${id}`, templateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete holiday selection template
   */
  async deleteTemplate(id) {
    try {
      const response = await api.delete(`/admin/holiday-templates/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get default template for country
   */
  async getDefaultTemplate(country) {
    try {
      const response = await api.get(`/admin/holiday-templates/default/${country}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Apply template to filter holidays
   */
  async applyTemplate(templateId, holidays) {
    try {
      const response = await api.post(`/admin/holiday-templates/${templateId}/apply`, {
        holidays
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Clone holiday selection template
   */
  async cloneTemplate(id, cloneData) {
    try {
      const response = await api.post(`/admin/holiday-templates/${id}/clone`, cloneData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Preview holidays with template selection
   */
  async previewWithTemplate(templateId, params = {}) {
    try {
      const { country, year, types } = params;
      
      const response = await api.get(`/admin/holiday-templates/${templateId}/preview`, {
        params: { country, year, types }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create template from holiday selection
   * This is a helper method that combines holiday selection with template creation
   */
  async createTemplateFromSelection(selectionData) {
    try {
      const {
        name,
        description,
        country,
        holidayTypes,
        selectedHolidays,
        maxHolidays = 10,
        isDefault = false
      } = selectionData;

      const templateData = {
        name,
        description,
        country,
        holidayTypes,
        selectedHolidays,
        maxHolidays,
        isDefault
      };

      return await this.createTemplate(templateData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get template suggestions based on country and holiday types
   */
  async getTemplateSuggestions(country, holidayTypes) {
    try {
      const templates = await this.getTemplates({ country, isActive: true });
      
      if (!templates.success) {
        return { success: false, data: [] };
      }

      // Filter templates that match the holiday types
      const matchingTemplates = templates.data.templates.filter(template => {
        return holidayTypes.some(type => template.holidayTypes.includes(type));
      });

      return {
        success: true,
        data: matchingTemplates,
        message: `Found ${matchingTemplates.length} matching templates`
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate template data before creation/update
   */
  validateTemplateData(templateData) {
    const errors = [];
    
    if (!templateData.name || templateData.name.trim().length === 0) {
      errors.push('Template name is required');
    }
    
    if (!templateData.country || templateData.country.length !== 2) {
      errors.push('Valid country code is required');
    }
    
    if (!templateData.holidayTypes || !Array.isArray(templateData.holidayTypes) || templateData.holidayTypes.length === 0) {
      errors.push('At least one holiday type must be selected');
    }
    
    if (!templateData.selectedHolidays || !Array.isArray(templateData.selectedHolidays) || templateData.selectedHolidays.length === 0) {
      errors.push('At least one holiday must be selected');
    }
    
    if (templateData.maxHolidays && templateData.selectedHolidays && templateData.selectedHolidays.length > templateData.maxHolidays) {
      errors.push(`Selected holidays (${templateData.selectedHolidays.length}) exceed maximum limit (${templateData.maxHolidays})`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format template for display
   */
  formatTemplateForDisplay(template) {
    return {
      ...template,
      displayName: template.name,
      holidayCount: template.selectedHolidays ? template.selectedHolidays.length : 0,
      typesList: template.holidayTypes ? template.holidayTypes.join(', ') : '',
      createdDate: template.createdAt ? new Date(template.createdAt).toLocaleDateString() : '',
      updatedDate: template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : ''
    };
  }

  /**
   * Get template statistics
   */
  async getTemplateStats() {
    try {
      const templates = await this.getTemplates({ isActive: true });
      
      if (!templates.success) {
        return { success: false, data: null };
      }

      const stats = {
        total: templates.data.templates.length,
        byCountry: {},
        byHolidayCount: {
          small: 0,  // 1-5 holidays
          medium: 0, // 6-10 holidays
          large: 0   // 11+ holidays
        },
        defaultTemplates: 0
      };

      templates.data.templates.forEach(template => {
        // Count by country
        stats.byCountry[template.country] = (stats.byCountry[template.country] || 0) + 1;
        
        // Count by holiday count
        const holidayCount = template.selectedHolidays ? template.selectedHolidays.length : 0;
        if (holidayCount <= 5) {
          stats.byHolidayCount.small++;
        } else if (holidayCount <= 10) {
          stats.byHolidayCount.medium++;
        } else {
          stats.byHolidayCount.large++;
        }
        
        // Count default templates
        if (template.isDefault) {
          stats.defaultTemplates++;
        }
      });

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        success: false,
        message: data.message || 'An error occurred',
        error: data.error || 'Unknown error',
        status
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        message: 'Network error - please check your connection',
        error: 'Network error'
      };
    } else {
      // Other error
      return {
        success: false,
        message: error.message || 'An unexpected error occurred',
        error: error.message || 'Unknown error'
      };
    }
  }
}

export default new HolidayTemplateService();