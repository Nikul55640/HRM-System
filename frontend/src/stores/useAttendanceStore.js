import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { toast } from 'react-toastify';
import attendanceService from '../services/attendanceService';

const useAttendanceStore = create(
  devtools(
    subscribeWithSelector((set, get) => ({
      // State
      attendanceRecords: [],
      currentRecord: null,
      attendanceSummary: null,
      loading: false,
      error: null,
      
      // Filters
      filters: {
        startDate: '',
        endDate: '',
        employee: 'all',
        department: 'all',
        status: 'all'
      },
      
      // Pagination
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
      
      setAttendanceRecords: (records) => set({ attendanceRecords: records }),
      
      setPagination: (pagination) => set((state) => ({
        pagination: { ...state.pagination, ...pagination }
      })),
      
      // Fetch attendance records
      fetchAttendanceRecords: async (params = {}) => {
        const { filters, pagination } = get();
        set({ loading: true, error: null });
        
        try {
          const requestParams = {
            ...filters,
            ...params,
            page: pagination.page,
            limit: pagination.limit
          };
          
          const response = await attendanceService.getAllAttendance(requestParams);
          
          set({
            attendanceRecords: response.data || [],
            pagination: {
              ...pagination,
              ...response.pagination
            },
            loading: false
          });
          
          return response;
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.error?.message || 
                              'Failed to fetch attendance records';
          
          // Set empty data and error state
          set({ 
            attendanceRecords: [],
            loading: false, 
            error: errorMessage 
          });
          
          // Show user-friendly error message
          if (error.response?.status === 404) {
            toast.info('Attendance system is being set up - no records available yet');
          } else if (error.response?.status === 403) {
            toast.error('You do not have permission to view attendance records');
          } else {
            toast.error(errorMessage);
          }
          
          // Return empty response instead of throwing
          return {
            success: false,
            data: [],
            pagination: {
              total: 0,
              page: 1,
              limit: 10,
              pages: 0
            }
          };
        }
      },
      
      // Check in
      checkIn: async (data = {}) => {
        set({ loading: true, error: null });
        
        try {
          const response = await attendanceService.clockIn(data);
          
          set((state) => ({
            attendanceRecords: [response.data, ...state.attendanceRecords],
            currentRecord: response.data,
            loading: false
          }));
          
          toast.success('Checked in successfully');
          return response.data;
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to check in';
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Check out
      checkOut: async (data = {}) => {
        set({ loading: true, error: null });
        
        try {
          const response = await attendanceService.clockOut(data);
          
          set((state) => ({
            attendanceRecords: state.attendanceRecords.map(record =>
              record._id === response.data._id ? response.data : record
            ),
            currentRecord: state.currentRecord?._id === response.data._id 
              ? response.data 
              : state.currentRecord,
            loading: false
          }));
          
          toast.success('Checked out successfully');
          return response.data;
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to check out';
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Get attendance summary
      fetchAttendanceSummary: async (year, month) => {
        set({ loading: true, error: null });
        
        try {
          const response = await attendanceService.getMyAttendanceSummary(year, month);
          
          set({
            attendanceSummary: response.data,
            loading: false
          });
          
          return response.data;
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch attendance summary';
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Update attendance record
      updateAttendanceRecord: async (id, data) => {
        set({ loading: true, error: null });
        
        try {
          const response = await attendanceService.updateAttendance(id, data);
          
          set((state) => ({
            attendanceRecords: state.attendanceRecords.map(record =>
              record._id === id ? response.data : record
            ),
            loading: false
          }));
          
          toast.success('Attendance record updated successfully');
          return response.data;
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to update attendance record';
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Delete attendance record
      deleteAttendanceRecord: async (id) => {
        set({ loading: true, error: null });
        
        try {
          await attendanceService.deleteAttendance(id);
          
          set((state) => ({
            attendanceRecords: state.attendanceRecords.filter(record => record._id !== id),
            loading: false
          }));
          
          toast.success('Attendance record deleted successfully');
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to delete attendance record';
          set({ loading: false, error: errorMessage });
          toast.error(errorMessage);
          throw error;
        }
      },
      
      // Export attendance report
      exportAttendanceReport: async (params = {}) => {
        set({ loading: true, error: null });
        
        try {
          const response = await attendanceService.exportReport(params);
          
          // Create download link
          const url = window.URL.createObjectURL(new Blob([response]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `attendance-report-${new Date().toISOString().split('T')[0]}.xlsx`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          
          set({ loading: false });
          toast.success('Attendance report exported successfully');
          
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to export attendance report';
          set({ loading: false, error: errorMessage });
          
          if (error.response?.status === 404) {
            toast.info('Export feature is not yet available');
          } else if (error.response?.status === 403) {
            toast.error('You do not have permission to export reports');
          } else {
            toast.error(errorMessage);
          }
          
          // Don't throw error to prevent uncaught promise
          return null;
        }
      },
      
      // Get current attendance status
      getCurrentAttendanceStatus: async () => {
        try {
          const response = await attendanceService.getTodayStatus();
          set({ currentRecord: response.data });
          return response.data;
        } catch (error) {
          return null;
        }
      },
      
      // Reset store
      reset: () => set({
        attendanceRecords: [],
        currentRecord: null,
        attendanceSummary: null,
        loading: false,
        error: null,
        filters: {
          startDate: '',
          endDate: '',
          employee: 'all',
          department: 'all',
          status: 'all'
        },
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      }),
      
      // Computed getters
      get todayRecords() {
        const today = new Date().toISOString().split('T')[0];
        return get().attendanceRecords.filter(record => 
          record.date?.startsWith(today)
        );
      },
      
      get isCheckedIn() {
        const { currentRecord } = get();
        return currentRecord && currentRecord.checkInTime && !currentRecord.checkOutTime;
      },
      
      get totalHoursToday() {
        const { currentRecord } = get();
        if (!currentRecord?.checkInTime) return 0;
        
        const checkIn = new Date(currentRecord.checkInTime);
        const checkOut = currentRecord.checkOutTime 
          ? new Date(currentRecord.checkOutTime)
          : new Date();
        
        return Math.max(0, (checkOut - checkIn) / (1000 * 60 * 60));
      }
    })),
    {
      name: 'attendance-store'
    }
  )
);

export default useAttendanceStore;