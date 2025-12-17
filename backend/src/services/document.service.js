import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { Document, Employee } from '../models/sequelize/index.js';
import {
  encryptFile,
  decryptFile,
  generateEncryptionKey,
} from '../utils/encryption.js';
import { documentsDir, cleanupTempFiles } from '../middleware/upload.js';
import auditService from './audit/audit.service.js';

const unlink = promisify(fs.unlink);

/**
 * Upload a document for an employee
 */
const uploadDocument = async (fileData, employeeId, documentType, uploadedBy) => {
  let tempFilePath = null;
  let encryptedFilePath = null;

  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) throw new Error('Employee not found');

    const encryptionKey = generateEncryptionKey();

    tempFilePath = fileData.path;
    const originalName = fileData.originalname;
    const fileSize = fileData.size;
    const mimeType = fileData.mimetype;

    const fileExtension = path.extname(originalName).substring(1).toUpperCase();
    const uniqueFilename = `${employeeId}-${Date.now()}-${Math.random().toString(36).substring(7)}.enc`;
    encryptedFilePath = path.join(documentsDir, uniqueFilename);

    await encryptFile(tempFilePath, encryptedFilePath, encryptionKey);

    const document = await Document.create({
      employeeId,
      fileName: uniqueFilename,
      originalName,
      fileType: fileExtension,
      fileSize,
      mimeType,
      documentType,
      storagePath: encryptedFilePath,
      encryptionKey,
      uploadedBy,
    });

    await cleanupTempFiles(tempFilePath);

    await auditService.logAction({
      action: 'CREATE',
      entityType: 'Document',
      entityId: document._id,
      userId: uploadedBy,
      changes: [
        {
          field: 'document',
          oldValue: null,
          newValue: { fileName: originalName, documentType, employeeId },
        },
      ],
    });

    return document;
  } catch (error) {
    if (tempFilePath) await cleanupTempFiles(tempFilePath);
    if (encryptedFilePath && fs.existsSync(encryptedFilePath)) {
      await cleanupTempFiles(encryptedFilePath);
    }

    throw new Error(`Failed to upload document: ${error.message}`);
  }
};

/**
 * Get all documents for an employee
 */
const getDocumentsByEmployee = async (employeeId, options = {}) => {
  try {
    const { page = 1, limit = 10, documentType } = options;

    const query = { employeeId };
    if (documentType) query.documentType = documentType;

    const skip = (page - 1) * limit;

    const documents = await Document.find(query)
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'email role')
      .populate('employeeId', 'personalInfo.firstName personalInfo.lastName employeeId');

    const total = await Document.countDocuments(query);

    return {
      documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Failed to get documents: ${error.message}`);
  }
};

/**
 * Get a single document by ID
 */
const getDocumentById = async (documentId) => {
  try {
    const document = await Document.findById(documentId)
      .select('+encryptionKey +storagePath')
      .populate('uploadedBy', 'email role')
      .populate('employeeId', 'personalInfo.firstName personalInfo.lastName employeeId');

    if (!document) throw new Error('Document not found');

    return document;
  } catch (error) {
    throw new Error(`Failed to get document: ${error.message}`);
  }
};

/**
 * Download a document (decrypt and return file path)
 */
const downloadDocument = async (documentId, userId) => {
  let decryptedFilePath = null;

  try {
    const document = await Document.findById(documentId)
      .select('+encryptionKey +storagePath')
      .populate('employeeId', 'personalInfo.firstName personalInfo.lastName');

    if (!document) throw new Error('Document not found');

    if (!fs.existsSync(document.storagePath)) {
      throw new Error('Document file not found on server');
    }

    const tempDir = path.join(documentsDir, 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const decryptedFilename = `decrypted-${Date.now()}-${document.originalName}`;
    decryptedFilePath = path.join(tempDir, decryptedFilename);

    await decryptFile(document.storagePath, decryptedFilePath, document.encryptionKey);

    await auditService.logAction({
      action: 'VIEW',
      entityType: 'Document',
      entityId: document._id,
      userId,
      changes: [
        {
          field: 'download',
          oldValue: null,
          newValue: { fileName: document.originalName, timestamp: new Date() },
        },
      ],
    });

    return {
      filePath: decryptedFilePath,
      originalName: document.originalName,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
      document,
    };
  } catch (error) {
    if (decryptedFilePath && fs.existsSync(decryptedFilePath)) {
      await cleanupTempFiles(decryptedFilePath);
    }

    throw new Error(`Failed to download document: ${error.message}`);
  }
};

/**
 * Delete a document
 */
const deleteDocument = async (documentId, userId) => {
  try {
    const document = await Document.findById(documentId).select('+storagePath');
    if (!document) throw new Error('Document not found');

    const documentInfo = {
      fileName: document.originalName,
      documentType: document.documentType,
      employeeId: document.employeeId,
    };

    if (fs.existsSync(document.storagePath)) {
      await unlink(document.storagePath);
    }

    await Document.findByIdAndDelete(documentId);

    await auditService.logAction({
      action: 'DELETE',
      entityType: 'Document',
      entityId: documentId,
      userId,
      changes: [
        { field: 'document', oldValue: documentInfo, newValue: null },
      ],
    });

    return { success: true, message: 'Document deleted successfully' };
  } catch (error) {
    throw new Error(`Failed to delete document: ${error.message}`);
  }
};

/**
 * Get document stats
 */
const getDocumentStats = async (employeeId) => {
  try {
    return await Document.getEmployeeDocumentStats(employeeId);
  } catch (error) {
    throw new Error(`Failed to get document statistics: ${error.message}`);
  }
};

/**
 * Check document access
 */
const canAccessDocument = async (documentId, userId, userRole, assignedDepartments = []) => {
  try {
    const document = await Document.findById(documentId).populate('employeeId');

    if (!document) return false;

    if (['SuperAdmin', 'HR Administrator'].includes(userRole)) return true;

    if (
      userRole === 'HR Manager' &&
      assignedDepartments.length > 0 &&
      document.employeeId?.jobInfo?.department &&
      assignedDepartments.some(
        (dept) => dept.toString() === document.employeeId.jobInfo.department.toString()
      )
    ) {
      return true;
    }

    if (document.employeeId?.userId?.toString() === userId.toString()) {
      return true;
    }

    if (document.canAccess(userId)) return true;

    return false;
  } catch (error) {
    throw new Error(`Failed to check document access: ${error.message}`);
  }
};

/**
 * FINAL EXPORT (your requested style)
 */
export default {
  uploadDocument,
  getDocumentsByEmployee,
  getDocumentById,
  downloadDocument,
  deleteDocument,
  getDocumentStats,
  canAccessDocument,
};
