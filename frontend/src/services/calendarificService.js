/**
 * Calendarific Service
 * Frontend service for Calendarific API integration
 */

import api from './api';

class CalendarificService {
  /**
   * Test Calendarific API connection
   */
  async testConnection() {
    console.log('📡 [SERVICE] testConnection() called');
    console.log('📡 [SERVICE] Making GET request to /admin/calendarific/test-connection');
    
    try {
      const response = await api.get('/admin/calendarific/test-connection');
      
      console.log('📡 [SERVICE] Response received:', response);
      console.log('📡 [SERVICE] Response status:', response.status);
      console.log('📡 [SERVICE] Response data:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('📡 [SERVICE] Error in testConnection:', error);
      console.error('📡 [SERVICE] Error response:', error.response);
      console.error('📡 [SERVICE] Error message:', error.message);
      
      throw this.handleError(error);
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
      throw this.handleError(error);
    }
  }

  /**
   * Preview holidays from Calendarific (without saving)
   */
  async previewHolidays(params = {}) {
    try {
      const { country = 'IN', year = new Date().getFullYear(), type = 'national' } = params;
      
      const response = await api.get('/admin/calendarific/preview', {
        params: { country, year, type }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Batch preview holidays - Multiple types in ONE request
   * SAVES API CREDITS by batching requests
   */
  async batchPreviewHolidays(params = {}) {
    try {
      const { 
        country = 'IN', 
        year = new Date().getFullYear(), 
        types = ['national', 'religious'] 
      } = params;
      
      // Convert array to comma-separated string
      const typesString = Array.isArray(types) ? types.join(',') : types;
      
      const response = await api.get('/admin/calendarific/batch-preview', {
        params: { country, year, types: typesString }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Sync holidays from Calendarific to database
   */
  async syncHolidays(data = {}) {
    try {
      const {
        country = 'IN',
        year = new Date().getFullYear(),
        overwriteExisting = false,
        dryRun = false,
        holidayTypes = 'national,religious'
      } = data;

      const response = await api.post('/admin/calendarific/sync', {
        country,
        year,
        overwriteExisting,
        dryRun,
        holidayTypes
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk sync holidays for multiple years
   */
  async bulkSyncHolidays(data = {}) {
    try {
      const {
        country = 'IN',
        startYear = new Date().getFullYear(),
        endYear = new Date().getFullYear() + 1,
        overwriteExisting = false,
        holidayTypes = 'national,religious'
      } = data;

      const response = await api.post('/admin/calendarific/bulk-sync', {
        country,
        startYear,
        endYear,
        overwriteExisting,
        holidayTypes
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get sync status and API health
   */
  async getSyncStatus() {
    try {
      const response = await api.get('/admin/calendarific/status');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get holiday statistics from Calendarific
   */
  async getHolidayStats(params = {}) {
    try {
      const { country = 'IN', year = new Date().getFullYear() } = params;
      
      const response = await api.get('/admin/calendarific/stats', {
        params: { country, year }
      });
      return response.data;
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

  /**
   * Get available holiday types with enhanced descriptions
   */
  getHolidayTypes() {
    return [
      { 
        value: 'national', 
        label: 'National Holidays', 
        description: 'Official national holidays and public holidays',
        iconName: 'Building2',
        color: '#3b82f6'
      },
      { 
        value: 'religious', 
        label: 'Religious Holidays', 
        description: 'Religious observances and festivals',
        iconName: 'Church',
        color: '#8b5cf6'
      },
      { 
        value: 'local', 
        label: 'Local Holidays', 
        description: 'Regional, state, or local holidays',
        iconName: 'MapPin',
        color: '#10b981'
      },
      { 
        value: 'observance', 
        label: 'Observances', 
        description: 'Special observances, commemorations, and awareness days',
        iconName: 'Calendar',
        color: '#f59e0b'
      }
    ];
  }

  /**
   * Get popular countries for holiday sync
   */
  getPopularCountries() {
    return [
      { code: 'IN', name: 'India', flag: '🇮🇳' },
      { code: 'US', name: 'United States', flag: '🇺🇸' },
      { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
      { code: 'CA', name: 'Canada', flag: '🇨🇦' },
      { code: 'AU', name: 'Australia', flag: '🇦🇺' },
      { code: 'DE', name: 'Germany', flag: '🇩🇪' },
      { code: 'FR', name: 'France', flag: '🇫🇷' },
      { code: 'JP', name: 'Japan', flag: '🇯🇵' },
      { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
      { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' }
    ];
  }

  /**
   * Format holiday data for display
   */
  formatHolidayForDisplay(holiday) {
    return {
      ...holiday,
      displayDate: this.formatDate(holiday.date || holiday.recurringDate),
      categoryIcon: this.getCategoryIcon(holiday.category),
      typeLabel: holiday.type === 'RECURRING' ? 'Annual' : 'One-time'
    };
  }

  /**
   * Format date for display
   */
  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    
    try {
      if (dateStr.includes('-') && dateStr.length === 5) {
        // MM-DD format for recurring dates
        const [month, day] = dateStr.split('-');
        const date = new Date(2024, parseInt(month) - 1, parseInt(day));
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      } else {
        // Full date
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
    } catch (error) {
      return dateStr;
    }
  }

  /**
   * Get category icon name (for use with icon components)
   */
  getCategoryIcon(category) {
    const icons = {
      national: 'Building2',
      religious: 'Church',
      public: 'PartyPopper',
      optional: 'Calendar',
      company: 'Building'
    };
    return icons[category] || 'Calendar';
  }

  /**
   * Validate sync parameters
   */
  validateSyncParams(params) {
    const errors = [];
    
    if (params.country && params.country.length !== 2) {
      errors.push('Country code must be 2 characters (ISO 3166-1 alpha-2)');
    }
    
    if (params.year && (params.year < 2020 || params.year > 2030)) {
      errors.push('Year must be between 2020 and 2030');
    }
    
    if (params.startYear && params.endYear && params.endYear < params.startYear) {
      errors.push('End year must be greater than or equal to start year');
    }
    
    if (params.startYear && params.endYear && (params.endYear - params.startYear) > 5) {
      errors.push('Cannot sync more than 5 years at once');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sync holidays using a holiday selection template
   */
  async syncWithTemplate(templateId, data = {}) {
    try {
      const {
        year = new Date().getFullYear(),
        overwriteExisting = false,
        dryRun = false
      } = data;

      const response = await api.post(`/admin/calendarific/sync-with-template/${templateId}`, {
        year,
        overwriteExisting,
        dryRun
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export default new CalendarificService();