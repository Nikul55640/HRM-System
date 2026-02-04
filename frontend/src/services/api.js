import axios from "axios";
import { logError } from "../core/utils/errorHandler";
import { toast } from "react-toastify";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  withCredentials: true, // Enable cookies for SSE support
  headers: {
    "Content-Type": "application/json",
  },
});

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Helper function to check if request should be retried
const shouldRetry = (error) => {
  // Retry on network errors or 5xx server errors
  return (
    !error.response ||
    (error.response.status >= 500 && error.response.status < 600)
  );
};

// Helper function to delay retry
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ✅ FIX: Token getter to avoid circular dependency
let getAuthToken = () => null;
let getAuthStore = () => null;

// Export function to set the auth token getter (called from auth store)
export const setAuthTokenGetter = (tokenGetter, storeGetter) => {
  getAuthToken = tokenGetter;
  getAuthStore = storeGetter;
};

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    console.log("📌 [REQUEST] URL:", config.url);
    console.log("📌 [REQUEST] BaseURL:", config.baseURL);
    console.log("📌 [REQUEST] Sending Token:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.log("❌ [REQUEST ERROR]:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
let isRefreshing = false;
let failedQueue = [];
let lastLogoutTime = 0;
const LOGOUT_DEBOUNCE_MS = 1000; // Prevent logout calls within 1 second of each other

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    console.log("✅ [RESPONSE SUCCESS] URL:", response.config.url);
    console.log("📌 Response Data:", response.data);
    return response;
  },
  async (error) => {
    console.log("❌ [RESPONSE ERROR] Status:", error?.response?.status);
    console.log("❌ [RESPONSE ERROR] Data:", error?.response?.data);
    console.log("❌ [RESPONSE ERROR] URL:", error?.config?.url);

    const originalRequest = error.config;

    // Initialize retry count
    originalRequest._retryCount = originalRequest._retryCount || 0;

    // Handle network errors with retry logic
    if (!error.response) {
      if (shouldRetry(error) && originalRequest._retryCount < MAX_RETRIES) {
        originalRequest._retryCount++;
        logError(
          error,
          `Network error - Retry ${originalRequest._retryCount}/${MAX_RETRIES}`
        );
        await delay(RETRY_DELAY * originalRequest._retryCount);
        return api(originalRequest);
      }

      logError(error, "Network error - Max retries exceeded");
      return Promise.reject({
        message: "Network error. Please check your connection.",
        code: "NETWORK_ERROR",
      });
    }

    // Handle 401 Unauthorized - Token expired
    if (error.response.status === 401 && !originalRequest._retry) {
      // Skip token refresh for login and refresh endpoints - let them handle their own errors
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        // Don't transform login errors - pass them through as-is
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // ✅ FIX: Use getter function
      try {
        const authStore = getAuthStore();
        const refreshSuccess = await authStore.refreshToken();

        if (refreshSuccess) {
          const newToken = getAuthToken();
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Debounce logout calls to prevent spam
        const now = Date.now();
        if (now - lastLogoutTime > LOGOUT_DEBOUNCE_MS) {
          lastLogoutTime = now;
          const authStore = getAuthStore();
          authStore.logout();
          // Redirect to login page
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden
    if (error.response.status === 403) {
      const errorMsg = error.response?.data?.message || 'Access denied';
      
      // Don't redirect for certain pages/endpoints to allow proper error handling
      const currentPath = window.location.pathname;
      const isEmployeePage = currentPath.includes('/employee/');
      const isSpecialPage = currentPath.includes('/bank-verification') || 
                           currentPath.includes('/admin/') ||
                           errorMsg.includes('Employee profile');
      
      // ✅ FIX: Don't redirect for employee dashboard permission checks
      const isPermissionCheck = originalRequest.url?.includes('/employee/company/') ||
                               originalRequest.url?.includes('/employee/dashboard') ||
                               isEmployeePage;
      
      // Only show toast and redirect for critical auth failures, not permission checks
      if (!isPermissionCheck && !isSpecialPage && currentPath !== "/unauthorized") {
        toast.error(errorMsg);
        console.log('🔄 Redirecting to unauthorized page due to 403 error');
        window.location.href = "/unauthorized";
      } else {
        console.log('🚫 403 permission check - letting component handle gracefully:', originalRequest.url);
        // Don't show toast for permission checks - let component handle it
      }
    }

    // Handle 5xx server errors with retry logic
    if (
      error.response.status >= 500 &&
      originalRequest._retryCount < MAX_RETRIES
    ) {
      originalRequest._retryCount++;
      logError(
        error,
        `Server error - Retry ${originalRequest._retryCount}/${MAX_RETRIES}`
      );
      await delay(RETRY_DELAY * originalRequest._retryCount);
      return api(originalRequest);
    }

    // Show toast for 500 errors after retries exhausted
    if (error.response.status >= 500) {
      const errorMsg = error.response?.data?.message || 'Server error occurred';
      toast.error(errorMsg);
    }

    // Log error
    logError(
      error,
      `API Error - ${originalRequest.method?.toUpperCase()} ${originalRequest.url
      }`
    );

    // Don't transform login errors - pass them through as-is for proper handling
    if (originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    // Transform error response for other endpoints
    const errorResponse = {
      message:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "An error occurred",
      code: error.response?.data?.error?.code || "UNKNOWN_ERROR",
      details: error.response?.data?.error?.details || {},
      status: error.response?.status,
    };

    return Promise.reject(errorResponse);
  }
);

export default api;