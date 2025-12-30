import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { toast } from 'react-toastify';
import departmentService from '../services/departmentService';  

const useDepartmentStore = create(
  devtools(
    subscribeWithSelector((set, get) => ({
      // State
      departments: [],
      departmentHierarchy: [],
      currentDepartment: null,
      loading: false,
      error: null,
      filters: {
        search: '',
        status: 'all',
        parentDepartment: 'all'
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      
      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),
      
      setPagination: (pagination) => set((state) => ({
        pagination: { ...state.pagination, ...pagination }
      })),
      
      // Fetch departments
      fetchDepartments: async (params = {}) => {
        const { filters, pagination } = get();
        set({ loading: true, error: null });
        
        try {
          const response = await departmentService.getDepartments({
            ...filters,
            ...params,
            page: pagination.page,
            limit: pagination.limit
          });
          
          set({
            departments: response.data || [],
            pagination: {
              ...pagination,
              ...response.pagination
            },
            loading: false
          });
          
          return response;
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch departments';
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Fetch department hierarchy
      fetchDepartmentHierarchy: async () => {
        set({ loading: true, error: null });
        
        try {
          const response = await departmentService.getDepartmentHierarchy();
          
          set({
            departmentHierarchy: response.data || [],
            loading: false
          });
          
          return response;
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch department hierarchy';
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Get department by ID
      fetchDepartmentById: async (id) => {
        set({ loading: true, error: null });
        
        try {
          const response = await departmentService.getDepartment(id);
          
          set({
            currentDepartment: response.data,
            loading: false
          });
          
          return response.data;
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch department';
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Create department
      createDepartment: async (departmentData) => {
        set({ loading: true, error: null });
        
        try {
          const response = await departmentService.createDepartment(departmentData);
          
          set((state) => ({
            departments: [...state.departments, response.data],
            loading: false
          }));
          
          toast.success('Department created successfully');
          
          // Refresh hierarchy
          get().fetchDepartmentHierarchy();
          
          return response.data;
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to create department';
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Update department
      updateDepartment: async (id, departmentData) => {
        set({ loading: true, error: null });
        
        try {
          const response = await departmentService.updateDepartment(id, departmentData);
          
          set((state) => ({
            departments: state.departments.map(dept => 
              dept._id === id ? response.data : dept
            ),
            currentDepartment: state.currentDepartment?._id === id 
              ? response.data 
              : state.currentDepartment,
            loading: false
          }));
          
          toast.success('Department updated successfully');
          
          // Refresh hierarchy
          get().fetchDepartmentHierarchy();
          
          return response.data;
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to update department';
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Delete department
      deleteDepartment: async (id) => {
        set({ loading: true, error: null });
        
        try {
          await departmentService.deleteDepartment(id);
          
          set((state) => ({
            departments: state.departments.filter(dept => dept._id !== id),
            currentDepartment: state.currentDepartment?._id === id 
              ? null 
              : state.currentDepartment,
            loading: false
          }));
          
          toast.success('Department deleted successfully');
          
          // Refresh hierarchy and list
          get().fetchDepartmentHierarchy();
          get().fetchDepartments();
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to delete department';
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Get department employees
      getDepartmentEmployees: async (id, params = {}) => {
        set({ loading: true, error: null });
        
        try {
          const response = await departmentService.getDepartmentEmployees(id, params);
          
          set({ loading: false });
          return response.data;
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch department employees';
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Assign employees to department
      assignEmployees: async (departmentId, employeeIds) => {
        set({ loading: true, error: null });
        
        try {
          const response = await departmentService.assignEmployees(departmentId, employeeIds);
          
          set({ loading: false });
          toast.success(`${employeeIds.length} employee(s) assigned successfully`);
          
          return response.data;
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to assign employees';
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Remove employees from department
      removeEmployees: async (departmentId, employeeIds) => {
        set({ loading: true, error: null });
        
        try {
          const response = await departmentService.removeEmployees(departmentId, employeeIds);
          
          set({ loading: false });
          toast.success(`${employeeIds.length} employee(s) removed successfully`);
          
          return response.data;
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to remove employees';
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Get department statistics
      getDepartmentStats: async (id) => {
        try {
          const response = await departmentService.getDepartmentStats(id);
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch department stats';
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Reset store
      reset: () => set({
        departments: [],
        departmentHierarchy: [],
        currentDepartment: null,
        loading: false,
        error: null,
        filters: {
          search: '',
          status: 'all',
          parentDepartment: 'all'
        },
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      }),
      
      // Computed getters
      get filteredDepartments() {
        const { departments, filters } = get();
        return departments.filter(dept => {
          if (filters.search && !dept.name.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
          }
          if (filters.status !== 'all' && dept.status !== filters.status) {
            return false;
          }
          return true;
        });
      },
      
      get rootDepartments() {
        const { departments } = get();
        return departments.filter(dept => !dept.parentDepartment);
      }
    })),
    {
      name: 'department-store'
    }
  )
);

export default useDepartmentStore;