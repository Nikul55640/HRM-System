import fs from "fs";
import documentService from "../services/document.service.js";
import { cleanupTempFiles } from "../middleware/upload.js";

/**
 * Upload a document for an employee
 * POST /api/employees/:id/documents
 */
const uploadDocument = async (req, res, next) => {
  try {
    const { id: employeeId } = req.params;
    const { documentType } = req.body;
    const uploadedBy = req.user.id;

    // Validate file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: "NO_FILE",
          message: "No file uploaded",
        },
      });
    }

    // Validate document type
    if (!documentType) {
      // Clean up uploaded file
      await cleanupTempFiles(req.file.path);
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_DOCUMENT_TYPE",
          message: "Document type is required",
        },
      });
    }

    // Upload document
    const document = await documentService.uploadDocument(
      req.file,
      employeeId,
      documentType,
      uploadedBy
    );

    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully",
    });
  } catch (error) {
    // Clean up file on error
    if (req.file) {
      await cleanupTempFiles(req.file.path);
    }
    next(error);
  }
};

/**
 * Get all documents for an employee
 * GET /api/employees/:id/documents
 */
const getEmployeeDocuments = async (req, res, next) => {
  try {
    const { id: employeeId } = req.params;
    const { page, limit, documentType } = req.query;

    const result = await documentService.getDocumentsByEmployee(employeeId, {
      page,
      limit,
      documentType,
    });

    res.status(200).json({
      success: true,
      data: result.documents,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download a document
 * GET /api/documents/:documentId
 */
const downloadDocument = async (req, res, next) => {
  let decryptedFilePath = null;

  try {
    const { documentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const assignedDepartments = req.user.assignedDepartments || [];

    // Check if user can access this document
    const canAccess = await documentService.canAccessDocument(
      documentId,
      userId,
      userRole,
      assignedDepartments
    );

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        error: {
          code: "ACCESS_DENIED",
          message: "You do not have permission to access this document",
        },
      });
    }

    // Download (decrypt) document
    const result = await documentService.downloadDocument(documentId, userId);
    decryptedFilePath = result.filePath;

    // Set headers for file download
    res.setHeader(
      "Content-Type",
      result.mimeType || "application/octet-stream"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.originalName}"`
    );
    res.setHeader("Content-Length", result.fileSize);

    // Stream the file

    const fileStream = fs.createReadStream(decryptedFilePath);

    fileStream.on("error", (error) => {
      console.error("File stream error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: {
            code: "STREAM_ERROR",
            message: "Error streaming file",
          },
        });
      }
    });

    fileStream.on("end", async () => {
      // Clean up decrypted file after streaming
      await cleanupTempFiles(decryptedFilePath);
    });

    fileStream.pipe(res);
  } catch (error) {
    // Clean up decrypted file on error
    if (decryptedFilePath) {
      await cleanupTempFiles(decryptedFilePath);
    }
    next(error);
  }
};

/**
 * Delete a document
 * DELETE /api/documents/:documentId
 */
const deleteDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const assignedDepartments = req.user.assignedDepartments || [];

    // Check if user can access this document
    const canAccess = await documentService.canAccessDocument(
      documentId,
      userId,
      userRole,
      assignedDepartments
    );

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        error: {
          code: "ACCESS_DENIED",
          message: "You do not have permission to delete this document",
        },
      });
    }

    // Delete document
    const result = await documentService.deleteDocument(documentId, userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get document statistics for an employee
 * GET /api/employees/:id/documents/stats
 */
const getDocumentStats = async (req, res, next) => {
  try {
    const { id: employeeId } = req.params;

    const stats = await documentService.getDocumentStats(employeeId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  uploadDocument,
  getEmployeeDocuments,
  downloadDocument,
  deleteDocument,
  getDocumentStats,
};
