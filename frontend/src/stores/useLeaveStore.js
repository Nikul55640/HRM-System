import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { toast } from "react-toastify";
import leaveService from "../core/services/leaveService";

const useLeaveStore = create(
  devtools(
    subscribeWithSelector((set, get) => ({
      // ========================
      // STATE
      // ========================
      leaveRequests: [],
      currentRequest: null,
      loading: false,
      error: null,

      // Filters used in admin leave management
      filters: {
        status: "all",
        leaveType: "all",
        dateRange: "all",
        search: "",
      },

      // Pagination
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },

      // ========================
      // Simple setters
      // ========================
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      setPagination: (newPagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...newPagination },
        })),

      // ========================
      // FETCH ALL LEAVE REQUESTS (ADMIN SIDE)
      // ========================
      fetchLeaveRequests: async (customFilters = null) => {
        const { filters: storeFilters, pagination } = get();
        const filtersToUse = customFilters || storeFilters;
        set({ loading: true, error: null });

        try {
          const response = await leaveService.getLeaveRequests({
            ...filtersToUse,
            page: pagination.page,
            limit: pagination.limit,
          });

          set({
            leaveRequests: response.data || [],
            pagination: response.pagination || pagination,
            loading: false,
          });
        } catch (error) {
          const message =
            error.response?.data?.error?.message ||
            "Failed to fetch leave requests";
          toast.error(message);
          set({ loading: false, error: message });
        }
      },

      // ========================
      // GET ONE LEAVE REQUEST
      // ========================
      fetchLeaveRequestById: async (id) => {
        set({ loading: true });

        try {
          const response = await leaveService.getLeaveRequest(id);
          set({
            currentRequest: response.data,
            loading: false,
          });
        } catch (error) {
          const message =
            error.response?.data?.error?.message ||
            "Failed to fetch leave request";
          toast.error(message);
          set({ loading: false, error: message });
        }
      },

      // ========================
      // APPROVE
      // ========================
      approveLeaveRequest: async (id, comments = "") => {
        set({ loading: true });

        try {
          const response = await leaveService.approveLeaveRequest(id, {
            comments,
          });

          set((state) => ({
            leaveRequests: state.leaveRequests.map((req) =>
              (req._id || req.id) === id ? response.data : req
            ),
            loading: false,
          }));

          toast.success("Leave request approved successfully");
        } catch (error) {
          let message = "Failed to approve leave request";
          
          if (error.response?.status === 400) {
            // Handle specific business logic errors
            message = error.response.data?.message || "This leave request cannot be approved";
          } else if (error.response?.data?.error?.message) {
            message = error.response.data.error.message;
          } else if (error.response?.data?.message) {
            message = error.response.data.message;
          }
          
          toast.error(message);
          set({ loading: false, error: message });
          throw error; // Re-throw so component can handle if needed
        }
      },

      // ========================
      // REJECT
      // ========================
      rejectLeaveRequest: async (id, comments = "") => {
        set({ loading: true });

        try {
          const response = await leaveService.rejectLeaveRequest(id, {
            reason: comments,
          });

          set((state) => ({
            leaveRequests: state.leaveRequests.map((req) =>
              (req._id || req.id) === id ? response.data : req
            ),
            loading: false,
          }));

          toast.success("Leave request rejected successfully");
        } catch (error) {
          let message = "Failed to reject leave request";
          
          if (error.response?.status === 400) {
            // Handle specific business logic errors
            message = error.response.data?.message || "This leave request cannot be rejected";
          } else if (error.response?.data?.error?.message) {
            message = error.response.data.error.message;
          } else if (error.response?.data?.message) {
            message = error.response.data.message;
          }
          
          toast.error(message);
          set({ loading: false, error: message });
          throw error; // Re-throw so component can handle if needed
        }
      },

      // ========================
      // RESET
      // ========================
      clearCurrentRequest: () => set({ currentRequest: null }),

      reset: () =>
        set({
          leaveRequests: [],
          currentRequest: null,
          loading: false,
          error: null,
          filters: {
            status: "all",
            leaveType: "all",
            dateRange: "all",
            search: "",
          },
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        }),

      // ========================
      // GETTERS
      // ========================
      get pendingRequests() {
        return get().leaveRequests.filter((req) => req.status === "pending");
      },

      get approvedRequests() {
        return get().leaveRequests.filter((req) => req.status === "approved");
      },

      get rejectedRequests() {
        return get().leaveRequests.filter((req) => req.status === "rejected");
      },
    }))
  )
);

export default useLeaveStore;
