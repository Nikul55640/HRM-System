import api from './api';
import { toast } from 'react-toastify';

const documentService = {
  // Upload document for an employee
  uploadDocument: async (employeeId, formData) => {
    try {
      console.log('📄 [DOCUMENT] Uploading document for employee:', employeeId);
      const response = await api.post(`/employees/${employeeId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ [DOCUMENT] Document uploaded:', response.data);
      toast.success('Document uploaded successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [DOCUMENT] Upload failed:', error);
      toast.error(error.message || 'Failed to upload document');
      throw error;
    }
  },

  // Get all documents for an employee
  getEmployeeDocuments: async (employeeId) => {
    try {
      console.log('📄 [DOCUMENT] Fetching documents for employee:', employeeId);
      const response = await api.get(`/employees/${employeeId}/documents`);
      console.log('✅ [DOCUMENT] Documents fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [DOCUMENT] Failed to fetch documents:', error);
      toast.error(error.message || 'Failed to load documents');
      throw error;
    }
  },

  // Download/view document
  downloadDocument: async (documentId) => {
    try {
      console.log('⬇️ [DOCUMENT] Downloading document:', documentId);
      const response = await api.get(`/documents/${documentId}`, {
        responseType: 'blob',
      });
      console.log('✅ [DOCUMENT] Document downloaded');
      return response.data;
    } catch (error) {
      console.error('❌ [DOCUMENT] Download failed:', error);
      toast.error(error.message || 'Failed to download document');
      throw error;
    }
  },

  // Delete document
  deleteDocument: async (documentId) => {
    try {
      console.log('🗑️ [DOCUMENT] Deleting document:', documentId);
      const response = await api.delete(`/documents/${documentId}`);
      console.log('✅ [DOCUMENT] Document deleted:', response.data);
      toast.success('Document deleted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ [DOCUMENT] Delete failed:', error);
      toast.error(error.message || 'Failed to delete document');
      throw error;
    }
  },

  // Get document metadata
  getDocumentMetadata: async (documentId) => {
    try {
      console.log('📄 [DOCUMENT] Fetching metadata:', documentId);
      const response = await api.get(`/documents/${documentId}/metadata`);
      console.log('✅ [DOCUMENT] Metadata fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [DOCUMENT] Failed to fetch metadata:', error);
      toast.error(error.message || 'Failed to load document info');
      throw error;
    }
  },
};

export default documentService;
