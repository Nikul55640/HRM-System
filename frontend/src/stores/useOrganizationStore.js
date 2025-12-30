import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { toast } from 'react-toastify';
import departmentService from '../services/departmentService';
import configService from '../services/configService';

const useOrganizationStore = create(
  devtools(
    subscribeWithSelector((set, get) => ({
      // State - Same as Redux but flatter
      departments: [],
      departmentHierarchy: [],
      systemConfig: null,
      
      // Loading states
      loading: {
        departments: false,
        hierarchy: false,
        config: false
      },
      
      // Error states
      error: {
        departments: null,
        hierarchy: null,
        config: null
      },
      
      // Pagination
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      
      // Actions - Much simpler than Redux thunks!
      
      // Clear errors
      clearErrors: () => set((state) => ({
        error: {
          departments: null,
          hierarchy: null,
          config: null
        }
      })),
      
      // Set pagination
      setPagination: (pagination) => set((state) => ({
        pagination: { ...state.pagination, ...pagination }
      })),
      
      // Reset state
      resetState: () => set({
        departments: [],
        departmentHierarchy: [],
        systemConfig: null,
        loading: { departments: false, hierarchy: false, config: false },
        error: { departments: null, hierarchy: null, config: null },
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      }),
      
      // Async actions - No thunks needed!
      
      // Fetch departments
      fetchDepartments: async (params = {}) => {
        set((state) => ({
          loading: { ...state.loading, departments: true },
          error: { ...state.error, departments: null }
        }));
        
        try {
          const response = await departmentService.getDepartments(params);
          
          set((state) => ({
            departments: response.data || [],
            pagination: response.pagination 
              ? { ...state.pagination, ...response.pagination }
              : state.pagination,
            loading: { ...state.loading, departments: false }
          }));
          
          return response;
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          
          set((state) => ({
            loading: { ...state.loading, departments: false },
            error: { ...state.error, departments: errorMessage }
          }));
          
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Fetch department hierarchy
      fetchDepartmentHierarchy: async () => {
        set((state) => ({
          loading: { ...state.loading, hierarchy: true },
          error: { ...state.error, hierarchy: null }
        }));
        
        try {
          const response = await departmentService.getDepartmentHierarchy();
          
          set((state) => ({
            departmentHierarchy: response.data || [],
            loading: { ...state.loading, hierarchy: false }
          }));
          
          return response;
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          
          set((state) => ({
            loading: { ...state.loading, hierarchy: false },
            error: { ...state.error, hierarchy: errorMessage }
          }));
          
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Create department
      createDepartment: async (departmentData) => {
        try {
          const response = await departmentService.createDepartment(departmentData);
          
          set((state) => ({
            departments: [...state.departments, response.data]
          }));
          
          toast.success('Department created successfully');
          
          // Refresh hierarchy
          get().fetchDepartmentHierarchy();
          
          return response.data;
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Update department
      updateDepartment: async (id, departmentData) => {
        try {
          const response = await departmentService.updateDepartment(id, departmentData);
          
          set((state) => ({
            departments: state.departments.map(dept => 
              dept._id === id ? response.data : dept
            )
          }));
          
          toast.success('Department updated successfully');
          
          // Refresh hierarchy
          get().fetchDepartmentHierarchy();
          
          return response.data;
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Delete department
      deleteDepartment: async (id) => {
        try {
          await departmentService.deleteDepartment(id);
          
          set((state) => ({
            departments: state.departments.filter(dept => dept._id !== id)
          }));
          
          toast.success('Department deleted successfully');
          
          // Refresh hierarchy and list
          get().fetchDepartmentHierarchy();
          get().fetchDepartments();
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Fetch system config
      fetchSystemConfig: async () => {
        set((state) => ({
          loading: { ...state.loading, config: true },
          error: { ...state.error, config: null }
        }));
        
        try {
          const response = await configService.getSystemConfig();
          
          set((state) => ({
            systemConfig: response.data,
            loading: { ...state.loading, config: false }
          }));
          
          return response;
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          
          set((state) => ({
            loading: { ...state.loading, config: false },
            error: { ...state.error, config: errorMessage }
          }));
          
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Update system config
      updateSystemConfig: async (config) => {
        try {
          const response = await configService.updateSystemConfig(config);
          
          set({ systemConfig: response.data });
          
          toast.success('System config updated successfully');
          
          return response.data;
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Computed getters (bonus feature!)
      get filteredDepartments() {
        return get().departments.filter(dept => dept.status === 'active');
      },
      
      get departmentCount() {
        return get().departments.length;
      },
      
      get isLoading() {
        const { loading } = get();
        return Object.values(loading).some(Boolean);
      },
      
      get hasErrors() {
        const { error } = get();
        return Object.values(error).some(Boolean);
      }
    })),
    {
      name: 'organization-store' // DevTools name
    }
  )
);

export default useOrganizationStore;