/**
 * Calendarific Controller
 * Handles Calendarific API integration for holiday management
 */

import CalendarificService from '../../services/external/calendarific.service.js';
import logger from '../../utils/logger.js';
import { validationResult } from 'express-validator';

/**
 * Test Calendarific API connection
 */
export const testConnection = async (req, res) => {
  console.log('🔧 [CONTROLLER] testConnection endpoint hit');
  console.log('🔧 [CONTROLLER] Request user:', req.user?.email);
  console.log('🔧 [CONTROLLER] Request role:', req.user?.role);
  
  try {
    console.log('🔧 [CONTROLLER] Calling CalendarificService.testConnection()...');
    const result = await CalendarificService.testConnection();
    
    console.log('🔧 [CONTROLLER] Service returned:', result);
    console.log('🔧 [CONTROLLER] Success:', result.success);
    console.log('🔧 [CONTROLLER] Message:', result.message);
    console.log('🔧 [CONTROLLER] Holiday count:', result.holidayCount);
    
    const response = {
      success: result.success,
      message: result.message,
      data: result.success ? { holidayCount: result.holidayCount } : null
    };
    
    console.log('🔧 [CONTROLLER] Sending response:', response);
    res.json(response);
    
  } catch (error) {
    console.error('🔧 [CONTROLLER] Error caught:', error);
    console.error('🔧 [CONTROLLER] Error message:', error.message);
    console.error('🔧 [CONTROLLER] Error stack:', error.stack);
    
    logger.error('Error testing Calendarific connection:', error);
    
    const errorResponse = {
      success: false,
      message: 'Failed to test API connection',
      error: error.message
    };
    
    console.log('🔧 [CONTROLLER] Sending error response:', errorResponse);
    res.status(500).json(errorResponse);
  }
};

/**
 * Get supported countries from Calendarific
 */
export const getSupportedCountries = async (req, res) => {
  try {
    const countries = await CalendarificService.getSupportedCountries();
    
    res.json({
      success: true,
      data: countries,
      message: `Found ${countries.length} supported countries`
    });
    
  } catch (error) {
    logger.error('Error fetching supported countries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supported countries',
      error: error.message
    });
  }
};

/**
 * Preview holidays from Calendarific (without saving to database)
 */
export const previewHolidays = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      country = 'IN', 
      year = new Date().getFullYear(), 
      type = 'national' 
    } = req.query;

    const holidays = await CalendarificService.getHolidays(country, parseInt(year), type);
    
    res.json({
      success: true,
      data: {
        country,
        year: parseInt(year),
        type,
        holidays,
        count: holidays.length
      },
      message: `Found ${holidays.length} holidays for ${country} in ${year}`
    });
    
  } catch (error) {
    logger.error('Error previewing holidays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to preview holidays',
      error: error.message
    });
  }
};

/**
 * Batch preview holidays - Multiple types in ONE API call (OPTIMIZED)
 */
export const batchPreviewHolidays = async (req, res) => {
  try {
    const { 
      country = 'IN', 
      year = new Date().getFullYear(), 
      types = 'national,religious' // Comma-separated types
    } = req.query;

    const typeArray = types.split(',').map(t => t.trim());
    
    logger.info(`Batch preview for ${country} ${year} - Types: ${typeArray.join(', ')}`);

    // Use optimized batch fetch
    const result = await CalendarificService.batchFetchHolidays(country, parseInt(year), typeArray);

    res.json({
      success: true,
      data: {
        country,
        year: parseInt(year),
        types: typeArray,
        holidays: result.holidays,
        count: result.holidays.length,
        breakdown: result.breakdown.map(r => ({
          type: r.type,
          count: r.count,
          success: r.success
        })),
        apiUsage: result.stats
      },
      message: `Found ${result.holidays.length} holidays across ${typeArray.length} categories. API calls today: ${result.stats.apiCallsToday}/${result.stats.remainingCalls + result.stats.apiCallsToday}`
    });
    
  } catch (error) {
    logger.error('Error in batch preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to batch preview holidays',
      error: error.message
    });
  }
};

/**
 * Sync holidays from Calendarific to database
 */
export const syncHolidays = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      country = 'IN', 
      year = new Date().getFullYear(),
      overwriteExisting = false,
      dryRun = false,
      holidayTypes = 'national,religious'
    } = req.body;

    logger.info(`Holiday sync requested by user ${req.user.id}`, {
      country,
      year,
      overwriteExisting,
      dryRun,
      holidayTypes
    });

    const result = await CalendarificService.syncHolidays(country, parseInt(year), {
      overwriteExisting,
      dryRun,
      holidayTypes
    });
    
    res.json({
      success: true,
      data: result,
      message: dryRun ? 
        `Dry run completed. Would sync ${result.stats.created + result.stats.updated} holidays` :
        result.message
    });
    
  } catch (error) {
    logger.error('Error syncing holidays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync holidays',
      error: error.message
    });
  }
};

/**
 * Get sync history/status
 */
export const getSyncStatus = async (req, res) => {
  try {
    // This could be enhanced to track sync history in a separate table
    // For now, we'll return basic API status
    const connectionTest = await CalendarificService.testConnection();
    
    res.json({
      success: true,
      data: {
        apiStatus: connectionTest.success ? 'connected' : 'disconnected',
        apiMessage: connectionTest.message,
        lastSync: null, // Could be implemented with a sync history table
        availableCountries: connectionTest.success ? 'Available via API' : 'Unavailable'
      }
    });
    
  } catch (error) {
    logger.error('Error getting sync status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sync status',
      error: error.message
    });
  }
};

/**
 * Get holiday statistics from Calendarific
 */
export const getHolidayStats = async (req, res) => {
  try {
    const { 
      country = 'IN', 
      year = new Date().getFullYear() 
    } = req.query;

    // Get holidays for different types
    const [nationalHolidays, religiousHolidays, localHolidays] = await Promise.all([
      CalendarificService.getHolidays(country, parseInt(year), 'national').catch(() => []),
      CalendarificService.getHolidays(country, parseInt(year), 'religious').catch(() => []),
      CalendarificService.getHolidays(country, parseInt(year), 'local').catch(() => [])
    ]);

    const stats = {
      country,
      year: parseInt(year),
      breakdown: {
        national: nationalHolidays.length,
        religious: religiousHolidays.length,
        local: localHolidays.length,
        total: nationalHolidays.length + religiousHolidays.length + localHolidays.length
      },
      monthlyDistribution: {}
    };

    // Calculate monthly distribution
    const allHolidays = [...nationalHolidays, ...religiousHolidays, ...localHolidays];
    allHolidays.forEach(holiday => {
      const date = new Date(holiday.date || `${year}-${holiday.recurringDate}`);
      const month = date.getMonth() + 1;
      stats.monthlyDistribution[month] = (stats.monthlyDistribution[month] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: stats,
      message: `Holiday statistics for ${country} in ${year}`
    });
    
  } catch (error) {
    logger.error('Error getting holiday stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get holiday statistics',
      error: error.message
    });
  }
};

/**
 * Get available filter options
 */
export const getAvailableFilters = async (req, res) => {
  try {
    const filters = CalendarificService.getAvailableFilters();
    const templates = CalendarificService.getCompanyPolicyTemplates();
    
    res.json({
      success: true,
      data: {
        filters,
        companyPolicyTemplates: templates
      },
      message: 'Available filter options retrieved successfully'
    });
    
  } catch (error) {
    logger.error('Error getting available filters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available filters',
      error: error.message
    });
  }
};

/**
 * Preview holidays with advanced filters (OPTIMIZED)
 */
export const previewHolidaysWithFilters = async (req, res) => {
  try {
    const { 
      country = 'IN', 
      year = new Date().getFullYear(),
      holidayTypes = 'national,religious',
      ...filters
    } = req.body;

    logger.info(`Preview holidays with filters for ${country} ${year}`, { filters });

    // Use optimized preview method that tracks API usage
    const result = await CalendarificService.previewHolidaysOptimized(country, parseInt(year), {
      holidayTypes,
      ...filters
    });
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json({
      success: true,
      data: {
        country,
        year: parseInt(year),
        appliedFilters: filters,
        ...result.data,
        apiUsage: result.apiUsage // Show API usage stats
      },
      message: `Preview generated with ${result.data.count} holidays. ${result.apiUsage?.message || ''}`
    });
    
  } catch (error) {
    logger.error('Error previewing holidays with filters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to preview holidays with filters',
      error: error.message
    });
  }
};

/**
 * Sync holidays with advanced filters
 */
export const syncHolidaysWithFilters = async (req, res) => {
  try {
    const { 
      country = 'IN', 
      year = new Date().getFullYear(),
      overwriteExisting = false,
      dryRun = false,
      holidayTypes = 'national,religious',
      ...filters
    } = req.body;

    logger.info(`Holiday sync with filters requested by user ${req.user.id}`, {
      country,
      year,
      overwriteExisting,
      dryRun,
      holidayTypes,
      filters
    });

    const result = await CalendarificService.syncHolidays(country, parseInt(year), {
      overwriteExisting,
      dryRun,
      holidayTypes,
      filters
    });
    
    res.json({
      success: true,
      data: {
        ...result,
        appliedFilters: filters
      },
      message: dryRun ? 
        `Dry run completed with filters. Would sync ${result.stats.created + result.stats.updated} holidays` :
        `${result.message} with applied filters`
    });
    
  } catch (error) {
    logger.error('Error syncing holidays with filters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync holidays with filters',
      error: error.message
    });
  }
};

/**
 * Get festival holidays only
 */
export const getFestivalHolidays = async (req, res) => {
  try {
    const { 
      country = 'IN', 
      year = new Date().getFullYear(),
      holidayTypes = 'national,religious'
    } = req.query;

    const filters = { festivalsOnly: true };
    
    const result = await CalendarificService.previewHolidays(country, parseInt(year), {
      holidayTypes,
      ...filters
    });
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json({
      success: true,
      data: {
        country,
        year: parseInt(year),
        festivals: result.data.holidays,
        count: result.data.count,
        summary: result.data.summary
      },
      message: `Found ${result.data.count} festivals for ${country} in ${year}`
    });
    
  } catch (error) {
    logger.error('Error getting festival holidays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get festival holidays',
      error: error.message
    });
  }
};

/**
 * Get national holidays only
 */
export const getNationalHolidays = async (req, res) => {
  try {
    const { 
      country = 'IN', 
      year = new Date().getFullYear()
    } = req.query;

    const filters = { nationalOnly: true };
    
    const result = await CalendarificService.previewHolidays(country, parseInt(year), {
      holidayTypes: 'national',
      ...filters
    });
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json({
      success: true,
      data: {
        country,
        year: parseInt(year),
        nationalHolidays: result.data.holidays,
        count: result.data.count,
        summary: result.data.summary
      },
      message: `Found ${result.data.count} national holidays for ${country} in ${year}`
    });
    
  } catch (error) {
    logger.error('Error getting national holidays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get national holidays',
      error: error.message
    });
  }
};

/**
 * Get API usage statistics and cache status
 */
export const getApiUsageStats = async (req, res) => {
  try {
    const stats = CalendarificService.getCacheStats();
    
    // Clean expired cache entries
    const cleanedEntries = CalendarificService.cleanExpiredCache();
    
    res.json({
      success: true,
      data: {
        ...stats,
        cleanedEntries,
        recommendations: {
          status: stats.remainingCalls > 100 ? 'healthy' : 'warning',
          message: stats.remainingCalls > 100 ? 
            'API usage is within healthy limits' : 
            'API usage is high, consider using more filters to reduce calls',
          cacheEfficiency: stats.cacheHitRate > 70 ? 'excellent' : 
                          stats.cacheHitRate > 50 ? 'good' : 'needs improvement'
        }
      },
      message: `API Usage: ${stats.apiCallsToday}/${stats.apiCallsToday + stats.remainingCalls} calls used today. Cache hit rate: ${stats.cacheHitRate}%`
    });
    
  } catch (error) {
    logger.error('Error getting API usage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get API usage statistics',
      error: error.message
    });
  }
};

/**
 * Apply company policy template
 */
export const applyCompanyPolicy = async (req, res) => {
  try {
    const { 
      country = 'IN', 
      year = new Date().getFullYear(),
      policyTemplate,
      dryRun = true
    } = req.body;

    if (!policyTemplate) {
      return res.status(400).json({
        success: false,
        message: 'Policy template is required'
      });
    }

    const filters = { companyPolicy: policyTemplate };
    
    if (dryRun) {
      // Preview only
      const result = await CalendarificService.previewHolidays(country, parseInt(year), {
        holidayTypes: 'national,religious',
        ...filters
      });
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json({
        success: true,
        data: {
          country,
          year: parseInt(year),
          policyTemplate,
          holidays: result.data.holidays,
          count: result.data.count,
          summary: result.data.summary,
          dryRun: true
        },
        message: `Policy preview: ${result.data.count} holidays would be selected`
      });
    } else {
      // Actually sync
      const result = await CalendarificService.syncHolidays(country, parseInt(year), {
        overwriteExisting: false,
        dryRun: false,
        holidayTypes: 'national,religious',
        filters
      });
      
      res.json({
        success: true,
        data: {
          ...result,
          policyTemplate,
          appliedFilters: filters
        },
        message: `Company policy applied: ${result.message}`
      });
    }
    
  } catch (error) {
    logger.error('Error applying company policy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply company policy',
      error: error.message
    });
  }
};

/**
 * Bulk sync holidays for multiple years
 */
export const bulkSyncHolidays = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      country = 'IN',
      startYear = new Date().getFullYear(),
      endYear = new Date().getFullYear() + 1,
      overwriteExisting = false,
      holidayTypes = 'national,religious'
    } = req.body;

    if (endYear - startYear > 5) {
      return res.status(400).json({
        success: false,
        message: 'Cannot sync more than 5 years at once'
      });
    }

    logger.info(`Bulk holiday sync requested by user ${req.user.id}`, {
      country,
      startYear,
      endYear,
      overwriteExisting,
      holidayTypes
    });

    const results = [];
    let totalStats = { total: 0, created: 0, updated: 0, skipped: 0 };

    for (let year = startYear; year <= endYear; year++) {
      try {
        const result = await CalendarificService.syncHolidays(country, year, {
          overwriteExisting,
          dryRun: false,
          holidayTypes
        });
        
        results.push({
          year,
          success: true,
          ...result
        });

        // Aggregate stats
        Object.keys(totalStats).forEach(key => {
          totalStats[key] += result.stats[key] || 0;
        });
        
      } catch (error) {
        logger.error(`Error syncing holidays for year ${year}:`, error);
        results.push({
          year,
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        results,
        totalStats,
        yearsProcessed: endYear - startYear + 1,
        successfulYears: results.filter(r => r.success).length
      },
      message: `Bulk sync completed for ${country} (${startYear}-${endYear})`
    });
    
  } catch (error) {
    logger.error('Error in bulk sync holidays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk sync holidays',
      error: error.message
    });
  }
};

/**
 * Sync holidays using a holiday selection template
 * This applies the template's selected holidays to filter Calendarific results
 */
export const syncWithTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { 
      year = new Date().getFullYear(),
      overwriteExisting = false,
      dryRun = false
    } = req.body;

    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: 'Template ID is required'
      });
    }

    logger.info(`Template-based sync requested by user ${req.user.id}`, {
      templateId,
      year,
      overwriteExisting,
      dryRun
    });

    // Import the service here to avoid circular dependency
    const { default: holidaySelectionTemplateService } = await import('../../services/admin/holidaySelectionTemplate.service.js');

    // Get the template
    const templateResult = await holidaySelectionTemplateService.getTemplateById(templateId);
    
    if (!templateResult.success) {
      return res.status(404).json({
        success: false,
        message: 'Holiday selection template not found'
      });
    }

    const template = templateResult.data;

    // Fetch holidays from Calendarific using template configuration
    const result = await CalendarificService.batchFetchHolidays(
      template.country, 
      parseInt(year), 
      template.holidayTypes
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch holidays from Calendarific',
        error: result.error
      });
    }

    // Apply template selection to filter holidays
    const applyResult = await holidaySelectionTemplateService.applyTemplateToHolidays(
      templateId,
      result.holidays
    );

    if (!applyResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to apply template selection',
        error: applyResult.error
      });
    }

    const filteredHolidays = applyResult.data.holidays;

    if (dryRun) {
      // Return preview without syncing
      return res.json({
        success: true,
        data: {
          template: template,
          year: parseInt(year),
          originalCount: applyResult.data.originalCount,
          selectedCount: applyResult.data.filteredCount,
          holidays: filteredHolidays,
          skippedHolidays: applyResult.data.skippedHolidays,
          dryRun: true
        },
        message: `Template preview: ${filteredHolidays.length} holidays selected from ${applyResult.data.originalCount} available holidays`
      });
    }

    // Sync the filtered holidays to database
    const syncResult = await CalendarificService.syncFilteredHolidays(
      template.country,
      parseInt(year),
      filteredHolidays,
      { overwriteExisting }
    );

    res.json({
      success: true,
      data: {
        template: template,
        year: parseInt(year),
        originalCount: applyResult.data.originalCount,
        selectedCount: applyResult.data.filteredCount,
        syncStats: syncResult.stats,
        holidays: filteredHolidays
      },
      message: `Template sync completed: ${syncResult.stats.created} holidays created, ${syncResult.stats.updated} updated, ${syncResult.stats.skipped} skipped`
    });
    
  } catch (error) {
    logger.error('Error in template-based sync:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync holidays with template',
      error: error.message
    });
  }
};