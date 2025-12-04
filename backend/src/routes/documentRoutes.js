import express from 'express';
import documentController from '../controllers/documentController.js';
import { authenticate } from '../middleware/authenticate.js';
import { checkPermission, checkAnyPermission } from '../middleware/checkPermission.js';
import { MODULES } from '../config/rolePermissions.js';
import { upload, handleUploadError } from '../middleware/upload.js';
import { scanUploadedFile } from '../utils/malwareScanner.js';
import {
  validateUploadDocument,
  validateGetDocuments,
} from '../validators/documentValidator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/employees/:id/documents
 * @desc    Upload a document for an employee
 * @access  HR Admin+, HR Manager (scope), Employee (own documents)
 * @permission MANAGE_DOCUMENTS or VIEW_DOCUMENTS (for own)
 */
router.post(
  '/employees/:id/documents',
  checkAnyPermission([
    MODULES.EMPLOYEE.MANAGE_DOCUMENTS,
    MODULES.EMPLOYEE.VIEW_DOCUMENTS,
  ]),
  upload.single('document'),
  handleUploadError,
  scanUploadedFile,
  validateUploadDocument,
  documentController.uploadDocument,
);

/**
 * @route   GET /api/employees/:id/documents
 * @desc    Get all documents for an employee
 * @access  HR Admin+, HR Manager (scope), Employee (own documents)
 * @permission MANAGE_DOCUMENTS or VIEW_DOCUMENTS
 */
router.get(
  '/employees/:id/documents',
  checkAnyPermission([
    MODULES.EMPLOYEE.MANAGE_DOCUMENTS,
    MODULES.EMPLOYEE.VIEW_DOCUMENTS,
  ]),
  validateGetDocuments,
  documentController.getEmployeeDocuments,
);

/**
 * @route   GET /api/employees/:id/documents/stats
 * @desc    Get document statistics for an employee
 * @access  HR Admin+, HR Manager (scope), Employee (own documents)
 * @permission MANAGE_DOCUMENTS or VIEW_DOCUMENTS
 */
router.get('/employees/:id/documents/stats',
  checkAnyPermission([
    MODULES.EMPLOYEE.MANAGE_DOCUMENTS,
    MODULES.EMPLOYEE.VIEW_DOCUMENTS,
  ]),
  documentController.getDocumentStats
);

/**
 * @route   GET /api/documents/:documentId
 * @desc    Download a document
 * @access  HR Admin+, HR Manager (scope), Employee (own documents)
 * @permission MANAGE_DOCUMENTS or VIEW_DOCUMENTS
 */
router.get('/documents/:documentId',
  checkAnyPermission([
    MODULES.EMPLOYEE.MANAGE_DOCUMENTS,
    MODULES.EMPLOYEE.VIEW_DOCUMENTS,
  ]),
  documentController.downloadDocument
);

/**
 * @route   DELETE /api/documents/:documentId
 * @desc    Delete a document
 * @access  HR Admin+, HR Manager (scope)
 * @permission MANAGE_DOCUMENTS
 */
router.delete(
  '/documents/:documentId',
  checkPermission(MODULES.EMPLOYEE.MANAGE_DOCUMENTS),
  documentController.deleteDocument,
);

export default router;
