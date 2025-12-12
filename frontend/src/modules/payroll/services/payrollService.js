import api from "../../../core/api/api";
import { toast } from "react-toastify";

const payrollService = {
  /* --------------------------------------------------------
   * EMPLOYEE PAYROLL (SELF SERVICE)
   * -------------------------------------------------------- */

  // Get logged-in employee payslips
  getMyPayslips: async () => {
    try {
      const response = await api.get("/employee/payroll/payslips");
      return response.data;
    } catch (error) {
      toast.error("Failed to load your payslips");
      throw error;
    }
  },

  // Get a specific payslip (employee view)
  getMyPayslipDetail: async (id) => {
    try {
      const response = await api.get(`/employee/payroll/payslips/${id}`);
      return response.data;
    } catch (error) {
      toast.error("Failed to load payslip details");
      throw error;
    }
  },

  // Download PDF (employee)
  downloadMyPayslip: async (id) => {
    try {
      const response = await api.get(
        `/employee/payroll/payslips/${id}/download`,
        { responseType: "blob" }
      );
      return response.data;
    } catch (error) {
      toast.error("Failed to download payslip");
      throw error;
    }
  },

  /* --------------------------------------------------------
   * ADMIN PAYSLIPS
   * -------------------------------------------------------- */

  // Get ALL employee payslips (admin)
  getPayslips: async () => {
    try {
      const response = await api.get("/admin/payroll/payslips");
      return response.data;
    } catch (error) {
      toast.error("Failed to load all payslips");
      throw error;
    }
  },

  // Get specific payslip (admin)
  getPayslipDetail: async (id) => {
    try {
      const response = await api.get(`/admin/payroll/payslips/${id}`);
      return response.data;
    } catch (error) {
      toast.error("Failed to load payslip details");
      throw error;
    }
  },

  // Download PDF (admin)
  downloadPayslip: async (id) => {
    try {
      const response = await api.get(`/admin/payroll/payslips/${id}/download`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      toast.error("Failed to download payslip");
      throw error;
    }
  },

  /* --------------------------------------------------------
   * SALARY STRUCTURES (ADMIN)
   * -------------------------------------------------------- */

  // Get all salary structures
  getSalaryStructures: async () => {
    try {
      const response = await api.get("/admin/payroll/structures");
      return response.data;
    } catch (error) {
      toast.error("Failed to load salary structures");
      throw error;
    }
  },

  // Create new salary structure
  createSalaryStructure: async (data) => {
    try {
      const response = await api.post("/admin/payroll/structures", data);
      return response.data;
    } catch (error) {
      toast.error("Failed to create salary structure");
      throw error;
    }
  },

  // Update structure
  updateSalaryStructure: async (id, data) => {
    try {
      const response = await api.put(`/admin/payroll/structures/${id}`, data);
      return response.data;
    } catch (error) {
      toast.error("Failed to update salary structure");
      throw error;
    }
  },

  // Delete structure
  deleteSalaryStructure: async (id) => {
    try {
      const response = await api.delete(`/admin/payroll/structures/${id}`);
      return response.data;
    } catch (error) {
      toast.error("Failed to delete salary structure");
      throw error;
    }
  },

  /* --------------------------------------------------------
   * PAYROLL PROCESSING (HR / ADMIN)
   * -------------------------------------------------------- */

  // Generate payroll for all employees
  generatePayroll: async (monthData) => {
    try {
      const response = await api.post("/admin/payroll/generate", monthData);
      toast.success("Payroll generated successfully");
      return response.data;
    } catch (error) {
      toast.error("Failed to generate payroll");
      throw error;
    }
  },

  // Assign salary structure to an employee
  assignStructure: async (employeeId, structureId) => {
    try {
      const response = await api.post(`/admin/payroll/assign/${employeeId}`, {
        structureId,
      });
      return response.data;
    } catch (error) {
      toast.error("Failed to assign salary structure");
      throw error;
    }
  },

  // Get all employees with payroll information (for HR/Admin)
  getPayrollEmployees: async () => {
    try {
      const response = await api.get("/admin/payroll/employees");
      return response.data;
    } catch (error) {
      toast.error("Failed to load payroll employee list");
      throw error;
    }
  },

  /* --------------------------------------------------------
   * EMPLOYEE STRUCTURE VIEW
   * -------------------------------------------------------- */

  // Get the salary structure assigned to the logged-in employee
  getMySalaryStructure: async () => {
    try {
      const response = await api.get("/employee/payroll/structure");
      return response.data;
    } catch (error) {
      toast.error("Failed to load your salary structure");
      throw error;
    }
  },
};

export default payrollService;
