import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { toast } from 'react-toastify';
import api from '../core/api/api';
import payrollService from '../modules/payroll/services/payrollService';

const usePayrollStore = create(
  devtools(
    (set, get) => ({
      // Dashboard State
      dashboard: {
        statistics: null,
        recentPayslips: [],
        currentPeriod: null,
        loading: false,
        error: null
      },
      
      // Payslips State
      payslips: [],
      currentPayslip: null,
      payslipsLoading: false,
      payslipsError: null,
      
      // Salary Structures State
      salaryStructures: [],
      structuresLoading: false,
      structuresError: null,
      
      // Employee Payroll State
      myPayslips: [],
      mySalaryStructure: null,
      myPayrollLoading: false,
      myPayrollError: null,
      
      // Dashboard Actions
      fetchDashboard: async () => {
        set((state) => ({
          dashboard: { ...state.dashboard, loading: true, error: null }
        }));
        
        try {
          const response = await api.get('/admin/payroll/dashboard');
          
          set((state) => ({
            dashboard: {
              ...state.dashboard,
              statistics: response.data.data.statistics,
              recentPayslips: response.data.data.recentPayslips,
              currentPeriod: response.data.data.currentPeriod,
              loading: false,
              error: null
            }
          }));
          
          return response.data.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch payroll dashboard';
          
          set((state) => ({
            dashboard: {
              ...state.dashboard,
              loading: false,
              error: errorMessage
            }
          }));
          
          throw error;
        }
      },
      
      // Payslips Actions
      fetchPayslips: async () => {
        set({ payslipsLoading: true, payslipsError: null });
        
        try {
          const response = await payrollService.getPayslips();
          
          set({
            payslips: response.data || [],
            payslipsLoading: false,
            payslipsError: null
          });
          
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch payslips';
          
          set({
            payslipsLoading: false,
            payslipsError: errorMessage
          });
          
          throw error;
        }
      },
      
      fetchPayslipDetail: async (id) => {
        set({ payslipsLoading: true, payslipsError: null });
        
        try {
          const response = await payrollService.getPayslipDetail(id);
          
          set({
            currentPayslip: response.data,
            payslipsLoading: false,
            payslipsError: null
          });
          
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch payslip details';
          
          set({
            payslipsLoading: false,
            payslipsError: errorMessage
          });
          
          throw error;
        }
      },
      
      downloadPayslip: async (id) => {
        try {
          const blob = await payrollService.downloadPayslip(id);
          
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `payslip-${id}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          toast.success('Payslip downloaded successfully');
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to download payslip';
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Salary Structures Actions
      fetchSalaryStructures: async () => {
        set({ structuresLoading: true, structuresError: null });
        
        try {
          const response = await payrollService.getSalaryStructures();
          
          set({
            salaryStructures: response.data || [],
            structuresLoading: false,
            structuresError: null
          });
          
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch salary structures';
          
          set({
            structuresLoading: false,
            structuresError: errorMessage
          });
          
          throw error;
        }
      },
      
      createSalaryStructure: async (data) => {
        set({ structuresLoading: true, structuresError: null });
        
        try {
          const response = await payrollService.createSalaryStructure(data);
          
          // Add to existing structures
          set((state) => ({
            salaryStructures: [...state.salaryStructures, response.data],
            structuresLoading: false,
            structuresError: null
          }));
          
          toast.success('Salary structure created successfully');
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to create salary structure';
          
          set({
            structuresLoading: false,
            structuresError: errorMessage
          });
          
          throw error;
        }
      },
      
      updateSalaryStructure: async (id, data) => {
        set({ structuresLoading: true, structuresError: null });
        
        try {
          const response = await payrollService.updateSalaryStructure(id, data);
          
          // Update in existing structures
          set((state) => ({
            salaryStructures: state.salaryStructures.map(structure =>
              structure._id === id ? response.data : structure
            ),
            structuresLoading: false,
            structuresError: null
          }));
          
          toast.success('Salary structure updated successfully');
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to update salary structure';
          
          set({
            structuresLoading: false,
            structuresError: errorMessage
          });
          
          throw error;
        }
      },
      
      deleteSalaryStructure: async (id) => {
        set({ structuresLoading: true, structuresError: null });
        
        try {
          await payrollService.deleteSalaryStructure(id);
          
          // Remove from existing structures
          set((state) => ({
            salaryStructures: state.salaryStructures.filter(structure => structure._id !== id),
            structuresLoading: false,
            structuresError: null
          }));
          
          toast.success('Salary structure deleted successfully');
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to delete salary structure';
          
          set({
            structuresLoading: false,
            structuresError: errorMessage
          });
          
          throw error;
        }
      },
      
      // Employee Payroll Actions (Self Service)
      fetchMyPayslips: async () => {
        set({ myPayrollLoading: true, myPayrollError: null });
        
        try {
          const response = await payrollService.getMyPayslips();
          
          set({
            myPayslips: response.data || [],
            myPayrollLoading: false,
            myPayrollError: null
          });
          
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch your payslips';
          
          set({
            myPayrollLoading: false,
            myPayrollError: errorMessage
          });
          
          throw error;
        }
      },
      
      fetchMySalaryStructure: async () => {
        set({ myPayrollLoading: true, myPayrollError: null });
        
        try {
          const response = await payrollService.getMySalaryStructure();
          
          set({
            mySalaryStructure: response.data,
            myPayrollLoading: false,
            myPayrollError: null
          });
          
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch your salary structure';
          
          set({
            myPayrollLoading: false,
            myPayrollError: errorMessage
          });
          
          throw error;
        }
      },
      
      downloadMyPayslip: async (id) => {
        try {
          const blob = await payrollService.downloadMyPayslip(id);
          
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `my-payslip-${id}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          toast.success('Payslip downloaded successfully');
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to download payslip';
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Payroll Processing Actions
      generatePayroll: async (monthData) => {
        set({ payslipsLoading: true, payslipsError: null });
        
        try {
          const response = await payrollService.generatePayroll(monthData);
          
          // Refresh payslips after generation
          get().fetchPayslips();
          
          set({
            payslipsLoading: false,
            payslipsError: null
          });
          
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to generate payroll';
          
          set({
            payslipsLoading: false,
            payslipsError: errorMessage
          });
          
          throw error;
        }
      },
      
      assignStructure: async (employeeId, structureId) => {
        try {
          const response = await payrollService.assignStructure(employeeId, structureId);
          toast.success('Salary structure assigned successfully');
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to assign salary structure';
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Clear Actions
      clearDashboardError: () => {
        set((state) => ({
          dashboard: { ...state.dashboard, error: null }
        }));
      },
      
      clearPayslipsError: () => {
        set({ payslipsError: null });
      },
      
      clearStructuresError: () => {
        set({ structuresError: null });
      },
      
      clearMyPayrollError: () => {
        set({ myPayrollError: null });
      },
      
      // Reset Actions
      resetPayrollState: () => {
        set({
          dashboard: {
            statistics: null,
            recentPayslips: [],
            currentPeriod: null,
            loading: false,
            error: null
          },
          payslips: [],
          currentPayslip: null,
          payslipsLoading: false,
          payslipsError: null,
          salaryStructures: [],
          structuresLoading: false,
          structuresError: null,
          myPayslips: [],
          mySalaryStructure: null,
          myPayrollLoading: false,
          myPayrollError: null
        });
      }
    }),
    {
      name: 'payroll-store'
    }
  )
);

export default usePayrollStore;