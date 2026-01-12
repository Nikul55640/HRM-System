/**
 * Calendarific API Service
 * Integrates with Calendarific API to fetch holidays for different countries/regions
 * https://calendarific.com/api-documentation
 */

import axios from 'axios';
import logger from '../../utils/logger.js';
import { Holiday } from '../../models/index.js';

class CalendarificService {
  constructor() {
    this.baseURL = 'https://calendarific.com/api/v2';
    this.apiKey = process.env.CALENDARIFIC_API_KEY;
    
    if (!this.apiKey) {
      logger.warn('Calendarific API key not found. Holiday sync will be disabled.');
    }
  }

  /**
   * Get holidays for a specific country and year
   * @param {string} country - ISO 3166-1 alpha-2 country code (e.g., 'IN', 'US', 'GB')
   * @param {number} year - Year to fetch holidays for
   * @param {string} type - Holiday type filter ('national', 'local', 'religious', 'observance')
   * @returns {Array} - Array of holiday objects
   */
  async getHolidays(country = 'IN', year = new Date().getFullYear(), type = 'national') {
    if (!this.apiKey) {
      throw new Error('Calendarific API key is not configured');
    }

    try {
      logger.info(`Fetching holidays from Calendarific for ${country} - ${year}`);
      
      const response = await axios.get(`${this.baseURL}/holidays`, {
        params: {
          api_key: this.apiKey,
          country: country,
          year: year,
          type: type
        },
        timeout: 10000 // 10 second timeout
      });

      if (response.data.meta.code !== 200) {
        throw new Error(`Calendarific API error: ${response.data.meta.error_detail || 'Unknown error'}`);
      }

      const holidays = response.data.response.holidays || [];
      logger.info(`Successfully fetched ${holidays.length} holidays from Calendarific`);
      
      return this.transformCalendarificHolidays(holidays);
      
    } catch (error) {
      if (error.response) {
        logger.error('Calendarific API error:', {
          status: error.response.status,
          data: error.response.data
        });
        throw new Error(`Calendarific API error: ${error.response.data.meta?.error_detail || error.message}`);
      } else if (error.request) {
        logger.error('Network error connecting to Calendarific:', error.message);
        throw new Error('Failed to connect to Calendarific API');
      } else {
        logger.error('Error setting up Calendarific request:', error.message);
        throw error;
      }
    }
  }

  /**
   * Transform Calendarific holiday data to our Holiday model format
   * @param {Array} calendarificHolidays - Raw holidays from Calendarific API
   * @returns {Array} - Transformed holidays
   */
  transformCalendarificHolidays(calendarificHolidays) {
    return calendarificHolidays.map(holiday => {
      const holidayDate = new Date(holiday.date.iso);
      const isRecurring = this.isRecurringHoliday(holiday);
      
      return {
        name: holiday.name,
        description: holiday.description || `${holiday.name} - ${holiday.type?.join(', ') || 'Holiday'}`,
        date: isRecurring ? null : holiday.date.iso,
        recurringDate: isRecurring ? this.getRecurringDate(holidayDate) : null,
        type: isRecurring ? 'RECURRING' : 'ONE_TIME',
        category: this.mapCalendarificCategory(holiday.type),
        isPaid: this.isPaidHoliday(holiday.type),
        appliesEveryYear: isRecurring,
        color: this.getHolidayColor(holiday.type),
        locationScope: this.getLocationScope(holiday.locations),
        hrApprovalStatus: 'approved',
        visibleToEmployees: true,
        includeInPayroll: this.isPaidHoliday(holiday.type),
        isActive: true,
        // Store original Calendarific data for reference
        calendarificData: {
          uuid: holiday.uuid,
          urlid: holiday.urlid,
          type: holiday.type,
          locations: holiday.locations,
          states: holiday.states
        },
        calendarificUuid: holiday.uuid,
        syncedFromCalendarific: true,
        lastSyncedAt: new Date()
      };
    });
  }

  /**
   * Determine if a holiday is recurring (happens every year)
   * @param {Object} holiday - Calendarific holiday object
   * @returns {boolean}
   */
  isRecurringHoliday(holiday) {
    const recurringTypes = ['national', 'religious', 'observance'];
    const nonRecurringKeywords = ['2024', '2025', 'special', 'one-time', 'commemoration'];
    
    // Check if holiday type suggests it's recurring
    const hasRecurringType = holiday.type?.some(type => recurringTypes.includes(type));
    
    // Check if name/description suggests it's a one-time event
    const hasNonRecurringKeywords = nonRecurringKeywords.some(keyword => 
      holiday.name.toLowerCase().includes(keyword) || 
      (holiday.description && holiday.description.toLowerCase().includes(keyword))
    );
    
    return hasRecurringType && !hasNonRecurringKeywords;
  }

  /**
   * Get recurring date in MM-DD format
   * @param {Date} date - Holiday date
   * @returns {string} - MM-DD format
   */
  getRecurringDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  }

  /**
   * Map Calendarific holiday types to our category system
   * @param {Array} types - Calendarific holiday types
   * @returns {string} - Our holiday category
   */
  mapCalendarificCategory(types = []) {
    if (types.includes('national')) return 'national';
    if (types.includes('religious')) return 'religious';
    if (types.includes('local')) return 'public';
    if (types.includes('observance')) return 'optional';
    return 'public';
  }

  /**
   * Determine if holiday should be paid
   * @param {Array} types - Calendarific holiday types
   * @returns {boolean}
   */
  isPaidHoliday(types = []) {
    // National holidays are typically paid
    if (types.includes('national')) return true;
    // Religious holidays might be paid depending on company policy
    if (types.includes('religious')) return true;
    // Local and observance holidays might not be paid
    return false;
  }

  /**
   * Get holiday color based on type
   * @param {Array} types - Calendarific holiday types
   * @returns {string} - Hex color code
   */
  getHolidayColor(types = []) {
    if (types.includes('national')) return '#dc2626'; // Red for national holidays
    if (types.includes('religious')) return '#7c3aed'; // Purple for religious holidays
    if (types.includes('local')) return '#059669'; // Green for local holidays
    if (types.includes('observance')) return '#d97706'; // Orange for observances
    return '#6b7280'; // Gray for others
  }

  /**
   * Determine location scope
   * @param {string} locations - Calendarific locations string
   * @returns {string} - Location scope
   */
  getLocationScope(locations) {
    if (!locations) return 'GLOBAL';
    if (locations.toLowerCase().includes('state')) return 'STATE';
    if (locations.toLowerCase().includes('city')) return 'CITY';
    return 'GLOBAL';
  }

  /**
   * Sync holidays from Calendarific to database
   * @param {string} country - Country code
   * @param {number} year - Year to sync
   * @param {Object} options - Sync options
   * @returns {Object} - Sync result
   */
  async syncHolidays(country = 'IN', year = new Date().getFullYear(), options = {}) {
    const {
      overwriteExisting = false,
      dryRun = false,
      holidayTypes = 'national,religious'
    } = options;

    try {
      logger.info(`Starting holiday sync for ${country} - ${year}`, { dryRun, overwriteExisting });
      
      // Fetch holidays from Calendarific
      const calendarificHolidays = await this.getHolidays(country, year, holidayTypes);
      
      if (calendarificHolidays.length === 0) {
        return {
          success: true,
          message: 'No holidays found to sync',
          stats: { total: 0, created: 0, updated: 0, skipped: 0 }
        };
      }

      const stats = { total: calendarificHolidays.length, created: 0, updated: 0, skipped: 0 };
      const results = [];

      for (const holidayData of calendarificHolidays) {
        try {
          const result = await this.syncSingleHoliday(holidayData, overwriteExisting, dryRun);
          results.push(result);
          stats[result.action]++;
        } catch (error) {
          logger.error(`Error syncing holiday ${holidayData.name}:`, error);
          results.push({
            name: holidayData.name,
            action: 'error',
            error: error.message
          });
        }
      }

      logger.info('Holiday sync completed', stats);
      
      return {
        success: true,
        message: `Successfully synced ${stats.created + stats.updated} holidays`,
        stats,
        results: dryRun ? results : undefined
      };

    } catch (error) {
      logger.error('Holiday sync failed:', error);
      throw error;
    }
  }

  /**
   * Sync a single holiday to database
   * @param {Object} holidayData - Transformed holiday data
   * @param {boolean} overwriteExisting - Whether to overwrite existing holidays
   * @param {boolean} dryRun - Whether this is a dry run
   * @returns {Object} - Sync result for this holiday
   */
  async syncSingleHoliday(holidayData, overwriteExisting, dryRun) {
    // Check if holiday already exists
    const existingHoliday = await this.findExistingHoliday(holidayData);
    
    if (existingHoliday) {
      if (!overwriteExisting) {
        return {
          name: holidayData.name,
          action: 'skipped',
          reason: 'Holiday already exists'
        };
      }
      
      if (dryRun) {
        return {
          name: holidayData.name,
          action: 'updated',
          reason: 'Would update existing holiday',
          changes: this.getHolidayChanges(existingHoliday, holidayData)
        };
      }
      
      // Update existing holiday
      await existingHoliday.update(holidayData);
      return {
        name: holidayData.name,
        action: 'updated',
        reason: 'Updated existing holiday'
      };
    } else {
      if (dryRun) {
        return {
          name: holidayData.name,
          action: 'created',
          reason: 'Would create new holiday'
        };
      }
      
      // Create new holiday
      await Holiday.create(holidayData);
      return {
        name: holidayData.name,
        action: 'created',
        reason: 'Created new holiday'
      };
    }
  }

  /**
   * Find existing holiday in database
   * @param {Object} holidayData - Holiday data to search for
   * @returns {Object|null} - Existing holiday or null
   */
  async findExistingHoliday(holidayData) {
    // First try to find by Calendarific UUID if available
    if (holidayData.calendarificUuid) {
      const existingByUuid = await Holiday.findOne({ 
        where: { calendarificUuid: holidayData.calendarificUuid } 
      });
      if (existingByUuid) return existingByUuid;
    }

    // Fallback to name and date matching
    const searchCriteria = {
      name: holidayData.name
    };

    if (holidayData.type === 'ONE_TIME') {
      searchCriteria.date = holidayData.date;
    } else {
      searchCriteria.recurringDate = holidayData.recurringDate;
    }

    return await Holiday.findOne({ where: searchCriteria });
  }

  /**
   * Get changes between existing and new holiday data
   * @param {Object} existing - Existing holiday
   * @param {Object} newData - New holiday data
   * @returns {Object} - Changes object
   */
  getHolidayChanges(existing, newData) {
    const changes = {};
    const fieldsToCheck = ['description', 'category', 'isPaid', 'color'];
    
    fieldsToCheck.forEach(field => {
      if (existing[field] !== newData[field]) {
        changes[field] = {
          from: existing[field],
          to: newData[field]
        };
      }
    });
    
    return changes;
  }

  /**
   * Get available countries from Calendarific
   * @returns {Array} - Array of supported countries
   */
  async getSupportedCountries() {
    if (!this.apiKey) {
      throw new Error('Calendarific API key is not configured');
    }

    try {
      const response = await axios.get(`${this.baseURL}/countries`, {
        params: {
          api_key: this.apiKey
        },
        timeout: 10000
      });

      if (response.data.meta.code !== 200) {
        throw new Error(`Calendarific API error: ${response.data.meta.error_detail}`);
      }

      return response.data.response.countries || [];
      
    } catch (error) {
      logger.error('Error fetching supported countries:', error);
      throw error;
    }
  }

  /**
   * Test API connection and key validity
   * @returns {Object} - Test result
   */
  async testConnection() {
    if (!this.apiKey) {
      return {
        success: false,
        message: 'API key is not configured'
      };
    }

    try {
      // Test with a simple request for current year holidays in India
      const response = await axios.get(`${this.baseURL}/holidays`, {
        params: {
          api_key: this.apiKey,
          country: 'IN',
          year: new Date().getFullYear(),
          type: 'national'
        },
        timeout: 5000
      });

      if (response.data.meta.code === 200) {
        return {
          success: true,
          message: 'API connection successful',
          holidayCount: response.data.response.holidays?.length || 0
        };
      } else {
        return {
          success: false,
          message: response.data.meta.error_detail || 'API request failed'
        };
      }
      
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.meta?.error_detail || error.message
      };
    }
  }
}

export default new CalendarificService();