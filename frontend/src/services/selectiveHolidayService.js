/**
 * Selective Holiday Service
 * Frontend service for managing selective holiday filtering from Calendarific
 */

import api from './api.js';

class SelectiveHolidayService {
  /**
   * Test Calendarific API connection
   */
  async testConnection() {
    try {
      const response = await api.get('/admin/calendarific/test-connection');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to test connection');
    }
  }

  /**
   * Get available filter options and company policy templates
   */
  async getAvailableFilters() {
    try {
      const response = await api.get('/admin/calendarific/filters');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get available filters');
    }
  }

  /**
   * Get supported countries from Calendarific
   */
  async getSupportedCountries() {
    try {
      const response = await api.get('/admin/calendarific/countries');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get supported countries');
    }
  }

  /**
   * Preview holidays with basic filters
   */
  async previewHolidays(params = {}) {
    try {
      const { country = 'IN', year = new Date().getFullYear(), type = 'national' } = params;
      const response = await api.get('/admin/calendarific/preview', {
        params: { country, year, type }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to preview holidays');
    }
  }

  /**
   * Get API usage statistics
   */
  async getApiUsageStats() {
    try {
      const response = await api.get('/admin/calendarific/api-usage');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get API usage statistics');
    }
  }

  /**
   * Preview holidays with filters and API usage tracking
   */
  async previewHolidaysWithFilters(filterOptions = {}) {
    try {
      const response = await api.post('/admin/calendarific/preview-filtered', filterOptions);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to preview holidays with filters');
    }
  }

  /**
   * Get festival holidays only
   */
  async getFestivalHolidays(params = {}) {
    try {
      const { 
        country = 'IN', 
        year = new Date().getFullYear(),
        holidayTypes = 'national,religious'
      } = params;
      
      const response = await api.get('/admin/calendarific/festivals', {
        params: { country, year, holidayTypes }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get festival holidays');
    }
  }

  /**
   * Get national holidays only
   */
  async getNationalHolidays(params = {}) {
    try {
      const { 
        country = 'IN', 
        year = new Date().getFullYear()
      } = params;
      
      const response = await api.get('/admin/calendarific/national', {
        params: { country, year }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get national holidays');
    }
  }

  /**
   * Apply company policy template
   */
  async applyCompanyPolicy(policyOptions = {}) {
    try {
      const response = await api.post('/admin/calendarific/apply-policy', policyOptions);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to apply company policy');
    }
  }

  /**
   * Sync holidays with filters
   */
  async syncHolidaysWithFilters(syncOptions = {}) {
    try {
      const response = await api.post('/admin/calendarific/sync-filtered', syncOptions);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to sync holidays with filters');
    }
  }

  /**
   * Sync holidays (basic)
   */
  async syncHolidays(syncOptions = {}) {
    try {
      const response = await api.post('/admin/calendarific/sync', syncOptions);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to sync holidays');
    }
  }

  /**
   * Batch preview holidays (multiple types)
   */
  async batchPreviewHolidays(params = {}) {
    try {
      const { 
        country = 'IN', 
        year = new Date().getFullYear(),
        types = 'national,religious'
      } = params;
      
      const response = await api.get('/admin/calendarific/batch-preview', {
        params: { country, year, types }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to batch preview holidays');
    }
  }

  /**
   * Get holiday statistics
   */
  async getHolidayStats(params = {}) {
    try {
      const { 
        country = 'IN', 
        year = new Date().getFullYear()
      } = params;
      
      const response = await api.get('/admin/calendarific/stats', {
        params: { country, year }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get holiday statistics');
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus() {
    try {
      const response = await api.get('/admin/calendarific/status');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get sync status');
    }
  }

  /**
   * Bulk sync holidays for multiple years
   */
  async bulkSyncHolidays(bulkOptions = {}) {
    try {
      const response = await api.post('/admin/calendarific/bulk-sync', bulkOptions);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to bulk sync holidays');
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Get predefined filter presets for common use cases
   */
  getFilterPresets() {
    return {
      festivalsOnly: {
        name: 'Festivals Only',
        description: 'Religious and cultural festivals',
        filters: {
          festivalsOnly: true,
          excludeObservances: true,
          maxHolidays: 15
        }
      },
      nationalOnly: {
        name: 'National Holidays',
        description: 'Patriotic and national holidays',
        filters: {
          nationalOnly: true,
          maxHolidays: 5
        }
      },
      essentialHolidays: {
        name: 'Essential Holidays',
        description: 'Most important holidays only',
        filters: {
          importanceLevel: 'CRITICAL',
          maxHolidays: 8
        }
      },
      paidHolidaysOnly: {
        name: 'Paid Holidays',
        description: 'Only holidays that are typically paid',
        filters: {
          paidOnly: true,
          excludeObservances: true,
          maxHolidays: 12
        }
      },
      techStartup: {
        name: 'Tech Startup',
        description: 'Modern tech company policy',
        filters: {
          companyPolicy: 'TECH_STARTUP'
        }
      },
      traditional: {
        name: 'Traditional Corporate',
        description: 'Conservative corporate policy',
        filters: {
          companyPolicy: 'TRADITIONAL_CORPORATE'
        }
      },
      government: {
        name: 'Government Office',
        description: 'Comprehensive government policy',
        filters: {
          companyPolicy: 'GOVERNMENT_OFFICE'
        }
      },
      manufacturing: {
        name: 'Manufacturing',
        description: 'Essential holidays for manufacturing',
        filters: {
          companyPolicy: 'MANUFACTURING'
        }
      }
    };
  }

  /**
   * Get popular holiday combinations for India
   */
  getPopularIndianHolidays() {
    return {
      minimal: [
        'independence day',
        'republic day', 
        'gandhi jayanti',
        'diwali',
        'christmas'
      ],
      standard: [
        'independence day',
        'republic day', 
        'gandhi jayanti',
        'diwali',
        'christmas',
        'eid',
        'holi',
        'dussehra',
        'good friday',
        'guru nanak jayanti'
      ],
      comprehensive: [
        'independence day',
        'republic day', 
        'gandhi jayanti',
        'diwali',
        'christmas',
        'eid ul-fitr',
        'eid ul-adha',
        'holi',
        'dussehra',
        'durga puja',
        'good friday',
        'guru nanak jayanti',
        'janmashtami',
        'raksha bandhan',
        'karva chauth'
      ]
    };
  }

  /**
   * Validate filter options
   */
  validateFilters(filters) {
    const errors = [];

    if (filters.maxHolidays && (filters.maxHolidays < 1 || filters.maxHolidays > 50)) {
      errors.push('maxHolidays must be between 1 and 50');
    }

    if (filters.importanceLevel && !['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(filters.importanceLevel)) {
      errors.push('importanceLevel must be one of: CRITICAL, HIGH, MEDIUM, LOW');
    }

    if (filters.companyPolicy && !['TECH_STARTUP', 'TRADITIONAL_CORPORATE', 'GOVERNMENT_OFFICE', 'MANUFACTURING'].includes(filters.companyPolicy)) {
      errors.push('companyPolicy must be one of: TECH_STARTUP, TRADITIONAL_CORPORATE, GOVERNMENT_OFFICE, MANUFACTURING');
    }

    if (filters.categories && !Array.isArray(filters.categories)) {
      errors.push('categories must be an array');
    }

    return errors;
  }

  /**
   * Format holiday data for display
   */
  formatHolidayForDisplay(holiday) {
    return {
      id: holiday.id,
      name: holiday.name,
      date: holiday.date || holiday.recurringDate,
      category: holiday.category,
      isPaid: holiday.isPaid,
      type: holiday.type,
      description: holiday.description,
      color: holiday.color,
      importance: this.getHolidayImportance(holiday),
      displayDate: this.formatDisplayDate(holiday.date || holiday.recurringDate),
      categoryLabel: this.getCategoryLabel(holiday.category)
    };
  }

  /**
   * Get holiday importance level
   */
  getHolidayImportance(holiday) {
    const name = holiday.name.toLowerCase();
    
    const criticalHolidays = ['independence day', 'republic day', 'gandhi jayanti', 'diwali', 'eid', 'christmas'];
    const highHolidays = ['holi', 'dussehra', 'durga puja', 'good friday', 'guru nanak jayanti'];
    const mediumHolidays = ['karva chauth', 'raksha bandhan', 'janmashtami', 'mahavir jayanti'];
    
    if (criticalHolidays.some(h => name.includes(h))) return 'CRITICAL';
    if (highHolidays.some(h => name.includes(h))) return 'HIGH';
    if (mediumHolidays.some(h => name.includes(h))) return 'MEDIUM';
    
    return 'LOW';
  }

  /**
   * Format date for display
   */
  formatDisplayDate(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Get category label
   */
  getCategoryLabel(category) {
    const labels = {
      'national': 'National',
      'religious': 'Religious',
      'public': 'Public',
      'optional': 'Optional',
      'company': 'Company'
    };
    
    return labels[category] || category;
  }
}

export default new SelectiveHolidayService();