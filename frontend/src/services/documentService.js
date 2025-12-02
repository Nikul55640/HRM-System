import api from './api';

const documentService = {
  // Upload document for an employee
  uploadDocument: async (employeeId, formData) => {
    const response = await api.post(`/employees/${employeeId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all documents for an employee
  getEmployeeDocuments: async (employeeId) => {
    const response = await api.get(`/employees/${employeeId}/documents`);
    return response.data;
  },

  // Download/view document
  downloadDocument: async (documentId) => {
    const response = await api.get(`/documents/${documentId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete document
  deleteDocument: async (documentId) => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  },

  // Get document metadata
  getDocumentMetadata: async (documentId) => {
    const response = await api.get(`/documents/${documentId}/metadata`);
    return response.data;
  },
};

export default documentService;
