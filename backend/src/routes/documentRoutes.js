import express from 'express';
import documentController from '../controllers/documentController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
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
 */
router.post(
  '/employees/:id/documents',
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
 */
router.get(
  '/employees/:id/documents',
  validateGetDocuments,
  documentController.getEmployeeDocuments,
);

/**
 * @route   GET /api/employees/:id/documents/stats
 * @desc    Get document statistics for an employee
 * @access  HR Admin+, HR Manager (scope), Employee (own documents)
 */
router.get('/employees/:id/documents/stats', documentController.getDocumentStats);

/**
 * @route   GET /api/documents/:documentId
 * @desc    Download a document
 * @access  HR Admin+, HR Manager (scope), Employee (own documents)
 */
router.get('/documents/:documentId', documentController.downloadDocument);

/**
 * @route   DELETE /api/documents/:documentId
 * @desc    Delete a document
 * @access  HR Admin+, HR Manager (scope)
 */
router.delete(
  '/documents/:documentId',
  authorize('SuperAdmin', 'HR Administrator', 'HR Manager'),
  documentController.deleteDocument,
);

export default router;
