import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Safely formats a decimal value that might be a string or number
 * @param {string|number} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted decimal string
 */
export function formatDecimal(value, decimals = 2) {
  const num = parseFloat(value || 0);
  return isNaN(num) ? '0.00' : num.toFixed(decimals);
}
