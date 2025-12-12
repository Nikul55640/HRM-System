import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {String} dirty - Potentially unsafe HTML string
 * @param {Object} config - DOMPurify configuration options
 * @returns {String} Sanitized HTML string
 */
export const sanitizeHTML = (dirty, config = {}) => {
  const defaultConfig = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ...config,
  };

  return DOMPurify.sanitize(dirty, defaultConfig);
};

/**
 * Sanitize user input by removing all HTML tags
 * @param {String} input - User input string
 * @returns {String} Plain text without HTML
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

/**
 * Escape special characters in string for safe display
 * @param {String} str - String to escape
 * @returns {String} Escaped string
 */
export const escapeHTML = (str) => {
  if (typeof str !== 'string') return str;
  
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * @param {String} url - URL to sanitize
 * @returns {String} Safe URL or empty string
 */
export const sanitizeURL = (url) => {
  if (typeof url !== 'string') return '';
  
  const trimmedURL = url.trim().toLowerCase();
  
  // Block dangerous protocols
  if (
    trimmedURL.startsWith('javascript:') ||
    trimmedURL.startsWith('data:') ||
    trimmedURL.startsWith('vbscript:')
  ) {
    return '';
  }
  
  return url;
};

/**
 * Create a safe component for rendering user-generated HTML
 * @param {String} html - HTML content to render
 * @param {Object} config - DOMPurify configuration
 * @returns {Object} Props for dangerouslySetInnerHTML
 */
export const createSafeHTML = (html, config = {}) => {
  return {
    __html: sanitizeHTML(html, config),
  };
};

export default {
  sanitizeHTML,
  sanitizeInput,
  escapeHTML,
  sanitizeURL,
  createSafeHTML,
};
