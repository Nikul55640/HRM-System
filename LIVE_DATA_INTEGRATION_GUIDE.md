# 🔗 Live Data Integration Guide

**Complete guide to connect your HRM frontend with backend APIs**

---

## 📋 TABLE OF CONTENTS

1. [API Configuration](#api-configuration)
2. [Service Layer Setup](#service-layer-setup)
3. [Redux Integration](#redux-integration)
4. [Page-by-Page Integration](#page-by-page-integration)
5. [Authentication Flow](#authentication-flow)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

---

## 1. API CONFIGURATION

### Step 1: Update API Base URL

**File:** `frontend/src/services/api.js`

```javascript
import axios from 'axios';

// Update this to your backend URL
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:4001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### Step 2: Environment Variables

**File:** `frontend/.env`

```env
VITE_API_URL=http://localhost:4001/api
```

**File:** `frontend/.env.production`

```env
VITE_API_URL=https://your-production-domain.com/api
```

---

## 2. SERVICE LAYER SETUP

### Create API Services for Each Module

**File:** `frontend/src/services/calendarService.js`

```javascript
import api from './api';

export const calendarService = {
  // Get all events
  getEvents: async (params) => {
    const response = await api.get('/calendar/events', { params });
    return response.data;
  },

  // Get events by date range
  getEventsByDateRange: async (startDate, endDate) => {
    const response = await api.get('/calendar/events', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Create event
  createEvent: async (eventData) => {
    const response = await api.post('/calendar/events', eventData);
    return response.data;
  },

  // Update event
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/calendar/events/${id}`, eventData);
    return response.data;
  },

  // Delete event
  deleteEvent: async (id) => {
    const response = await api.delete(`/calendar/events/${id}`);
    return response.data;
  },

  // Sync calendar
  syncCalendar: async () => {
    const response = await api.post('/calendar/sync');
    return response.data;
  },
};

export default calendarService;
```

**File:** `frontend/src/services/attendanceService.js`

```javascript
import api from './api';

export const attendanceService = {
  // Get attendance records
  getAttendanceRecords: async (params) => {
    const response = await api.get('/employee/attendance', { params });
    return response.data;
  },

  // Check in
  checkIn: async (location) => {
    const response = await api.post('/employee/attendance/check-in', { location });
    return response.data;
  },

  // Check out
  checkOut: async (location) => {
    const response = await api.post('/employee/attendance/check-out', { location });
    return response.data;
  },

  // Get admin attendance list
  getAdminAttendanceList: async (params) => {
    const response = await api.get('/admin/attendance', { params });
    return response.data;
  },

  // Get monthly summary
  getMonthlySummary: async (employeeId, year, month) => {
    const response = await api.get(`/employee/attendance/summary`, {
      params: { employeeId, year, month },
    });
    return response.data;
  },
};

export default attendanceService;
```

**File:** `frontend/src/services/leaveService.js`

```javascript
import api from './api';

export const leaveService = {
  // Get leave requests
  getLeaveRequests: async (params) => {
    const response = await api.get('/employee/leave-requests', { params });
    return response.data;
  },

  // Submit leave request
  submitLeaveRequest: async (leaveData) => {
    const response = await api.post('/employee/leave-requests', leaveData);
    return response.data;
  },

  // Get leave balance
  getLeaveBalance: async () => {
    const response = await api.get('/employee/leave-balance');
    return response.data;
  },

  // Admin: Get all leave requests
  getAllLeaveRequests: async (params) => {
    const response = await api.get('/admin/leave-requests', { params });
    return response.data;
  },

  // Admin: Approve leave
  approveLeave: async (id, data) => {
    const response = await api.put(`/admin/leave-requests/${id}/approve`, data);
    return response.data;
  },

  // Admin: Reject leave
  rejectLeave: async (id, data) => {
    const response = await api.put(`/admin/leave-requests/${id}/reject`, data);
    return response.data;
  },
};

export default leaveService;
```

**File:** `frontend/src/services/payrollService.js`

```javascript
import api from './api';

export const payrollService = {
  // Get payroll dashboard data
  getDashboardData: async () => {
    const response = await api.get('/admin/payroll/dashboard');
    return response.data;
  },

  // Get employee payroll list
  getEmployeePayroll: async (params) => {
    const response = await api.get('/admin/payroll/employees', { params });
    return response.data;
  },

  // Get salary structures
  getSalaryStructures: async () => {
    const response = await api.get('/admin/salary-structures');
    return response.data;
  },

  // Create salary structure
  createSalaryStructure: async (data) => {
    const response = await api.post('/admin/salary-structures', data);
    return response.data;
  },

  // Update salary structure
  updateSalaryStructure: async (id, data) => {
    const response = await api.put(`/admin/salary-structures/${id}`, data);
    return response.data;
  },

  // Delete salary structure
  deleteSalaryStructure: async (id) => {
    const response = await api.delete(`/admin/salary-structures/${id}`);
    return response.data;
  },

  // Get payslips
  getPayslips: async (params) => {
    const response = await api.get('/admin/payroll/payslips', { params });
    return response.data;
  },

  // Generate payslip
  generatePayslip: async (data) => {
    const response = await api.post('/admin/payroll/generate', data);
    return response.data;
  },

  // Employee: Get own payslips
  getEmployeePayslips: async () => {
    const response = await api.get('/employee/payslips');
    return response.data;
  },

  // Download payslip PDF
  downloadPayslip: async (id) => {
    const response = await api.get(`/employee/payslips/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default payrollService;
```

**File:** `frontend/src/services/managerService.js`

```javascript
import api from './api';

export const managerService = {
  // Get team members
  getTeamMembers: async () => {
    const response = await api.get('/manager/team');
    return response.data;
  },

  // Get pending approvals
  getPendingApprovals: async () => {
    const response = await api.get('/manager/approvals');
    return response.data;
  },

  // Approve leave
  approveLeave: async (id, data) => {
    const response = await api.put(`/manager/leave/${id}/approve`, data);
    return response.data;
  },

  // Reject leave
  rejectLeave: async (id, data) => {
    const response = await api.put(`/manager/leave/${id}/reject`, data);
    return response.data;
  },

  // Get team reports
  getTeamReports: async (params) => {
    const response = await api.get('/manager/reports', { params });
    return response.data;
  },

  // Get team performance
  getTeamPerformance: async () => {
    const response = await api.get('/manager/performance');
    return response.data;
  },
};

export default managerService;
```

**File:** `frontend/src/services/departmentService.js`

```javascript
import api from './api';

export const departmentService = {
  // Get all departments
  getDepartments: async () => {
    const response = await api.get('/admin/departments');
    return response.data;
  },

  // Create department
  createDepartment: async (data) => {
    const response = await api.post('/admin/departments', data);
    return response.data;
  },

  // Update department
  updateDepartment: async (id, data) => {
    const response = await api.put(`/admin/departments/${id}`, data);
    return response.data;
  },

  // Delete department
  deleteDepartment: async (id) => {
    const response = await api.delete(`/admin/departments/${id}`);
    return response.data;
  },
};

export default departmentService;
```

---

## 3. REDUX INTEGRATION

### Update Redux Slices with API Calls

**File:** `frontend/src/store/slices/attendanceSlice.js`

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import attendanceService from '../../services/attendanceService';

// Async thunks
export const fetchAttendanceRecords = createAsyncThunk(
  'attendance/fetchRecords',
  async (params, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getAttendanceRecords(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async (location, { rejectWithValue }) => {
    try {
      const response = await attendanceService.checkIn(location);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async (location, { rejectWithValue }) => {
    try {
      const response = await attendanceService.checkOut(location);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    records: [],
    currentRecord: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch records
      .addCase(fetchAttendanceRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchAttendanceRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check in
      .addCase(checkIn.fulfilled, (state, action) => {
        state.currentRecord = action.payload;
      })
      // Check out
      .addCase(checkOut.fulfilled, (state, action) => {
        state.currentRecord = action.payload;
      });
  },
});

export const { clearError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
```

---

## 4. PAGE-BY-PAGE INTEGRATION

### Example: Update DailyCalendarView with Live Data

**File:** `frontend/src/features/calendar/DailyCalendarView.jsx`

```javascript
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import calendarService from '../../services/calendarService';
import { toast } from 'react-toastify';
// ... other imports

const DailyCalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDayEvents();
  }, [selectedDate]);

  const fetchDayEvents = async () => {
    setLoading(true);
    try {
      // Format date for API
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Call API
      const response = await calendarService.getEventsByDateRange(
        dateStr,
        dateStr
      );
      
      if (response.success) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Rest of component...
};
```

### Example: Update ManagerApprovals with Live Data

**File:** `frontend/src/features/manager/ManagerApprovals.jsx`

```javascript
import { useState, useEffect } from 'react';
import managerService from '../../services/managerService';
import { toast } from 'react-toastify';

const ManagerApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const response = await managerService.getPendingApprovals();
      if (response.success) {
        setRequests(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
      toast.error('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await managerService.approveLeave(id, {
        comments: 'Approved by manager',
      });
      toast.success('Request approved');
      fetchPendingApprovals(); // Refresh list
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    try {
      await managerService.rejectLeave(id, {
        reason: 'Rejected by manager',
      });
      toast.error('Request rejected');
      fetchPendingApprovals(); // Refresh list
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  // Rest of component...
};
```

---

## 5. AUTHENTICATION FLOW

### Login Integration

**File:** `frontend/src/features/auth/Login.jsx`

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authService from '../../services/authService';
import { setUser } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;
        
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Store user in Redux
        dispatch(setUser(user));
        
        // Redirect based on role
        if (user.role === 'SuperAdmin' || user.role === 'HR Administrator') {
          navigate('/admin/dashboard');
        } else if (user.role === 'HR Manager') {
          navigate('/hr/employees');
        } else {
          navigate('/ess/dashboard');
        }
        
        toast.success('Login successful!');
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Rest of component...
};
```

---

## 6. ERROR HANDLING

### Global Error Handler

**File:** `frontend/src/utils/errorHandler.js`

```javascript
import { toast } from 'react-toastify';

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        toast.error(data.message || 'Invalid request');
        break;
      case 401:
        toast.error('Unauthorized. Please login again.');
        // Redirect to login
        window.location.href = '/login';
        break;
      case 403:
        toast.error('You don\'t have permission to perform this action');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error(data.message || 'An error occurred');
    }
  } else if (error.request) {
    // Request made but no response
    toast.error('Network error. Please check your connection.');
  } else {
    // Something else happened
    toast.error('An unexpected error occurred');
  }
  
  return error;
};
```

---

## 7. TESTING

### Test API Connection

**File:** `frontend/src/utils/testApi.js`

```javascript
import api from '../services/api';

export const testApiConnection = async () => {
  try {
    const response = await api.get('/health');
    console.log('✅ API Connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ API Connection failed:', error);
    return false;
  }
};

// Test authentication
export const testAuth = async () => {
  try {
    const response = await api.get('/auth/me');
    console.log('✅ Authentication working:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    return false;
  }
};
```

---

## 8. QUICK START CHECKLIST

### ✅ Step-by-Step Integration

1. **Update API Base URL**
   ```bash
   # frontend/.env
   VITE_API_URL=http://localhost:4001/api
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start Frontend Server**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Test API Connection**
   - Open browser console
   - Navigate to any page
   - Check for API calls in Network tab

5. **Test Login**
   - Go to `/login`
   - Use credentials: `admin@hrm.com` / `Admin@123`
   - Check if redirected to dashboard

6. **Test Each Module**
   - Navigate to each page
   - Check if data loads
   - Test CRUD operations

---

## 9. COMMON ISSUES & SOLUTIONS

### Issue 1: CORS Error
**Solution:** Update backend CORS configuration
```javascript
// backend/src/config/index.js
cors: {
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
}
```

### Issue 2: 401 Unauthorized
**Solution:** Check if token is being sent
```javascript
// Check localStorage
console.log(localStorage.getItem('accessToken'));
```

### Issue 3: Network Error
**Solution:** Verify backend is running
```bash
curl http://localhost:4001/health
```

---

## 10. DEPLOYMENT

### Production Configuration

**Frontend `.env.production`:**
```env
VITE_API_URL=https://api.yourhrm.com/api
```

**Backend `.env`:**
```env
CORS_ORIGIN=https://yourhrm.com
NODE_ENV=production
```

---

## 📞 SUPPORT

If you encounter issues:
1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify backend is running
4. Check API endpoint URLs
5. Verify authentication tokens

---

**Integration Status:** Ready to implement  
**Estimated Time:** 2-4 hours for complete integration  
**Difficulty:** Intermediate
