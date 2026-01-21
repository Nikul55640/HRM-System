/**
 * Response Formatter Utility
 * Centralized response formatting to eliminate duplication across 30+ service functions
 * Replaces 100+ lines of duplicate response wrapper code
 */

class ResponseFormatter {
    /**
     * Format successful response
     * @param {any} data - Response data
     * @param {string} message - Success message
     * @param {Object} pagination - Optional pagination info
     * @returns {Object} Formatted success response
     */
    static success(data = null, message = "Operation successful", pagination = null) {
        const response = {
            success: true,
            message,
            data
        };

        if (pagination) {
            response.pagination = pagination;
        }

        return response;
    }

    /**
     * Format error response
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     * @param {any} error - Optional error details
     * @returns {Object} Formatted error response
     */
    static error(message, statusCode = 400, error = null) {
        const response = {
            success: false,
            message,
            statusCode
        };

        if (error) {
            response.error = error;
        }

        return response;
    }

    /**
     * Format paginated response
     * @param {Array} data - Array of items
     * @param {number} total - Total count
     * @param {number} page - Current page
     * @param {number} limit - Items per page
     * @param {string} message - Success message
     * @returns {Object} Formatted paginated response
     */
    static paginated(data, total, page, limit, message = "Data retrieved successfully") {
        return {
            success: true,
            message,
            data,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };
    }

    /**
     * Format list response (for backward compatibility)
     * @param {Array} items - Array of items
     * @param {Object} pagination - Pagination info
     * @param {string} message - Success message
     * @returns {Object} Formatted list response
     */
    static list(items, pagination, message = "List retrieved successfully") {
        return {
            success: true,
            message,
            data: items,
            pagination
        };
    }

    /**
     * Format created response
     * @param {any} data - Created item
     * @param {string} message - Success message
     * @returns {Object} Formatted creation response
     */
    static created(data, message = "Resource created successfully") {
        return {
            success: true,
            message,
            data,
            statusCode: 201
        };
    }

    /**
     * Format updated response
     * @param {any} data - Updated item
     * @param {string} message - Success message
     * @returns {Object} Formatted update response
     */
    static updated(data, message = "Resource updated successfully") {
        return {
            success: true,
            message,
            data
        };
    }

    /**
     * Format deleted response
     * @param {string} message - Success message
     * @returns {Object} Formatted deletion response
     */
    static deleted(message = "Resource deleted successfully") {
        return {
            success: true,
            message,
            data: null
        };
    }

    /**
     * Format validation error response
     * @param {Array|Object} errors - Validation errors
     * @param {string} message - Error message
     * @returns {Object} Formatted validation error response
     */
    static validationError(errors, message = "Validation failed") {
        return {
            success: false,
            message,
            statusCode: 422,
            errors
        };
    }

    /**
     * Format unauthorized response
     * @param {string} message - Error message
     * @returns {Object} Formatted unauthorized response
     */
    static unauthorized(message = "Unauthorized access") {
        return {
            success: false,
            message,
            statusCode: 401
        };
    }

    /**
     * Format forbidden response
     * @param {string} message - Error message
     * @returns {Object} Formatted forbidden response
     */
    static forbidden(message = "Access forbidden") {
        return {
            success: false,
            message,
            statusCode: 403
        };
    }

    /**
     * Format not found response
     * @param {string} message - Error message
     * @returns {Object} Formatted not found response
     */
    static notFound(message = "Resource not found") {
        return {
            success: false,
            message,
            statusCode: 404
        };
    }

    /**
     * Format server error response
     * @param {string} message - Error message
     * @param {any} error - Optional error details
     * @returns {Object} Formatted server error response
     */
    static serverError(message = "Internal server error", error = null) {
        return {
            success: false,
            message,
            statusCode: 500,
            error: process.env.NODE_ENV === 'development' ? error : undefined
        };
    }
}

export default ResponseFormatter;