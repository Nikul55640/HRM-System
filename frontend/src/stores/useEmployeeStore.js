import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { toast } from "react-toastify";

import employeeService from "../modules/employees/services/employeeService";
import departmentService from "../services/departmentService";

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
        const { pagination } = get();
        set({ loading: true, error: null });

        try {
          // Combined request params - use params passed from component
          const requestParams = {
            page: params.page || pagination.page,
            limit: params.limit || pagination.limit,
            ...params,
          };

          console.log("👉 [STORE] Fetching with params:", requestParams);

          const response = await employeeService.getEmployees(requestParams);

          // ---------------------------------------------------------
          // ⭐ SAFE RESPONSE MAPPING (MATCH ANY BACKEND FORMAT)
          // ---------------------------------------------------------

          // Response structure: { data: [...], pagination: {...}, message: "...", success: true }
          const employees =
            response.data || // Direct array from API
            response.employees ||
            response.docs || // MongoDB paginate
            response.results ||
            [];

          console.log("🔍 [STORE] Response structure:", response);
          console.log("🔍 [STORE] Extracted employees:", employees);
          console.log("🔍 [STORE] Employees count:", employees.length);

          const paginationData = response.pagination || {
            page: response.page || params.page || pagination.page,
            totalPages: response.totalPages || pagination.totalPages,
            total: response.total || employees.length,
            limit: params.limit || pagination.limit,
          };

          console.log("🔍 [STORE] Pagination data:", paginationData);

          set({
            employees,
            pagination: paginationData,
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
              (emp.id || emp._id) === id ? response.data : emp
            ),
            currentEmployee:
              (state.currentEmployee?.id || state.currentEmployee?._id) === id
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
            employees: state.employees.filter((emp) => (emp.id || emp._id) !== id),
            currentEmployee:
              (state.currentEmployee?.id || state.currentEmployee?._id) === id ? null : state.currentEmployee,
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
      setCurrentEmployee: (employee) => set({ currentEmployee: employee }),

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
