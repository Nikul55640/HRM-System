import axios from "axios";
import store from "../store";
import { logout, updateToken } from "../store/slices/authSlice";
import { logError } from "../utils/errorHandler";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
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

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;

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

      const state = store.getState();
      const refreshToken = state.auth.refreshToken;

      if (!refreshToken) {
        store.dispatch(logout());
        // Redirect to login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:5000/api"
          }/auth/refresh`,
          { refreshToken }
        );

        const { token: newToken, refreshToken: newRefreshToken } =
          response.data;

        store.dispatch(
          updateToken({ token: newToken, refreshToken: newRefreshToken })
        );

        // Update localStorage
        localStorage.setItem("token", newToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(logout());
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        // Redirect to login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden - Redirect to unauthorized page
    if (error.response.status === 403) {
      if (window.location.pathname !== "/unauthorized") {
        window.location.href = "/unauthorized";
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

    // Log error
    logError(
      error,
      `API Error - ${originalRequest.method?.toUpperCase()} ${
        originalRequest.url
      }`
    );

    // Transform error response
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
