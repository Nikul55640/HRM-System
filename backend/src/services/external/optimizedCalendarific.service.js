/**
 * Optimized Calendarific API Service
 * Minimizes API calls through smart caching and batch processing
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

class OptimizedCalendarificService {
  constructor() {
    this.baseURL = 'https://calendarific.com/api/v2';
    this.apiKey = process.env.CALENDARIFIC_API_KEY;
    
    // Enhanced caching system
    this.cache = new Map();
    this.CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days for holidays (they don't change often)
    this.requestQueue = new Map(); // Prevent duplicate simultaneous requests
    this.rateLimitDelay = 1000; // 1 second between API calls
    this.lastApiCall = 0;
    
    // API usage tracking
    this.apiCallCount = 0;
    this.dailyLimit = 1000; // Calendarific free tier limit
    
    if (!this.apiKey) {
      logger.warn('Calendarific API key not found. Holiday sync will be disabled.');
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
   * Check if cached data is still valid
   */
  isCacheValid(cacheEntry) {
    if (!cacheEntry) return false;
    const now = Date.now();
    return (now - cacheEntry.timestamp) < this.CACHE_TTL;
  }

  /**
   * Get data from cache
   */
  getFromCache(cacheKey) {
    const cached = this.cache.get(cacheKey);
    
    if (this.isCacheValid(cached)) {
      logger.info(`✅ Cache HIT for ${cacheKey} - API call saved`);
      return cached.data;
    }
    
    if (cached) {
      logger.info(`❌ Cache EXPIRED for ${cacheKey}`);
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  /**
   * Store data in cache
   */
  setCache(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    logger.info(`💾 Cached data for ${cacheKey}`);
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
    if (this.apiCallCount >= this.dailyLimit) {
      throw new Error(`Daily API limit reached (${this.dailyLimit} calls). Please try again tomorrow.`);
    }
  }

  /**
   * Fetch raw holidays from Calendarific API (ONE call per country/year/type)
   */
  async fetchRawHolidays(country, year, type) {
    const rawCacheKey = this.getRawCacheKey(country, year, type);
    
    // Check if we're already fetching this data
    if (this.requestQueue.has(rawCacheKey)) {
      logger.info(`⏳ Request already in progress for ${rawCacheKey}, waiting...`);
      return await this.requestQueue.get(rawCacheKey);
    }

    // Check cache first
    const cachedData = this.getFromCache(rawCacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Check API limits
    this.checkApiLimits();

    // Create promise for this request
    const requestPromise = this.makeApiCall(country, year, type);
    this.requestQueue.set(rawCacheKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // Cache the raw result
      this.setCache(rawCacheKey, result);
      
      return result;
    } finally {
      // Remove from queue when done
      this.requestQueue.delete(rawCacheKey);
    }
  }

  /**
   * Make the actual API call
   */
  async makeApiCall(country, year, type) {
    await this.enforceRateLimit();
    
    logger.info(`🌐 Making API call to Calendarific: ${country}-${year}-${type}`);
    
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
      logger.info(`📊 API call #${this.apiCallCount} completed successfully`);

      if (response.data.meta.code !== 200) {
        throw new Error(`Calendarific API error: ${response.data.meta.error_detail || 'Unknown error'}`);
      }

      const holidays = response.data.response.holidays || [];
      const transformedHolidays = this.transformCalendarificHolidays(holidays);
      
      logger.info(`✅ Fetched and transformed ${transformedHolidays.length} holidays`);
      
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
   * Get holidays with smart caching and filtering
   */
  async getHolidays(country = 'IN', year = new Date().getFullYear(), type = 'national', filters = {}) {
    if (!this.apiKey) {
      throw new Error('Calendarific API key is not configured');
    }

    const filteredCacheKey = this.getFilteredCacheKey(country, year, type, filters);
    
    // Check filtered cache first
    const cachedFiltered = this.getFromCache(filteredCacheKey);
    if (cachedFiltered) {
      return cachedFiltered;
    }

    // Get raw data (this will use cache if available)
    const rawHolidays = await this.fetchRawHolidays(country, year, type);
    
    // Apply filters to raw data
    let filteredHolidays = rawHolidays;
    if (Object.keys(filters).length > 0) {
      filteredHolidays = this.applyAdvancedFilters(rawHolidays, filters);
    }
    
    // Cache the filtered result
    this.setCache(filteredCacheKey, filteredHolidays);
    
    return filteredHolidays;
  }

  /**
   * Batch fetch multiple holiday types with ONE API call each
   */
  async batchFetchHolidays(country, year, types = ['national', 'religious']) {
    logger.info(`🔄 Batch fetching holidays for ${country}-${year}: ${types.join(', ')}`);
    
    // Fetch all types in parallel (each will use cache if available)
    const promises = types.map(type => this.fetchRawHolidays(country, year, type));
    const results = await Promise.all(promises);
    
    // Combine all results
    const allHolidays = [];
    results.forEach((holidays, index) => {
      holidays.forEach(holiday => {
        allHolidays.push({
          ...holiday,
          sourceType: types[index]
        });
      });
    });
    
    // Remove duplicates based on name and date
    const uniqueHolidays = this.removeDuplicateHolidays(allHolidays);
    
    logger.info(`✅ Batch fetch completed: ${uniqueHolidays.length} unique holidays`);
    
    return uniqueHolidays;
  }

  /**
   * Remove duplicate holidays
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
   * Optimized preview that minimizes API calls
   */
  async previewHolidays(country = 'IN', year = new Date().getFullYear(), filters = {}) {
    try {
      // Determine which types we need based on filters
      const requiredTypes = this.determineRequiredTypes(filters);
      
      logger.info(`🎯 Preview optimization: only fetching types: ${requiredTypes.join(', ')}`);
      
      // Batch fetch only required types
      const holidays = await this.batchFetchHolidays(country, year, requiredTypes);
      
      // Apply filters
      let filteredHolidays = holidays;
      if (Object.keys(filters).length > 0) {
        filteredHolidays = this.applyAdvancedFilters(holidays, filters);
      }
      
      return {
        success: true,
        data: {
          holidays: filteredHolidays,
          count: filteredHolidays.length,
          filters: filters,
          summary: this.generateHolidaySummary(filteredHolidays),
          apiCallsSaved: this.getApiCallsSaved(country, year, requiredTypes)
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
   * Determine which API types we need based on filters
   */
  determineRequiredTypes(filters) {
    const types = [];
    
    // If no specific filters, get both national and religious
    if (!filters.festivalsOnly && !filters.nationalOnly && !filters.categories) {
      return ['national', 'religious'];
    }
    
    // If festivals only, we need religious
    if (filters.festivalsOnly) {
      types.push('religious');
    }
    
    // If national only, we need national
    if (filters.nationalOnly) {
      types.push('national');
    }
    
    // If specific categories requested
    if (filters.categories) {
      if (filters.categories.includes('national')) types.push('national');
      if (filters.categories.includes('religious')) types.push('religious');
      if (filters.categories.includes('public')) types.push('national', 'religious');
    }
    
    // Default to national if nothing specified
    return types.length > 0 ? [...new Set(types)] : ['national'];
  }

  /**
   * Get API calls saved by caching
   */
  getApiCallsSaved(country, year, types) {
    let saved = 0;
    types.forEach(type => {
      const rawCacheKey = this.getRawCacheKey(country, year, type);
      if (this.cache.has(rawCacheKey) && this.isCacheValid(this.cache.get(rawCacheKey))) {
        saved++;
      }
    });
    return saved;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const stats = {
      totalEntries: this.cache.size,
      validEntries: 0,
      expiredEntries: 0,
      apiCallsToday: this.apiCallCount,
      remainingCalls: this.dailyLimit - this.apiCallCount
    };
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isCacheValid(entry)) {
        stats.validEntries++;
      } else {
        stats.expiredEntries++;
      }
    }
    
    return stats;
  }

  /**
   * Clean expired cache entries
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

  // ... (include all the existing filter methods from the original service)
  
  /**
   * Apply advanced filters to holidays
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

  // ... (include all other filter methods from original service)
  
  /**
   * Transform Calendarific holiday data to our Holiday model format
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
   * Test API connection
   */
  async testConnection() {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          message: 'Calendarific API key is not configured'
        };
      }

      // Test with a simple API call
      const result = await this.getHolidays('IN', new Date().getFullYear(), 'national');
      
      return {
        success: true,
        message: 'Calendarific API connection successful',
        holidayCount: result.length
      };
    } catch (error) {
      logger.error('Calendarific connection test failed:', error);
      return {
        success: false,
        message: `Connection failed: ${error.message}`
      };
    }
  }

  /**
   * Get supported countries (mock implementation)
   */
  async getSupportedCountries() {
    // This would typically come from Calendarific API
    // For now, return common countries
    return [
      { code: 'IN', name: 'India' },
      { code: 'US', name: 'United States' },
      { code: 'GB', name: 'United Kingdom' },
      { code: 'CA', name: 'Canada' },
      { code: 'AU', name: 'Australia' }
    ];
  }

  /**
   * Sync holidays to database
   */
  async syncHolidays(country, year, options = {}) {
    try {
      const { overwriteExisting = false, dryRun = false, holidayTypes = 'national,religious' } = options;
      
      // Get holidays from API
      const types = holidayTypes.split(',').map(t => t.trim());
      const allHolidays = [];
      
      for (const type of types) {
        const holidays = await this.getHolidays(country, year, type);
        allHolidays.push(...holidays);
      }

      // Remove duplicates
      const uniqueHolidays = this.removeDuplicateHolidays(allHolidays);

      if (dryRun) {
        return {
          success: true,
          message: 'Dry run completed',
          data: {
            holidaysFound: uniqueHolidays.length,
            holidays: uniqueHolidays
          }
        };
      }

      // Sync to database
      let syncedCount = 0;
      let skippedCount = 0;

      for (const holiday of uniqueHolidays) {
        try {
          const existingHoliday = await Holiday.findOne({
            where: {
              name: holiday.name,
              date: holiday.date
            }
          });

          if (existingHoliday && !overwriteExisting) {
            skippedCount++;
            continue;
          }

          if (existingHoliday && overwriteExisting) {
            await existingHoliday.update({
              description: holiday.description,
              type: holiday.type || 'public',
              isActive: true
            });
          } else {
            await Holiday.create({
              name: holiday.name,
              date: holiday.date,
              description: holiday.description,
              type: holiday.type || 'public',
              isActive: true
            });
          }
          
          syncedCount++;
        } catch (error) {
          logger.error(`Error syncing holiday ${holiday.name}:`, error);
        }
      }

      return {
        success: true,
        message: `Synced ${syncedCount} holidays, skipped ${skippedCount}`,
        data: {
          synced: syncedCount,
          skipped: skippedCount,
          total: uniqueHolidays.length
        }
      };

    } catch (error) {
      logger.error('Error syncing holidays:', error);
      return {
        success: false,
        message: `Sync failed: ${error.message}`
      };
    }
  }

  /**
   * Preview holidays with optimized API usage
   */
  async previewHolidaysOptimized(country, year, filters = {}) {
    return this.previewHolidays(country, year, filters);
  }

  /**
   * Get available filters
   */
  getAvailableFilters() {
    return {
      holidayTypes: ['national', 'religious', 'local', 'observance'],
      categories: ['public', 'bank', 'school', 'optional'],
      importanceLevels: ['high', 'medium', 'low'],
      regions: ['all', 'north', 'south', 'east', 'west']
    };
  }

  /**
   * Get company policy templates
   */
  getCompanyPolicyTemplates() {
    return {
      TECH_STARTUP: {
        name: 'Tech Startup',
        description: 'Minimal holidays, flexible work culture',
        maxHolidays: 12,
        includeTypes: ['national'],
        excludeObservances: true
      },
      TRADITIONAL_CORPORATE: {
        name: 'Traditional Corporate',
        description: 'Standard corporate holiday calendar',
        maxHolidays: 20,
        includeTypes: ['national', 'religious'],
        excludeObservances: false
      },
      GOVERNMENT_OFFICE: {
        name: 'Government Office',
        description: 'All official government holidays',
        maxHolidays: 30,
        includeTypes: ['national', 'religious', 'local'],
        excludeObservances: false
      },
      MANUFACTURING: {
        name: 'Manufacturing',
        description: 'Essential holidays only',
        maxHolidays: 15,
        includeTypes: ['national'],
        excludeObservances: true
      }
    };
  }

  /**
   * Sync filtered holidays
   */
  async syncFilteredHolidays(country, year, selectedHolidays, options = {}) {
    try {
      const { overwriteExisting = false } = options;
      
      let syncedCount = 0;
      let skippedCount = 0;

      for (const holiday of selectedHolidays) {
        try {
          const existingHoliday = await Holiday.findOne({
            where: {
              name: holiday.name,
              date: holiday.date
            }
          });

          if (existingHoliday && !overwriteExisting) {
            skippedCount++;
            continue;
          }

          if (existingHoliday && overwriteExisting) {
            await existingHoliday.update({
              description: holiday.description,
              type: holiday.type || 'public',
              isActive: true
            });
          } else {
            await Holiday.create({
              name: holiday.name,
              date: holiday.date,
              description: holiday.description,
              type: holiday.type || 'public',
              isActive: true
            });
          }
          
          syncedCount++;
        } catch (error) {
          logger.error(`Error syncing holiday ${holiday.name}:`, error);
        }
      }

      return {
        success: true,
        message: `Synced ${syncedCount} holidays, skipped ${skippedCount}`,
        data: {
          synced: syncedCount,
          skipped: skippedCount,
          total: selectedHolidays.length
        }
      };

    } catch (error) {
      logger.error('Error syncing filtered holidays:', error);
      return {
        success: false,
        message: `Sync failed: ${error.message}`
      };
    }
  }

  // ... (include all other helper methods)
}

export default new OptimizedCalendarificService();