import api from '../../../core/api/api';

class LeaveTypeService {
  constructor() {
    this.baseURL = '/admin/leave-types';
  }

  async getLeaveTypes(params = {}) {
    const response = await api.get(this.baseURL, { params });
    return response.data;
  }

  async getLeaveTypeById(id) {
    const response = await api.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  async createLeaveType(data) {
    const response = await api.post(this.baseURL, data);
    return response.data;
  }

  async updateLeaveType(id, data) {
    const response = await api.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  async deleteLeaveType(id) {
    const response = await api.delete(`${this.baseURL}/${id}`);
    return response.data;
  }

  async toggleLeaveTypeStatus(id) {
    const response = await api.patch(`${this.baseURL}/${id}/toggle-status`);
    return response.data;
  }

  async getActiveLeaveTypes() {
    const response = await api.get(`${this.baseURL}/active`);
    return response.data;
  }
}

export const leaveTypeService = new LeaveTypeService();