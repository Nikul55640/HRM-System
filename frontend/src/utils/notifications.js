import store from '../store';
import { addNotification } from '../store/slices/uiSlice';
/**
 * Notification utility service
 * Provides a simple API for showing notifications throughout the application
 */

/**
 * Show a success notification
 * @param {string} message - The message to display
 * @param {number} duration - Duration in milliseconds (default: 5000)
 */
export const showSuccess = (message, duration = 5000) => {
  store.dispatch(
    addNotification({
      type: 'success',
      message,
      duration,
    })
  );
};

/**
 * Show an error notification
 * @param {string} message - The message to display
 * @param {number} duration - Duration in milliseconds (default: 5000)
 */
export const showError = (message, duration = 5000) => {
  store.dispatch(
    addNotification({
      type: 'error',
      message,
      duration,
    })
  );
};

/**
 * Show a warning notification
 * @param {string} message - The message to display
 * @param {number} duration - Duration in milliseconds (default: 5000)
 */
export const showWarning = (message, duration = 5000) => {
  store.dispatch(
    addNotification({
      type: 'warning',
      message,
      duration,
    })
  );
};

/**
 * Show an info notification
 * @param {string} message - The message to display
 * @param {number} duration - Duration in milliseconds (default: 5000)
 */
export const showInfo = (message, duration = 5000) => {
  store.dispatch(
    addNotification({
      type: 'info',
      message,
      duration,
    })
  );
};

/**
 * Show a notification with custom type
 * @param {string} type - The notification type (success, error, warning, info)
 * @param {string} message - The message to display
 * @param {number} duration - Duration in milliseconds (default: 5000)
 */
export const showNotification = (type, message, duration = 5000) => {
  store.dispatch(
    addNotification({
      type,
      message,
      duration,
    })
  );
};

// Export all notification functions
export default {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  show: showNotification,
};
