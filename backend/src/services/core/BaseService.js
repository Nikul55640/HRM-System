/**
 * Base Service Class
 * Provides common CRUD operations to reduce code duplication across services
 * 
 * Usage:
 * class HolidayService extends BaseService {
 *   constructor() {
 *     super(Holiday, 'Holiday', {
 *       includes: [{ model: User, as: 'creator' }],
 *       searchFields: ['name', 'description']
 *     });
 *   }
 * }
 */

import { Op } from 'sequelize';
import logger from '../../utils/logger.js';
import { AuditLog } from '../../models/index.js';

class BaseService {
  constructor(model, entityName, options = {}) {
    this.model = model;
    this.entityName = entityName;
    this.defaultIncludes = options.includes || [];
    this.searchFields = options.searchFields || [];
    this.defaultOrder = options.defaultOrder || [['createdAt', 'DESC']];
  }

  /**
   * Get all records with filtering and pagination
   */
  async getAll(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20, search, sortBy, sortOrder = 'DESC', ...otherFilters } = { ...filters, ...pagination };
      const offset = (page - 1) * limit;

      const whereClause = {};

      // Apply search across configured fields
      if (search && this.searchFields.length > 0) {
        whereClause[Op.or] = this.searchFields.map(field => ({
          [field]: { [Op.iLike]: `%${search}%` }
        }));
      }

      // Apply other filters
      Object.keys(otherFilters).forEach(key => {
        if (otherFilters[key] !== undefined && otherFilters[key] !== null) {
          whereClause[key] = otherFilters[key];
        }
      });

      const order = sortBy ? [[sortBy, sortOrder]] : this.defaultOrder;

      const { count, rows } = await this.model.findAndCountAll({
        where: whereClause,
        include: this.defaultIncludes,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order,
        distinct: true
      });

      return {
        success: true,
        data: {
          records: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      };
    } catch (error) {
      logger.error(`Error fetching ${this.entityName} records:`, error);
      return {
        success: false,
        message: `Failed to fetch ${this.entityName} records`,
        error: error.message
      };
    }
  }

  /**
   * Get single record by ID
   */
  async getById(id, includes = null) {
    try {
      const record = await this.model.findByPk(id, {
        include: includes || this.defaultIncludes
      });

      if (!record) {
        return {
          success: false,
          message: `${this.entityName} not found`,
          statusCode: 404
        };
      }

      return {
        success: true,
        data: record
      };
    } catch (error) {
      logger.error(`Error fetching ${this.entityName} by ID:`, error);
      return {
        success: false,
        message: `Failed to fetch ${this.entityName}`,
        error: error.message
      };
    }
  }

  /**
   * Create new record with audit logging
   */
  async create(data, user, metadata = {}) {
    try {
      const record = await this.model.create(data);

      // Log audit trail
      if (user) {
        await this.logAudit('CREATE', record.id, user, {
          field: this.entityName.toLowerCase(),
          oldValue: null,
          newValue: this.getAuditData(record)
        }, metadata);
      }

      // Return with includes
      const createdRecord = await this.model.findByPk(record.id, {
        include: this.defaultIncludes
      });

      return {
        success: true,
        data: createdRecord,
        message: `${this.entityName} created successfully`
      };
    } catch (error) {
      logger.error(`Error creating ${this.entityName}:`, error);
      return {
        success: false,
        message: `Failed to create ${this.entityName}`,
        error: error.message
      };
    }
  }

  /**
   * Update record with audit logging
   */
  async update(id, data, user, metadata = {}) {
    try {
      const record = await this.model.findByPk(id);
      
      if (!record) {
        return {
          success: false,
          message: `${this.entityName} not found`,
          statusCode: 404
        };
      }

      const oldData = this.getAuditData(record);
      await record.update(data);
      const newData = this.getAuditData(record);

      // Log audit trail
      if (user) {
        await this.logAudit('UPDATE', id, user, {
          field: this.entityName.toLowerCase(),
          oldValue: oldData,
          newValue: newData
        }, metadata);
      }

      // Return with includes
      const updatedRecord = await this.model.findByPk(id, {
        include: this.defaultIncludes
      });

      return {
        success: true,
        data: updatedRecord,
        message: `${this.entityName} updated successfully`
      };
    } catch (error) {
      logger.error(`Error updating ${this.entityName}:`, error);
      return {
        success: false,
        message: `Failed to update ${this.entityName}`,
        error: error.message
      };
    }
  }

  /**
   * Delete record with audit logging
   */
  async delete(id, user, metadata = {}) {
    try {
      const record = await this.model.findByPk(id);
      
      if (!record) {
        return {
          success: false,
          message: `${this.entityName} not found`,
          statusCode: 404
        };
      }

      const oldData = this.getAuditData(record);
      await record.destroy();

      // Log audit trail
      if (user) {
        await this.logAudit('DELETE', id, user, {
          field: this.entityName.toLowerCase(),
          oldValue: oldData,
          newValue: null
        }, metadata);
      }

      return {
        success: true,
        message: `${this.entityName} deleted successfully`
      };
    } catch (error) {
      logger.error(`Error deleting ${this.entityName}:`, error);
      return {
        success: false,
        message: `Failed to delete ${this.entityName}`,
        error: error.message
      };
    }
  }

  /**
   * Soft delete (set isActive = false)
   */
  async softDelete(id, user, metadata = {}) {
    return this.update(id, { isActive: false }, user, metadata);
  }

  /**
   * Log audit action
   */
  async logAudit(action, entityId, user, changes, metadata = {}) {
    try {
      await AuditLog.logAction({
        action,
        entityType: this.entityName,
        entityId,
        userId: user.id,
        userRole: user.role,
        changes: [changes],
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent
      });
    } catch (error) {
      logger.error('Error logging audit:', error);
      // Don't throw - audit logging failure shouldn't break the main operation
    }
  }

  /**
   * Get data for audit logging (override in subclasses for custom fields)
   */
  getAuditData(record) {
    return {
      id: record.id,
      name: record.name || record.title || `${this.entityName} ${record.id}`
    };
  }

  /**
   * Bulk operations
   */
  async bulkCreate(dataArray, user, metadata = {}) {
    try {
      const records = await this.model.bulkCreate(dataArray);
      
      // Log bulk audit
      if (user) {
        await this.logAudit('BULK_CREATE', null, user, {
          field: `${this.entityName.toLowerCase()}_bulk`,
          oldValue: null,
          newValue: { count: records.length }
        }, metadata);
      }

      return {
        success: true,
        data: records,
        message: `${records.length} ${this.entityName} records created successfully`
      };
    } catch (error) {
      logger.error(`Error bulk creating ${this.entityName}:`, error);
      return {
        success: false,
        message: `Failed to bulk create ${this.entityName} records`,
        error: error.message
      };
    }
  }

  /**
   * Check if record exists
   */
  async exists(id) {
    try {
      const count = await this.model.count({ where: { id } });
      return count > 0;
    } catch (error) {
      logger.error(`Error checking ${this.entityName} existence:`, error);
      return false;
    }
  }

  /**
   * Get record count with filters
   */
  async getCount(filters = {}) {
    try {
      const whereClause = {};
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          whereClause[key] = filters[key];
        }
      });

      const count = await this.model.count({ where: whereClause });
      return { success: true, count };
    } catch (error) {
      logger.error(`Error counting ${this.entityName} records:`, error);
      return { success: false, error: error.message };
    }
  }
}

export default BaseService;