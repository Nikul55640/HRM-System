import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class LeaveTypeService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/admin/leave-types`,
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getLeaveTypes(params = {}) {
    const response = await this.api.get('/', { params });
    return response.data;
  }

  async getLeaveTypeById(id) {
    const response = await this.api.get(`/${id}`);
    return response.data;
  }

  async createLeaveType(data) {
    const response = await this.api.post('/', data);
    return response.data;
  }

  async updateLeaveType(id, data) {
    const response = await this.api.put(`/${id}`, data);
    return response.data;
  }

  async deleteLeaveType(id) {
    const response = await this.api.delete(`/${id}`);
    return response.data;
  }

  async toggleLeaveTypeStatus(id) {
    const response = await this.api.patch(`/${id}/toggle-status`);
    return response.data;
  }

  async getActiveLeaveTypes() {
    const response = await this.api.get('/active');
    return response.data;
  }
}

export const leaveTypeService = new LeaveTypeService();