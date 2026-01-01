/**
 * Lead Controller
 * Handles HTTP requests for lead management with simplified follow-up notes
 * Updated for restructured Lead model
 */

import leadService from '../../services/admin/lead.service.js';
import logger from '../../utils/logger.js';
import { AuditLog } from '../../models/index.js';

/**
 * Wrapper for consistent API responses
 */
const sendResponse = (res, success, message, data = null, statusCode = 200, pagination = null) => {
  const response = {
    success,
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

const leadController = {
  /**
   * Create new lead (HR & SuperAdmin)
   */
  createLead: async (req, res) => {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      // Extract employee ID from user object, allow null if no employee record
      const createdBy = req.user.employeeId || null;

      const result = await leadService.createLead(req.body, createdBy, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, result.message, result.data, 201);
    } catch (error) {
      logger.error("Controller: Create Lead Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get leads with filtering and pagination
   */
  getLeads: async (req, res) => {
    try {
      const result = await leadService.getLeads(req.query, req.query);

      if (!result.success) {
        const statusCode = result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Leads retrieved successfully", result.data.leads, 200, result.data.pagination);
    } catch (error) {
      logger.error("Controller: Get Leads Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get lead by ID
   */
  getLeadById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await leadService.getLeadById(id);

      if (!result.success) {
        const statusCode = result.message.includes('not found') ? 404 :
          result.message.includes('access') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, "Lead retrieved successfully", result.data);
    } catch (error) {
      logger.error("Controller: Get Lead By ID Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Update lead
   */
  updateLead: async (req, res) => {
    try {
      const { id } = req.params;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      // Extract employee ID from user object
      const updatedBy = req.user.employeeId || req.user.id;

      const result = await leadService.updateLead(id, req.body, updatedBy, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('not found') ? 404 :
          result.message.includes('access') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Update Lead Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Assign lead to employee (HR & SuperAdmin)
   */
  assignLead: async (req, res) => {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      // Extract employee ID from user object
      const updatedBy = req.user.employeeId || req.user.id;

      const result = await leadService.assignLead(id, assignedTo, updatedBy, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('not found') ? 404 :
          result.message.includes('Unauthorized') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Assign Lead Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Add follow-up note to lead
   */
  addFollowUpNote: async (req, res) => {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      if (!note || note.trim().length === 0) {
        return sendResponse(res, false, "Follow-up note is required", null, 400);
      }

      // Extract employee ID from user object
      const createdBy = req.user.employeeId || req.user.id;

      const result = await leadService.addFollowUpNote(id, note, createdBy, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('not found') ? 404 :
          result.message.includes('access') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Add Follow-up Note Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Update lead status
   */
  updateLeadStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, nextFollowUpDate } = req.body;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      // Extract employee ID from user object
      const updatedBy = req.user.employeeId || req.user.id;

      const result = await leadService.updateLeadStatus(id, status, nextFollowUpDate, updatedBy, metadata);

      if (!result.success) {
        const statusCode = result.message.includes('not found') ? 404 :
          result.message.includes('access') ? 403 : 400;
        return sendResponse(res, false, result.message, null, statusCode);
      }

      return sendResponse(res, true, result.message, result.data);
    } catch (error) {
      logger.error("Controller: Update Lead Status Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get leads assigned to current user
   */
  getMyLeads: async (req, res) => {
    try {
      const filters = {
        ...req.query,
        assignedTo: req.user.employeeId || req.user.id
      };

      const result = await leadService.getLeads(filters, req.query);

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      return sendResponse(res, true, "Your assigned leads retrieved successfully", result.data.leads, 200, result.data.pagination);
    } catch (error) {
      logger.error("Controller: Get My Leads Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get lead analytics (HR & SuperAdmin)
   */
  getLeadAnalytics: async (req, res) => {
    try {
      const result = await leadService.getLeadAnalytics();

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      return sendResponse(res, true, "Lead analytics retrieved successfully", result.data);
    } catch (error) {
      logger.error("Controller: Get Lead Analytics Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get lead stats (HR & SuperAdmin)
   */
  getLeadStats: async (req, res) => {
    try {
      const result = await leadService.getLeadStats();

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      return sendResponse(res, true, "Lead stats retrieved successfully", result.data);
    } catch (error) {
      logger.error("Controller: Get Lead Stats Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  }
};

export default leadController;