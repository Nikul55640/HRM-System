/**
 * Calendarific API Service
 * Integrates with Calendarific API to fetch holidays for different countries/regions
 * https://calendarific.com/api-documentation
 */

import axios from 'axios';
import logger from '../../utils/logger.js';
import { Holiday } from '../../models/index.js';
import { 
  FESTIVAL_KEYWORDS, 
  NATIONAL_KEYWORDS, 
  OBSERVANCE_KEYWORDS, 
  STATE_KEYWORDS,
  IMPORTANCE_LEVELS,
  COMPANY_POLICY_TEMPLATES 
} from '../../constants/festivalKeywords.js';

class CalendarificService {
  constructor() {
    this.baseURL = 'https://calendarific.com/api/v2';
    this.apiKey = process.env.CALENDARIFIC_API_KEY;
    
    // Enhanced caching system to minimize API calls
    this.cache = new Map();
    this.CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days (holidays don't change often)
    this.requestQueue = new Map(); // Prevent duplicate simultaneous requests
    this.rateLimitDelay = 1000; // 1 second between API calls
    this.lastApiCall = 0;
    
    // API usage tracking
    this.apiCallCount = 0;
    this.dailyLimit = 1000; // Calendarific free tier limit
    this.resetTime = this.getNextMidnight();
    
    if (!this.apiKey) {
      logger.warn('Calendarific API key not found. Holiday sync will be disabled.');
    }
  }

  /**
   * Get next midnight for daily reset
   */
  getNextMidnight() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }

  /**
   * Reset daily API counter if needed
   */
  checkDailyReset() {
    const now = Date.now();
    if (now >= this.resetTime) {
      this.apiCallCount = 0;
      this.resetTime = this.getNextMidnight();
      logger.info('🔄 Daily API counter reset');
    }
  }

  /**
   * Generate cache key for raw API data (before filtering)
   */
  getRawCacheKey(country, year, type) {
    return `raw-${country}-${year}-${type}`;
  }

  /**
   * Generate cache key for filtered data
   */
  getFilteredCacheKey(country, year, type, filters = {}) {
    const filterHash = this.hashFilters(filters);
    return `filtered-${country}-${year}-${type}-${filterHash}`;
  }

  /**
   * Create a hash of filter options for caching
   */
  hashFilters(filters) {
    if (!filters || Object.keys(filters).length === 0) return 'none';
    
    // Sort keys to ensure consistent hashing
    const sortedFilters = {};
    Object.keys(filters).sort().forEach(key => {
      sortedFilters[key] = filters[key];
    });
    
    return Buffer.from(JSON.stringify(sortedFilters)).toString('base64').slice(0, 16);
  }

  /**
   * Generate cache key for API requests
   */
  getCacheKey(country, year, type, filters = {}) {
    return this.getFilteredCacheKey(country, year, type, filters);
  }

  /**
   * Check if cached data is still valid
   */
  isCacheValid(cacheEntry) {
    if (!cacheEntry) return false;
    const now = Date.now();
    return (now - cacheEntry.timestamp) < this.CACHE_TTL;
  }

  /**
   * Get data from cache if valid
   */
  getFromCache(country, year, type, filters = {}) {
    // Try filtered cache first
    const filteredKey = this.getFilteredCacheKey(country, year, type, filters);
    const filteredCached = this.cache.get(filteredKey);
    
    if (this.isCacheValid(filteredCached)) {
      logger.info(`✅ Filtered cache HIT for ${filteredKey} - API call saved`);
      return filteredCached.data;
    }

    // Try raw cache if no filters
    if (Object.keys(filters).length === 0) {
      const rawKey = this.getRawCacheKey(country, year, type);
      const rawCached = this.cache.get(rawKey);
      
      if (this.isCacheValid(rawCached)) {
        logger.info(`✅ Raw cache HIT for ${rawKey} - API call saved`);
        return rawCached.data;
      }
    }
    
    logger.info(`❌ Cache MISS for ${country}-${year}-${type} - Will call API`);
    return null;
  }

  /**
   * Store data in cache
   */
  setCache(country, year, type, data, filters = {}) {
    const key = this.getFilteredCacheKey(country, year, type, filters);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Also cache raw data if no filters
    if (Object.keys(filters).length === 0) {
      const rawKey = this.getRawCacheKey(country, year, type);
      this.cache.set(rawKey, {
        data,
        timestamp: Date.now()
      });
    }
    
    logger.info(`💾 Cached data for ${key}`);
  }

  /**
   * Rate limiting to prevent API abuse
   */
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCall;
    
    if (timeSinceLastCall < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastCall;
      logger.info(`⏳ Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastApiCall = Date.now();
  }

  /**
   * Check API usage limits
   */
  checkApiLimits() {
    this.checkDailyReset();
    
    if (this.apiCallCount >= this.dailyLimit) {
      throw new Error(`Daily API limit reached (${this.dailyLimit} calls). Resets at midnight.`);
    }
    
    if (this.apiCallCount > this.dailyLimit * 0.9) {
      logger.warn(`⚠️ API usage warning: ${this.apiCallCount}/${this.dailyLimit} calls used today`);
    }
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache() {
    this.cache.clear();
    logger.info('Calendarific cache cleared');
  }

  /**
   * Get holidays for a specific country and year with advanced filtering
   * OPTIMIZED to minimize API calls through smart caching
   */
  async getHolidays(country = 'IN', year = new Date().getFullYear(), type = 'national', filters = {}) {
    if (!this.apiKey) {
      throw new Error('Calendarific API key is not configured');
    }

    // Check if we're already fetching this data
    const requestKey = `${country}-${year}-${type}`;
    if (this.requestQueue.has(requestKey)) {
      logger.info(`⏳ Request already in progress for ${requestKey}, waiting...`);
      return await this.requestQueue.get(requestKey);
    }

    // Check cache first - SAVES API CREDITS
    const cachedData = this.getFromCache(country, year, type, filters);
    if (cachedData) {
      return cachedData;
    }

    // Check API limits before making call
    this.checkApiLimits();

    // Create promise for this request to prevent duplicates
    const requestPromise = this.makeApiCall(country, year, type, filters);
    this.requestQueue.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Remove from queue when done
      this.requestQueue.delete(requestKey);
    }
  }

  /**
   * Make the actual API call with optimizations
   */
  async makeApiCall(country, year, type, filters) {
    await this.enforceRateLimit();
    
    logger.info(`🌐 API Call #${this.apiCallCount + 1}: ${country}-${year}-${type}`);
    
    try {
      const response = await axios.get(`${this.baseURL}/holidays`, {
        params: {
          api_key: this.apiKey,
          country: country,
          year: year,
          type: type
        },
        timeout: 15000 // 15 second timeout
      });

      this.apiCallCount++;
      logger.info(`📊 API call completed successfully (${this.apiCallCount}/${this.dailyLimit} used today)`);

      if (response.data.meta.code !== 200) {
        throw new Error(`Calendarific API error: ${response.data.meta.error_detail || 'Unknown error'}`);
      }

      const holidays = response.data.response.holidays || [];
      logger.info(`✅ Fetched ${holidays.length} raw holidays from Calendarific`);
      
      let transformedHolidays = this.transformCalendarificHolidays(holidays);
      
      // Apply advanced filters
      if (Object.keys(filters).length > 0) {
        transformedHolidays = this.applyAdvancedFilters(transformedHolidays, filters);
        logger.info(`🎯 Applied filters: ${transformedHolidays.length} holidays after filtering`);
      }
      
      // Cache the result for future use
      this.setCache(country, year, type, transformedHolidays, filters);
      
      return transformedHolidays;
      
    } catch (error) {
      this.apiCallCount++; // Count failed calls too
      
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
   * Apply advanced filters to holidays
   * @param {Array} holidays - Array of transformed holidays
   * @param {Object} filters - Filter options
   * @returns {Array} - Filtered holidays
   */
  applyAdvancedFilters(holidays, filters) {
    let filteredHolidays = [...holidays];

    // Filter by festivals only
    if (filters.festivalsOnly) {
      filteredHolidays = this.filterFestivals(filteredHolidays);
    }

    // Filter by national holidays only
    if (filters.nationalOnly) {
      filteredHolidays = this.filterNationalHolidays(filteredHolidays);
    }

    // Filter by specific categories
    if (filters.categories && filters.categories.length > 0) {
      filteredHolidays = this.filterByCategories(filteredHolidays, filters.categories);
    }

    // Filter by importance level
    if (filters.importanceLevel) {
      filteredHolidays = this.filterByImportance(filteredHolidays, filters.importanceLevel);
    }

    // Filter by state/region
    if (filters.state) {
      filteredHolidays = this.filterByState(filteredHolidays, filters.state);
    }

    // Exclude observances
    if (filters.excludeObservances) {
      filteredHolidays = this.excludeObservances(filteredHolidays);
    }

    // Filter by paid holidays only
    if (filters.paidOnly) {
      filteredHolidays = filteredHolidays.filter(h => h.isPaid === true);
    }

    // Filter by specific holiday names
    if (filters.includeHolidays && filters.includeHolidays.length > 0) {
      filteredHolidays = this.filterBySpecificHolidays(filteredHolidays, filters.includeHolidays);
    }

    // Exclude specific holiday names
    if (filters.excludeHolidays && filters.excludeHolidays.length > 0) {
      filteredHolidays = this.excludeSpecificHolidays(filteredHolidays, filters.excludeHolidays);
    }

    // Apply company policy template
    if (filters.companyPolicy) {
      filteredHolidays = this.applyCompanyPolicy(filteredHolidays, filters.companyPolicy);
    }

    // Limit number of holidays
    if (filters.maxHolidays && filters.maxHolidays > 0) {
      filteredHolidays = this.limitHolidays(filteredHolidays, filters.maxHolidays);
    }

    return filteredHolidays;
  }

  /**
   * Filter holidays to festivals only
   * @param {Array} holidays - Array of holidays
   * @returns {Array} - Filtered festivals
   */
  filterFestivals(holidays) {
    return holidays.filter(holiday => {
      if (!holiday?.name) return false;
      
      const name = holiday.name.toLowerCase();
      const isReligious = holiday.category?.toLowerCase() === 'religious';
      const hasFestivalKeyword = FESTIVAL_KEYWORDS.some(keyword => 
        name.includes(keyword.toLowerCase())
      );
      
      return isReligious || hasFestivalKeyword;
    });
  }

  /**
   * Filter holidays to national holidays only
   * @param {Array} holidays - Array of holidays
   * @returns {Array} - Filtered national holidays
   */
  filterNationalHolidays(holidays) {
    return holidays.filter(holiday => {
      if (!holiday?.name) return false;
      
      const name = holiday.name.toLowerCase();
      const isNational = holiday.category?.toLowerCase() === 'national';
      const hasNationalKeyword = NATIONAL_KEYWORDS.some(keyword => 
        name.includes(keyword.toLowerCase())
      );
      
      return isNational || hasNationalKeyword;
    });
  }

  /**
   * Filter holidays by specific categories
   * @param {Array} holidays - Array of holidays
   * @param {Array} categories - Categories to include
   * @returns {Array} - Filtered holidays
   */
  filterByCategories(holidays, categories) {
    return holidays.filter(holiday => 
      categories.includes(holiday.category)
    );
  }

  /**
   * Filter holidays by importance level
   * @param {Array} holidays - Array of holidays
   * @param {string} level - Importance level (CRITICAL, HIGH, MEDIUM, LOW)
   * @returns {Array} - Filtered holidays
   */
  filterByImportance(holidays, level) {
    const importantHolidays = IMPORTANCE_LEVELS[level.toUpperCase()] || [];
    
    return holidays.filter(holiday => {
      const name = holiday.name.toLowerCase();
      return importantHolidays.some(important => 
        name.includes(important.toLowerCase())
      );
    });
  }

  /**
   * Filter holidays by state/region
   * @param {Array} holidays - Array of holidays
   * @param {string} state - State name
   * @returns {Array} - Filtered holidays
   */
  filterByState(holidays, state) {
    const stateKeywords = STATE_KEYWORDS[state.toLowerCase()] || [];
    
    return holidays.filter(holiday => {
      // Include global holidays
      if (holiday.locationScope === 'GLOBAL') return true;
      
      // Include state-specific holidays
      const name = holiday.name.toLowerCase();
      return stateKeywords.some(keyword => 
        name.includes(keyword.toLowerCase())
      );
    });
  }

  /**
   * Exclude observance holidays
   * @param {Array} holidays - Array of holidays
   * @returns {Array} - Filtered holidays
   */
  excludeObservances(holidays) {
    return holidays.filter(holiday => {
      const name = holiday.name.toLowerCase();
      const hasObservanceKeyword = OBSERVANCE_KEYWORDS.some(keyword => 
        name.includes(keyword.toLowerCase())
      );
      
      return !hasObservanceKeyword && holiday.category !== 'optional';
    });
  }

  /**
   * Filter by specific holiday names
   * @param {Array} holidays - Array of holidays
   * @param {Array} includeList - Holiday names to include
   * @returns {Array} - Filtered holidays
   */
  filterBySpecificHolidays(holidays, includeList) {
    return holidays.filter(holiday => {
      const name = holiday.name.toLowerCase();
      return includeList.some(includeName => 
        name.includes(includeName.toLowerCase())
      );
    });
  }

  /**
   * Exclude specific holiday names
   * @param {Array} holidays - Array of holidays
   * @param {Array} excludeList - Holiday names to exclude
   * @returns {Array} - Filtered holidays
   */
  excludeSpecificHolidays(holidays, excludeList) {
    return holidays.filter(holiday => {
      const name = holiday.name.toLowerCase();
      return !excludeList.some(excludeName => 
        name.includes(excludeName.toLowerCase())
      );
    });
  }

  /**
   * Apply company policy template
   * @param {Array} holidays - Array of holidays
   * @param {string} policyName - Company policy template name
   * @returns {Array} - Filtered holidays
   */
  applyCompanyPolicy(holidays, policyName) {
    const policy = COMPANY_POLICY_TEMPLATES[policyName.toUpperCase()];
    if (!policy) return holidays;

    let filteredHolidays = holidays;

    // Apply category filters
    if (policy.includeCategories) {
      filteredHolidays = this.filterByCategories(filteredHolidays, policy.includeCategories);
    }

    // Exclude observances if specified
    if (policy.excludeObservances) {
      filteredHolidays = this.excludeObservances(filteredHolidays);
    }

    // Limit number of holidays
    if (policy.maxHolidays) {
      filteredHolidays = this.limitHolidays(filteredHolidays, policy.maxHolidays);
    }

    return filteredHolidays;
  }

  /**
   * Limit number of holidays by importance
   * @param {Array} holidays - Array of holidays
   * @param {number} maxCount - Maximum number of holidays
   * @returns {Array} - Limited holidays
   */
  limitHolidays(holidays, maxCount) {
    // Sort by importance (critical first, then by date)
    const sortedHolidays = holidays.sort((a, b) => {
      const aImportance = this.getHolidayImportance(a);
      const bImportance = this.getHolidayImportance(b);
      
      if (aImportance !== bImportance) {
        return aImportance - bImportance; // Lower number = higher importance
      }
      
      return new Date(a.date || '1900-01-01') - new Date(b.date || '1900-01-01');
    });

    return sortedHolidays.slice(0, maxCount);
  }

  /**
   * Get holiday importance score (lower = more important)
   * @param {Object} holiday - Holiday object
   * @returns {number} - Importance score
   */
  getHolidayImportance(holiday) {
    const name = holiday.name.toLowerCase();
    
    if (IMPORTANCE_LEVELS.CRITICAL.some(h => name.includes(h))) return 1;
    if (IMPORTANCE_LEVELS.HIGH.some(h => name.includes(h))) return 2;
    if (IMPORTANCE_LEVELS.MEDIUM.some(h => name.includes(h))) return 3;
    if (IMPORTANCE_LEVELS.LOW.some(h => name.includes(h))) return 4;
    
    return 5; // Unknown importance
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
   * Sync holidays from Calendarific to database with advanced filtering
   * @param {string} country - Country code
   * @param {number} year - Year to sync
   * @param {Object} options - Sync options
   * @returns {Object} - Sync result
   */
  async syncHolidays(country = 'IN', year = new Date().getFullYear(), options = {}) {
    const {
      overwriteExisting = false,
      dryRun = false,
      holidayTypes = 'national,religious',
      filters = {}
    } = options;

    try {
      logger.info(`Starting holiday sync for ${country} - ${year}`, { dryRun, overwriteExisting, filters });
      
      // Fetch holidays from Calendarific with filters
      const calendarificHolidays = await this.getHolidays(country, year, holidayTypes, filters);
      
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
    console.log('⚙️ [SERVICE] testConnection() called');
    console.log('⚙️ [SERVICE] API Key exists:', !!this.apiKey);
    console.log('⚙️ [SERVICE] API Key (first 10 chars):', this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'N/A');
    console.log('⚙️ [SERVICE] Base URL:', this.baseURL);
    
    if (!this.apiKey) {
      console.warn('⚙️ [SERVICE] No API key configured!');
      return {
        success: false,
        message: 'API key is not configured'
      };
    }

    try {
      const testParams = {
        api_key: this.apiKey,
        country: 'IN',
        year: new Date().getFullYear(),
        type: 'national'
      };
      
      console.log('⚙️ [SERVICE] Making test request to Calendarific...');
      console.log('⚙️ [SERVICE] URL:', `${this.baseURL}/holidays`);
      console.log('⚙️ [SERVICE] Params:', { ...testParams, api_key: testParams.api_key.substring(0, 10) + '...' });
      
      // Test with a simple request for current year holidays in India
      const response = await axios.get(`${this.baseURL}/holidays`, {
        params: testParams,
        timeout: 5000
      });

      console.log('⚙️ [SERVICE] Response received');
      console.log('⚙️ [SERVICE] Response status:', response.status);
      console.log('⚙️ [SERVICE] Response meta code:', response.data.meta.code);
      console.log('⚙️ [SERVICE] Holiday count:', response.data.response.holidays?.length || 0);

      if (response.data.meta.code === 200) {
        const result = {
          success: true,
          message: 'API connection successful',
          holidayCount: response.data.response.holidays?.length || 0
        };
        console.log('✅ [SERVICE] Test successful:', result);
        return result;
      } else {
        const result = {
          success: false,
          message: response.data.meta.error_detail || 'API request failed'
        };
        console.warn('⚠️ [SERVICE] Test failed:', result);
        return result;
      }
      
    } catch (error) {
      console.error('❌ [SERVICE] Test error:', error.message);
      console.error('❌ [SERVICE] Error response:', error.response?.data);
      console.error('❌ [SERVICE] Error status:', error.response?.status);
      
      const result = {
        success: false,
        message: error.response?.data?.meta?.error_detail || error.message
      };
      console.error('❌ [SERVICE] Returning error result:', result);
      return result;
    }
  }

  /**
   * Get cache statistics for monitoring API usage
   */
  getCacheStats() {
    const stats = {
      totalEntries: this.cache.size,
      validEntries: 0,
      expiredEntries: 0,
      apiCallsToday: this.apiCallCount,
      remainingCalls: this.dailyLimit - this.apiCallCount,
      resetTime: new Date(this.resetTime).toLocaleString(),
      cacheHitRate: 0
    };
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isCacheValid(entry)) {
        stats.validEntries++;
      } else {
        stats.expiredEntries++;
      }
    }
    
    // Calculate cache hit rate (rough estimate)
    if (this.apiCallCount > 0) {
      stats.cacheHitRate = Math.round((stats.validEntries / (this.apiCallCount + stats.validEntries)) * 100);
    }
    
    return stats;
  }

  /**
   * Clean expired cache entries to save memory
   */
  cleanExpiredCache() {
    let cleaned = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isCacheValid(entry)) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    logger.info(`🧹 Cleaned ${cleaned} expired cache entries`);
    return cleaned;
  }

  /**
   * Batch fetch multiple holiday types efficiently
   */
  async batchFetchHolidays(country, year, types = ['national', 'religious']) {
    logger.info(`🔄 Batch fetching holidays for ${country}-${year}: ${types.join(', ')}`);
    
    const results = [];
    
    // Fetch each type, using cache when possible
    for (const type of types) {
      try {
        const holidays = await this.getHolidays(country, year, type);
        results.push({
          type,
          holidays,
          count: holidays.length,
          success: true
        });
      } catch (error) {
        logger.error(`Error fetching ${type} holidays:`, error);
        results.push({
          type,
          holidays: [],
          count: 0,
          success: false,
          error: error.message
        });
      }
    }
    
    // Combine all holidays
    const allHolidays = [];
    results.forEach(result => {
      if (result.success) {
        result.holidays.forEach(holiday => {
          allHolidays.push({
            ...holiday,
            sourceType: result.type
          });
        });
      }
    });
    
    // Remove duplicates
    const uniqueHolidays = this.removeDuplicateHolidays(allHolidays);
    
    logger.info(`✅ Batch fetch completed: ${uniqueHolidays.length} unique holidays`);
    
    return {
      holidays: uniqueHolidays,
      breakdown: results,
      stats: this.getCacheStats()
    };
  }

  /**
   * Remove duplicate holidays based on name and date
   */
  removeDuplicateHolidays(holidays) {
    const seen = new Set();
    return holidays.filter(holiday => {
      const key = `${holiday.name}-${holiday.date || holiday.recurringDate}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Optimized preview that shows API usage statistics
   */
  async previewHolidaysOptimized(country = 'IN', year = new Date().getFullYear(), filters = {}) {
    const startStats = this.getCacheStats();
    
    try {
      const result = await this.previewHolidays(country, year, filters);
      const endStats = this.getCacheStats();
      
      return {
        ...result,
        apiUsage: {
          callsMade: endStats.apiCallsToday - startStats.apiCallsToday,
          callsRemaining: endStats.remainingCalls,
          cacheHitRate: endStats.cacheHitRate,
          cacheEntries: endStats.validEntries,
          message: endStats.apiCallsToday === startStats.apiCallsToday ? 
            '✅ No API calls made - served from cache' : 
            `📞 ${endStats.apiCallsToday - startStats.apiCallsToday} API call(s) made`
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to preview holidays',
        error: error.message,
        apiUsage: this.getCacheStats()
      };
    }
  }

  /**
   * Get available filter options for holidays
   * @returns {Object} - Available filter options
   */
  getAvailableFilters() {
    return {
      festivalsOnly: {
        type: 'boolean',
        description: 'Filter to show only festivals and religious holidays'
      },
      nationalOnly: {
        type: 'boolean',
        description: 'Filter to show only national holidays'
      },
      categories: {
        type: 'array',
        options: ['public', 'optional', 'national', 'religious', 'company'],
        description: 'Filter by specific holiday categories'
      },
      importanceLevel: {
        type: 'string',
        options: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
        description: 'Filter by importance level'
      },
      state: {
        type: 'string',
        options: Object.keys(STATE_KEYWORDS),
        description: 'Filter by state/region'
      },
      excludeObservances: {
        type: 'boolean',
        description: 'Exclude observance days and awareness days'
      },
      paidOnly: {
        type: 'boolean',
        description: 'Show only paid holidays'
      },
      includeHolidays: {
        type: 'array',
        description: 'Specific holiday names to include'
      },
      excludeHolidays: {
        type: 'array',
        description: 'Specific holiday names to exclude'
      },
      companyPolicy: {
        type: 'string',
        options: Object.keys(COMPANY_POLICY_TEMPLATES),
        description: 'Apply predefined company policy template'
      },
      maxHolidays: {
        type: 'number',
        description: 'Maximum number of holidays to return'
      }
    };
  }

  /**
   * Get company policy templates
   * @returns {Object} - Available company policy templates
   */
  getCompanyPolicyTemplates() {
    return COMPANY_POLICY_TEMPLATES;
  }

  /**
   * Preview holidays with filters (without syncing to database)
   * @param {string} country - Country code
   * @param {number} year - Year
   * @param {Object} filters - Filter options
   * @returns {Object} - Preview result
   */
  async previewHolidays(country = 'IN', year = new Date().getFullYear(), filters = {}) {
    try {
      const holidayTypes = filters.holidayTypes || 'national,religious';
      const holidays = await this.getHolidays(country, year, holidayTypes, filters);
      
      return {
        success: true,
        data: {
          holidays,
          count: holidays.length,
          filters: filters,
          summary: this.generateHolidaySummary(holidays)
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to preview holidays',
        error: error.message
      };
    }
  }

  /**
   * Generate holiday summary statistics
   * @param {Array} holidays - Array of holidays
   * @returns {Object} - Summary statistics
   */
  generateHolidaySummary(holidays) {
    const summary = {
      total: holidays.length,
      byCategory: {},
      byImportance: {},
      byMonth: {},
      paidHolidays: 0,
      recurringHolidays: 0
    };

    holidays.forEach(holiday => {
      // Count by category
      const category = holiday.category || 'unknown';
      summary.byCategory[category] = (summary.byCategory[category] || 0) + 1;

      // Count by importance
      const importance = this.getHolidayImportanceLevel(holiday);
      summary.byImportance[importance] = (summary.byImportance[importance] || 0) + 1;

      // Count by month
      if (holiday.date) {
        const month = new Date(holiday.date).getMonth() + 1;
        summary.byMonth[month] = (summary.byMonth[month] || 0) + 1;
      }

      // Count paid holidays
      if (holiday.isPaid) {
        summary.paidHolidays++;
      }

      // Count recurring holidays
      if (holiday.type === 'RECURRING') {
        summary.recurringHolidays++;
      }
    });

    return summary;
  }

  /**
   * Get holiday importance level name
   * @param {Object} holiday - Holiday object
   * @returns {string} - Importance level name
   */
  getHolidayImportanceLevel(holiday) {
    const name = holiday.name.toLowerCase();
    
    if (IMPORTANCE_LEVELS.CRITICAL.some(h => name.includes(h))) return 'CRITICAL';
    if (IMPORTANCE_LEVELS.HIGH.some(h => name.includes(h))) return 'HIGH';
    if (IMPORTANCE_LEVELS.MEDIUM.some(h => name.includes(h))) return 'MEDIUM';
    if (IMPORTANCE_LEVELS.LOW.some(h => name.includes(h))) return 'LOW';
    
    return 'UNKNOWN';
  }
}

export default new CalendarificService();