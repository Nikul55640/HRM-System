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
 * Batch preview holidays - Multiple types in ONE API call
 * SAVES API CREDITS by batching requests
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

    // Fetch all types (cache will prevent duplicate API calls)
    const results = await Promise.all(
      typeArray.map(async (type) => {
        try {
          const holidays = await CalendarificService.getHolidays(country, parseInt(year), type);
          return {
            type,
            holidays,
            count: holidays.length,
            success: true
          };
        } catch (error) {
          logger.error(`Error fetching ${type} holidays:`, error);
          return {
            type,
            holidays: [],
            count: 0,
            success: false,
            error: error.message
          };
        }
      })
    );

    // Combine all holidays
    const allHolidays = [];
    let totalCount = 0;
    
    results.forEach(result => {
      if (result.success) {
        result.holidays.forEach(holiday => {
          allHolidays.push({
            ...holiday,
            sourceType: result.type
          });
        });
        totalCount += result.count;
      }
    });

    // Sort by date
    allHolidays.sort((a, b) => {
      const dateA = new Date(a.date || `${year}-${a.recurringDate}`);
      const dateB = new Date(b.date || `${year}-${b.recurringDate}`);
      return dateA - dateB;
    });

    res.json({
      success: true,
      data: {
        country,
        year: parseInt(year),
        types: typeArray,
        holidays: allHolidays,
        count: totalCount,
        breakdown: results.map(r => ({
          type: r.type,
          count: r.count,
          success: r.success
        }))
      },
      message: `Found ${totalCount} holidays across ${typeArray.length} categories`
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