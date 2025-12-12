import api from '../../../core/api/api';

const documentService = {
  // Get all documents with optional filters
  getDocuments: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.append('category', params.category);
    if (params.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    
    const response = await api.get(`/documents?${queryParams.toString()}`);
    return response.data;
  },

  // Get document by ID
  getDocumentById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  // Upload new document
  uploadDocument: async (formData) => {
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update document
  updateDocument: async (id, data) => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },

  // Delete document
  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  // Download document
  downloadDocument: async (id, filename) => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Get document categories
  getCategories: async () => {
    const response = await api.get('/documents/categories');
    return response.data;
  },

  // Get employee documents
  getEmployeeDocuments: async (employeeId) => {
    const response = await api.get(`/employees/${employeeId}/documents`);
    return response.data;
  },

  // Get my documents (for current user)
  getMyDocuments: async () => {
    const response = await api.get('/documents/my');
    return response.data;
  },
};

export default documentService;