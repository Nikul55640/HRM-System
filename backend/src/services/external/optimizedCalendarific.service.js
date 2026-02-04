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
      return Array.isArray(cachedData) ? cachedData : [];
    }

    // Check API limits
    this.checkApiLimits();

    // Create promise for this request
    const requestPromise = this.makeApiCall(country, year, type);
    this.requestQueue.set(rawCacheKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // Ensure result is always an array
      const holidays = Array.isArray(result) ? result : [];
      
      // Cache the raw result
      this.setCache(rawCacheKey, holidays);
      
      return holidays;
    } catch (error) {
      logger.error(`Error fetching raw holidays for ${rawCacheKey}:`, error);
      return []; // Return empty array on error
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

      const holidays = response.data.response?.holidays || [];
      const transformedHolidays = this.transformCalendarificHolidays(holidays);
      
      logger.info(`✅ Fetched and transformed ${transformedHolidays.length} holidays`);
      
      return Array.isArray(transformedHolidays) ? transformedHolidays : [];
      
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
      throw new Error('Calendarific API key is not configured. Please add CALENDARIFIC_API_KEY to your environment variables.');
    }

    const filteredCacheKey = this.getFilteredCacheKey(country, year, type, filters);
    
    // Check filtered cache first
    const cachedFiltered = this.getFromCache(filteredCacheKey);
    if (cachedFiltered) {
      return Array.isArray(cachedFiltered) ? cachedFiltered : [];
    }

    // Get raw data (this will use cache if available)
    const rawHolidays = await this.fetchRawHolidays(country, year, type);
    
    // Apply filters to raw data
    let filteredHolidays = Array.isArray(rawHolidays) ? rawHolidays : [];
    if (Object.keys(filters).length > 0) {
      filteredHolidays = this.applyAdvancedFilters(filteredHolidays, filters);
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
    
    try {
      // Fetch all types in parallel (each will use cache if available)
      const promises = types.map(async (type) => {
        try {
          const holidays = await this.fetchRawHolidays(country, year, type);
          return {
            type,
            holidays: holidays || [],
            success: true,
            count: (holidays || []).length
          };
        } catch (error) {
          logger.error(`Error fetching ${type} holidays:`, error);
          return {
            type,
            holidays: [],
            success: false,
            count: 0,
            error: error.message
          };
        }
      });
      
      const results = await Promise.all(promises);
      
      // Combine all results
      const allHolidays = [];
      const breakdown = [];
      
      results.forEach((result) => {
        breakdown.push({
          type: result.type,
          count: result.count,
          success: result.success,
          error: result.error
        });
        
        if (result.success && result.holidays) {
          result.holidays.forEach(holiday => {
            allHolidays.push({
              ...holiday,
              sourceType: result.type
            });
          });
        }
      });
      
      // Remove duplicates based on name and date
      const uniqueHolidays = this.removeDuplicateHolidays(allHolidays);
      
      logger.info(`✅ Batch fetch completed: ${uniqueHolidays.length} unique holidays`);
      
      return {
        success: true,
        holidays: uniqueHolidays,
        breakdown: breakdown,
        stats: {
          apiCallsToday: this.apiCallCount,
          remainingCalls: this.dailyLimit - this.apiCallCount,
          totalHolidays: uniqueHolidays.length,
          typesProcessed: types.length
        }
      };
    } catch (error) {
      logger.error('Error in batch fetch holidays:', error);
      return {
        success: false,
        holidays: [],
        breakdown: [],
        stats: {
          apiCallsToday: this.apiCallCount,
          remainingCalls: this.dailyLimit - this.apiCallCount,
          totalHolidays: 0,
          typesProcessed: 0
        },
        error: error.message
      };
    }
  }

  /**
   * Remove duplicate holidays
   */
  removeDuplicateHolidays(holidays) {
    if (!Array.isArray(holidays)) {
      logger.warn('removeDuplicateHolidays received non-array input:', typeof holidays);
      return [];
    }

    const seen = new Set();
    return holidays.filter(holiday => {
      if (!holiday || !holiday.name) {
        logger.warn('Skipping invalid holiday in deduplication:', holiday);
        return false;
      }

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
    if (!Array.isArray(calendarificHolidays)) {
      logger.warn('transformCalendarificHolidays received non-array input:', typeof calendarificHolidays);
      return [];
    }

    return calendarificHolidays.map(holiday => {
      try {
        if (!holiday || !holiday.date || !holiday.name) {
          logger.warn('Skipping invalid holiday:', holiday);
          return null;
        }

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
      } catch (error) {
        logger.error('Error transforming holiday:', error, holiday);
        return null;
      }
    }).filter(holiday => holiday !== null); // Remove any null entries
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          message: 'Calendarific API key is not configured. Please add CALENDARIFIC_API_KEY to your environment variables.'
        };
      }

      logger.info('Testing Calendarific API connection...');

      // Test with a simple API call for current year national holidays
      const currentYear = new Date().getFullYear();
      const result = await this.getHolidays('IN', currentYear, 'national');
      
      return {
        success: true,
        message: 'Calendarific API connection successful',
        holidayCount: result.length,
        apiCallsUsed: this.apiCallCount,
        remainingCalls: this.dailyLimit - this.apiCallCount
      };
    } catch (error) {
      logger.error('Calendarific connection test failed:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.message.includes('401')) {
        errorMessage = 'Invalid API key. Please check your CALENDARIFIC_API_KEY configuration.';
      } else if (error.message.includes('403')) {
        errorMessage = 'API access forbidden. Your API key may have insufficient permissions.';
      } else if (error.message.includes('429')) {
        errorMessage = 'API rate limit exceeded. Please try again later.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your internet connection.';
      }
      
      return {
        success: false,
        message: `Connection failed: ${errorMessage}`,
        error: error.message
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
      let createdCount = 0;
      let updatedCount = 0;
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
              isActive: true,
              syncedFromCalendarific: true,
              lastSyncedAt: new Date()
            });
            updatedCount++;
          } else {
            await Holiday.create({
              name: holiday.name,
              date: holiday.date,
              description: holiday.description,
              type: holiday.type || 'public',
              isActive: true,
              syncedFromCalendarific: true,
              lastSyncedAt: new Date()
            });
            createdCount++;
          }
        } catch (error) {
          logger.error(`Error syncing holiday ${holiday.name}:`, error);
          skippedCount++;
        }
      }

      return {
        success: true,
        message: `Synced ${createdCount + updatedCount} holidays (${createdCount} created, ${updatedCount} updated), skipped ${skippedCount}`,
        stats: {
          created: createdCount,
          updated: updatedCount,
          skipped: skippedCount,
          total: uniqueHolidays.length
        },
        data: {
          synced: createdCount + updatedCount,
          created: createdCount,
          updated: updatedCount,
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
      
      let createdCount = 0;
      let updatedCount = 0;
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
              isActive: true,
              syncedFromCalendarific: true,
              lastSyncedAt: new Date()
            });
            updatedCount++;
          } else {
            await Holiday.create({
              name: holiday.name,
              date: holiday.date,
              description: holiday.description,
              type: holiday.type || 'public',
              isActive: true,
              syncedFromCalendarific: true,
              lastSyncedAt: new Date()
            });
            createdCount++;
          }
        } catch (error) {
          logger.error(`Error syncing holiday ${holiday.name}:`, error);
          skippedCount++;
        }
      }

      return {
        success: true,
        message: `Synced ${createdCount + updatedCount} holidays (${createdCount} created, ${updatedCount} updated), skipped ${skippedCount}`,
        stats: {
          created: createdCount,
          updated: updatedCount,
          skipped: skippedCount,
          total: selectedHolidays.length
        },
        data: {
          synced: createdCount + updatedCount,
          created: createdCount,
          updated: updatedCount,
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

  /**
   * Check if a holiday is recurring (based on lunar calendar or similar)
   */
  isRecurringHoliday(holiday) {
    // Check if the holiday is based on lunar calendar or has recurring patterns
    const recurringKeywords = ['lunar', 'movable', 'variable', 'eid', 'diwali', 'holi', 'easter'];
    const name = holiday.name.toLowerCase();
    return recurringKeywords.some(keyword => name.includes(keyword));
  }

  /**
   * Get recurring date format (MM-DD)
   */
  getRecurringDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  }

  /**
   * Map Calendarific category to our system
   */
  mapCalendarificCategory(types) {
    if (!types || !Array.isArray(types)) return 'public';
    
    if (types.includes('national')) return 'national';
    if (types.includes('religious')) return 'religious';
    if (types.includes('local')) return 'local';
    if (types.includes('observance')) return 'observance';
    
    return 'public';
  }

  /**
   * Determine if holiday is paid
   */
  isPaidHoliday(types) {
    if (!types || !Array.isArray(types)) return false;
    
    // National and religious holidays are typically paid
    return types.includes('national') || types.includes('religious');
  }

  /**
   * Get holiday color based on type
   */
  getHolidayColor(types) {
    if (!types || !Array.isArray(types)) return '#3B82F6';
    
    if (types.includes('national')) return '#DC2626'; // Red for national
    if (types.includes('religious')) return '#7C3AED'; // Purple for religious
    if (types.includes('local')) return '#059669'; // Green for local
    if (types.includes('observance')) return '#6B7280'; // Gray for observance
    
    return '#3B82F6'; // Blue default
  }

  /**
   * Get location scope
   */
  getLocationScope(locations) {
    if (!locations || locations === 'All') return 'national';
    if (Array.isArray(locations) && locations.length > 5) return 'national';
    return 'regional';
  }

  /**
   * Generate holiday summary
   */
  generateHolidaySummary(holidays) {
    const summary = {
      total: holidays.length,
      byType: {},
      byMonth: {},
      paid: 0,
      unpaid: 0
    };

    holidays.forEach(holiday => {
      // Count by type
      const type = holiday.category || 'public';
      summary.byType[type] = (summary.byType[type] || 0) + 1;

      // Count by month
      const date = new Date(holiday.date || `2024-${holiday.recurringDate}`);
      const month = date.getMonth() + 1;
      summary.byMonth[month] = (summary.byMonth[month] || 0) + 1;

      // Count paid/unpaid
      if (holiday.isPaid) {
        summary.paid++;
      } else {
        summary.unpaid++;
      }
    });

    return summary;
  }

  /**
   * Filter festivals only
   */
  filterFestivals(holidays) {
    return holidays.filter(holiday => {
      const name = holiday.name.toLowerCase();
      return FESTIVAL_KEYWORDS.some(keyword => name.includes(keyword));
    });
  }

  /**
   * Filter national holidays only
   */
  filterNationalHolidays(holidays) {
    return holidays.filter(holiday => {
      const name = holiday.name.toLowerCase();
      return NATIONAL_KEYWORDS.some(keyword => name.includes(keyword)) ||
             holiday.category === 'national';
    });
  }

  /**
   * Filter by categories
   */
  filterByCategories(holidays, categories) {
    return holidays.filter(holiday => 
      categories.includes(holiday.category || 'public')
    );
  }

  /**
   * Filter by importance level
   */
  filterByImportance(holidays, level) {
    return holidays.filter(holiday => {
      const name = holiday.name.toLowerCase();
      const keywords = IMPORTANCE_LEVELS[level.toUpperCase()] || [];
      return keywords.some(keyword => name.includes(keyword));
    });
  }

  /**
   * Filter by state
   */
  filterByState(holidays, state) {
    return holidays.filter(holiday => {
      if (!holiday.calendarificData?.states) return true;
      return holiday.calendarificData.states.includes(state);
    });
  }

  /**
   * Exclude observances
   */
  excludeObservances(holidays) {
    return holidays.filter(holiday => {
      const name = holiday.name.toLowerCase();
      return !OBSERVANCE_KEYWORDS.some(keyword => name.includes(keyword));
    });
  }

  /**
   * Filter by specific holidays
   */
  filterBySpecificHolidays(holidays, includeList) {
    return holidays.filter(holiday => 
      includeList.some(name => 
        holiday.name.toLowerCase().includes(name.toLowerCase())
      )
    );
  }

  /**
   * Exclude specific holidays
   */
  excludeSpecificHolidays(holidays, excludeList) {
    return holidays.filter(holiday => 
      !excludeList.some(name => 
        holiday.name.toLowerCase().includes(name.toLowerCase())
      )
    );
  }

  /**
   * Apply company policy
   */
  applyCompanyPolicy(holidays, policyName) {
    const policy = COMPANY_POLICY_TEMPLATES[policyName.toUpperCase()];
    if (!policy) return holidays;

    let filtered = holidays;

    // Apply max holidays limit
    if (policy.maxHolidays) {
      filtered = this.limitHolidays(filtered, policy.maxHolidays);
    }

    // Apply type filters
    if (policy.includeTypes) {
      filtered = this.filterByCategories(filtered, policy.includeTypes);
    }

    // Exclude observances if specified
    if (policy.excludeObservances) {
      filtered = this.excludeObservances(filtered);
    }

    return filtered;
  }

  /**
   * Limit number of holidays
   */
  limitHolidays(holidays, maxCount) {
    // Sort by importance (national first, then religious, then others)
    const sorted = holidays.sort((a, b) => {
      const order = { national: 0, religious: 1, local: 2, observance: 3, public: 4 };
      return (order[a.category] || 5) - (order[b.category] || 5);
    });

    return sorted.slice(0, maxCount);
  }

  // ... (include all other helper methods)
}

export default new OptimizedCalendarificService();