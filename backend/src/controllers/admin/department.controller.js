import departmentService from "../../services/admin/department.service.js";
import logger from "../../utils/logger.js";

/**
 * Wrapper for consistent API responses
 */
const sendResponse = (res, success, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
  });
};

const departmentController = {
  createDepartment: async (req, res, next) => {
    try {
      const user = req.user;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const department = await departmentService.createDepartment(
        req.body,
        user,
        metadata
      );

      return sendResponse(
        res,
        true,
        "Department created successfully",
        department,
        201
      );
    } catch (error) {
      logger.error("Controller: Create Department Error", error);
      return sendResponse(
        res,
        false,
        error.message || "Failed to create department",
        { code: error.code },
        error.statusCode || 500
      );
    }
  },

  updateDepartment: async (req, res, next) => {
    try {
      const { id } = req.params;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const updated = await departmentService.updateDepartment(
        id,
        req.body,
        req.user,
        metadata
      );

      return sendResponse(
        res,
        true,
        "Department updated successfully",
        updated
      );
    } catch (error) {
      logger.error("Controller: Update Department Error", error);
      return sendResponse(
        res,
        false,
        error.message || "Failed to update department",
        { code: error.code },
        error.statusCode || 500
      );
    }
  },

  getDepartments: async (req, res, next) => {
    try {
      const data = await departmentService.getDepartments({}, req.query);
      return sendResponse(res, true, "Departments fetched successfully", data);
    } catch (error) {
      logger.error("Controller: Get Departments Error", error);
      return sendResponse(res, false, error.message || "Failed", {}, 500);
    }
  },

  getDepartmentById: async (req, res, next) => {
    try {
      const includeChildren = req.query.includeChildren === "true";
      const data = await departmentService.getDepartmentById(
        req.params.id,
        includeChildren
      );
      return sendResponse(res, true, "Department fetched successfully", data);
    } catch (error) {
      return sendResponse(
        res,
        false,
        error.message || "Failed",
        {},
        error.statusCode || 500
      );
    }
  },

  getDepartmentHierarchy: async (req, res, next) => {
    try {
      const root = req.query.root || null;
      const tree = await departmentService.getDepartmentHierarchy(root);
      return sendResponse(res, true, "Hierarchy fetched successfully", tree);
    } catch (error) {
      return sendResponse(res, false, error.message || "Failed", {}, 500);
    }
  },

  deleteDepartment: async (req, res, next) => {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const deleted = await departmentService.deleteDepartment(
        req.params.id,
        req.user,
        metadata
      );

      return sendResponse(
        res,
        true,
        "Department deleted successfully",
        deleted
      );
    } catch (error) {
      return sendResponse(
        res,
        false,
        error.message || "Failed",
        {},
        error.statusCode || 500
      );
    }
  },

  searchDepartments: async (req, res, next) => {
    try {
      const list = await departmentService.searchDepartments(req.query.q || "");
      return sendResponse(res, true, "Search results loaded", list);
    } catch (error) {
      return sendResponse(
        res,
        false,
        error.message || "Search failed",
        {},
        500
      );
    }
  },
};

export default departmentController;
