import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Status mappings for consistent badge colors
export const statusMappings = {
  // Leave statuses
  pending: { variant: 'pending', label: 'Pending' },
  approved: { variant: 'approved', label: 'Approved' },
  rejected: { variant: 'rejected', label: 'Rejected' },
  cancelled: { variant: 'cancelled', label: 'Cancelled' },
  
  // Attendance statuses
  present: { variant: 'present', label: 'Present' },
  absent: { variant: 'absent', label: 'Absent' },
  late: { variant: 'late', label: 'Late' },
  'half-day': { variant: 'half-day', label: 'Half Day' },
  'on-leave': { variant: 'on-leave', label: 'On Leave' },
  
  // User statuses
  active: { variant: 'active', label: 'Active' },
  inactive: { variant: 'inactive', label: 'Inactive' },
  terminated: { variant: 'terminated', label: 'Terminated' },
  
  // Priority levels
  low: { variant: 'low', label: 'Low' },
  medium: { variant: 'medium', label: 'Medium' },
  high: { variant: 'high', label: 'High' },
  urgent: { variant: 'urgent', label: 'Urgent' }
};

// Legacy status color mapping (for backward compatibility)
export const getStatusColor = (status) => {
  const statusColors = {
    approved: 'green',
    pending: 'yellow',
    rejected: 'red',
    cancelled: 'gray',
    present: 'green',
    absent: 'red',
    late: 'orange',
    'half-day': 'blue',
    'on-leave': 'purple',
    active: 'green',
    inactive: 'gray',
    terminated: 'red'
  };
  
  return statusColors[status?.toLowerCase()] || 'gray';
};

// Format date consistently
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString('en-US', defaultOptions);
};

// Format time consistently
export const formatTime = (time) => {
  if (!time) return 'N/A';
  
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Format date and time together
export const formatDateTime = (dateTime) => {
  if (!dateTime) return 'N/A';
  return new Date(dateTime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  if (!amount && amount !== 0) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

// Calculate duration between dates
export const calculateDuration = (startDate, endDate, isHalfDay = false) => {
  if (!startDate || !endDate) return 'N/A';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (isHalfDay && diffDays === 1) {
    return '0.5 days';
  }

  return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
};

// Get initials from name
export const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}`;
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Format decimal numbers
export const formatDecimal = (value, decimalPlaces = 2) => {
  if (!value && value !== 0) return '0.00';
  return Number(value).toFixed(decimalPlaces);
};