import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { toast } from "react-toastify";

import employeeService from "../modules/employees/services/employeeService";
import departmentService from "../core/services/departmentService";

const useEmployeeStore = create(
  devtools(
    subscribeWithSelector((set, get) => ({
      // ------------------ STATE ------------------
      employees: [],
      currentEmployee: null,
      loading: false,
      error: null,

      filters: {
        search: "",
        department: "all",
        status: "all",
        role: "all",
      },

      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      },

      departments: [],

      // ------------------ ACTIONS ------------------
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      setPagination: (pagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        })),

      // ---------------------------------------------------------
      // ⭐ FIXED — FETCH EMPLOYEES (NO MORE 400 ERRORS)
      // ---------------------------------------------------------
      fetchEmployees: async (params = {}) => {
        const { filters, pagination } = get();
        set({ loading: true, error: null });

        try {
          // ⭐ CLEAN FILTERS BEFORE SENDING TO BACKEND
          const cleanFilters = {};

          if (filters.search?.trim() !== "") {
            cleanFilters.search = filters.search.trim();
          }

          if (filters.department !== "all") {
            cleanFilters.department = filters.department;
          }

          if (
            ["Active", "Inactive", "On Leave", "Terminated"].includes(
              filters.status
            )
          ) {
            cleanFilters.status = filters.status;
          }

          if (filters.role !== "all") {
            cleanFilters.role = filters.role;
          }

          // Combined request params
          const requestParams = {
            page: pagination.page,
            limit: pagination.limit,
            ...cleanFilters,
            ...params,
          };



          const response = await employeeService.getEmployees(requestParams);

          // ---------------------------------------------------------
          // ⭐ SAFE RESPONSE MAPPING (MATCH ANY BACKEND FORMAT)
          // ---------------------------------------------------------

          const data = response.data || {};

          const employees =
            data.employees ||
            data.docs || // MongoDB paginate
            data.results ||
            [];

          const paginationData = data.pagination || {
            page: data.page || pagination.page,
            totalPages: data.totalPages || pagination.totalPages,
            total: data.total || employees.length,
            limit: pagination.limit,
          };

          set({
            employees,
            pagination: { ...pagination, ...paginationData },
            loading: false,
          });

          return response;
        } catch (error) {
          const errMsg =
            error.response?.data?.error?.message ||
            error.response?.data?.message ||
            "Failed to fetch employees";

          set({ loading: false, error: errMsg });
          toast.error(errMsg);
          throw error;
        }
      },

      // ------------------ FETCH SINGLE EMPLOYEE ------------------
      fetchEmployeeById: async (id) => {
        set({ loading: true, error: null });

        try {
          const response = await employeeService.getEmployeeById(id);

          set({
            currentEmployee: response.data,
            loading: false,
          });

          return response.data;
        } catch (error) {
          const errMsg =
            error.response?.data?.message || "Failed to fetch employee";
          set({ loading: false, error: errMsg });
          toast.error(errMsg);
          throw error;
        }
      },

      // ------------------ CREATE EMPLOYEE ------------------
      createEmployee: async (employeeData) => {
        set({ loading: true, error: null });

        try {
          const response = await employeeService.createEmployee(employeeData);

          set((state) => ({
            employees: [...state.employees, response.data],
            loading: false,
          }));

          toast.success("Employee created successfully");
          return response.data;
        } catch (error) {
          const errMsg =
            error.response?.data?.message || "Failed to create employee";
          set({ loading: false, error: errMsg });
          toast.error(errMsg);
          throw error;
        }
      },

      // ------------------ UPDATE EMPLOYEE ------------------
      updateEmployee: async (id, employeeData) => {
        set({ loading: true, error: null });

        try {
          const response = await employeeService.updateEmployee(
            id,
            employeeData
          );

          set((state) => ({
            employees: state.employees.map((emp) =>
              emp._id === id ? response.data : emp
            ),
            currentEmployee:
              state.currentEmployee?._id === id
                ? response.data
                : state.currentEmployee,
            loading: false,
          }));

          toast.success("Employee updated successfully");
          return response.data;
        } catch (error) {
          const errMsg =
            error.response?.data?.message || "Failed to update employee";
          set({ loading: false, error: errMsg });
          toast.error(errMsg);
          throw error;
        }
      },

      // ------------------ DELETE EMPLOYEE ------------------
      deleteEmployee: async (id) => {
        set({ loading: true, error: null });

        try {
          await employeeService.deleteEmployee(id);

          set((state) => ({
            employees: state.employees.filter((emp) => emp._id !== id),
            currentEmployee:
              state.currentEmployee?._id === id ? null : state.currentEmployee,
            loading: false,
          }));

          toast.success("Employee deleted successfully");
        } catch (error) {
          const errMsg =
            error.response?.data?.message || "Failed to delete employee";
          set({ loading: false, error: errMsg });
          toast.error(errMsg);
          throw error;
        }
      },

      // ------------------ DEPARTMENTS ------------------
      fetchDepartments: async () => {
        try {
          const response = await departmentService.getDepartments();
          // departmentService.getDepartments() already returns response.data
          const departments = Array.isArray(response.data) ? response.data : [];
          set({ departments });
          return departments;
        } catch (error) {
          
          set({ departments: [] });
          return [];
        }
      },

      // ------------------ CLEAR + RESET ------------------
      clearCurrentEmployee: () => set({ currentEmployee: null }),

      reset: () =>
        set({
          employees: [],
          currentEmployee: null,
          loading: false,
          error: null,
          filters: {
            search: "",
            department: "all",
            status: "all",
            role: "all",
          },
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
          },
          departments: [],
        }),
    })),
    { name: "employee-store" }
  )
);

export default useEmployeeStore;
