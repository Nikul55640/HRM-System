/**
 * Controller Helper Utility
 * Standardizes response handling across all controllers
 * Eliminates duplicate response code patterns
 */

import ResponseFormatter from './ResponseFormatter.js';
import logger from './logger.js';

class ControllerHelper {
  /**
   * Send standardized response
   * @param {Object} res - Express response object
   * @param {Object} result - Service result object
   * @param {string} defaultSuccessMessage - Default success message
   */
  static sendResponse(res, result, defaultSuccessMessage = 'Operation completed successfully') {
    if (result.success) {
      const statusCode = result.statusCode || 200;
      const message = result.message || defaultSuccessMessage;
      
      if (result.pagination) {
        return res.status(statusCode).json(
          ResponseFormatter.paginated(
            result.data.records || result.data,
            result.pagination.total,
            result.pagination.page,
            result.pagination.limit,
            message
          )
        );
      }
      
      return res.status(statusCode).json(
        ResponseFormatter.success(result.data, message)
      );
    } else {
      const statusCode = result.statusCode || 400;
      return res.status(statusCode).json(
        ResponseFormatter.error(result.message, statusCode, result.error)
      );
    }
  }

  /**
   * Handle service errors with consistent logging and response
   * @param {Object} res - Express response object
   * @param {Error} error - Error object
   * @param {string} operation - Operation description for logging
   * @param {string} userMessage - User-friendly error message
   */
  static handleError(res, error, operation, userMessage = 'An error occurred') {
    logger.error(`${operation} error:`, error);
    
    // Handle specific error types
    if (error.statusCode) {
      return res.status(error.statusCode).json(
        ResponseFormatter.error(error.message, error.statusCode)
      );
    }
    
    if (error.name === 'ValidationError') {
      return res.status(422).json(
        ResponseFormatter.validationError(error.errors, 'Validation failed')
      );
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json(
        ResponseFormatter.error('Resource already exists', 409)
      );
    }
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json(
        ResponseFormatter.error('Invalid reference to related resource', 400)
      );
    }
    
    // Default server error
    return res.status(500).json(
      ResponseFormatter.serverError(userMessage, error.message)
    );
  }

  /**
   * Validate required parameters
   * @param {Object} params - Parameters to validate
   * @param {Array} required - Array of required parameter names
   * @returns {Object|null} Validation error object or null if valid
   */
  static validateRequired(params, required) {
    const missing = required.filter(param => 
      params[param] === undefined || params[param] === null || params[param] === ''
    );
    
    if (missing.length > 0) {
      return {
        success: false,
        message: 'Missing required parameters',
        statusCode: 400,
        error: {
          missingFields: missing
        }
      };
    }
    
    return null;
  }

  /**
   * Extract pagination parameters from query
   * @param {Object} query - Request query object
   * @returns {Object} Pagination parameters
   */
  static extractPagination(query) {
    return {
      page: parseInt(query.page) || 1,
      limit: Math.min(parseInt(query.limit) || 20, 100), // Max 100 items per page
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    };
  }

  /**
   * Extract filters from query (excluding pagination params)
   * @param {Object} query - Request query object
   * @returns {Object} Filter parameters
   */
  static extractFilters(query) {
    const { page, limit, sortBy, sortOrder, ...filters } = query;
    
    // Clean up empty values
    Object.keys(filters).forEach(key => {
      if (filters[key] === '' || filters[key] === 'undefined' || filters[key] === 'null') {
        delete filters[key];
      }
    });
    
    return filters;
  }

  /**
   * Create standardized controller method wrapper
   * @param {Function} serviceMethod - Service method to call
   * @param {string} operation - Operation name for logging
   * @param {string} successMessage - Success message
   */
  static createHandler(serviceMethod, operation, successMessage) {
    return async (req, res) => {
      try {
        const result = await serviceMethod(req, res);
        this.sendResponse(res, result, successMessage);
      } catch (error) {
        this.handleError(res, error, operation);
      }
    };
  }

  /**
   * Async wrapper for controller methods
   * @param {Function} fn - Async controller function
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Extract user metadata from request
   * @param {Object} req - Express request object
   * @returns {Object} User metadata
   */
  static extractMetadata(req) {
    return {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validate ID parameter
   * @param {string} id - ID to validate
   * @returns {Object|null} Validation error or null if valid
   */
  static validateId(id) {
    if (!id || isNaN(parseInt(id))) {
      return {
        success: false,
        message: 'Invalid ID parameter',
        statusCode: 400
      };
    }
    return null;
  }

  /**
   * Check if user has permission for resource
   * @param {Object} user - User object
   * @param {string} resource - Resource name
   * @param {string} action - Action name
   * @returns {boolean} Permission check result
   */
  static hasPermission(user, resource, action) {
    // This would integrate with your RBAC system
    // For now, return true - implement based on your permission system
    return true;
  }

  /**
   * Format success response for CRUD operations
   */
  static formatCrudResponse(operation, data, entityName) {
    const messages = {
      create: `${entityName} created successfully`,
      read: `${entityName} retrieved successfully`,
      update: `${entityName} updated successfully`,
      delete: `${entityName} deleted successfully`,
      list: `${entityName} list retrieved successfully`
    };

    return ResponseFormatter.success(data, messages[operation] || 'Operation completed');
  }
}

export default ControllerHelper;