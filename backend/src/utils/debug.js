/**
 * Debug Utility for HRM System
 * Provides colored console logging with timestamps and context
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Foreground colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

const isDevelopment = process.env.NODE_ENV !== 'production';

class Debug {
  constructor() {
    this.enabled = isDevelopment;
  }

  _formatMessage(level, context, message, data) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${context}]`;

    if (data) {
      return `${prefix} ${message}\n${JSON.stringify(data, null, 2)}`;
    }
    return `${prefix} ${message}`;
  }

  _log(color, level, context, message, data) {
    if (!this.enabled) return;

    const formattedMessage = this._formatMessage(level, context, message, data);
    console.log(`${color}${formattedMessage}${colors.reset}`);
  }

  // Info - General information (Blue)
  info(context, message, data) {
    this._log(colors.blue, 'INFO', context, message, data);
  }

  // Success - Successful operations (Green)
  success(context, message, data) {
    this._log(colors.green, 'SUCCESS', context, message, data);
  }

  // Warning - Potential issues (Yellow)
  warn(context, message, data) {
    this._log(colors.yellow, 'WARN', context, message, data);
  }

  // Error - Errors and exceptions (Red)
  error(context, message, data) {
    this._log(colors.red, 'ERROR', context, message, data);
  }

  // Debug - Detailed debugging info (Cyan)
  debug(context, message, data) {
    this._log(colors.cyan, 'DEBUG', context, message, data);
  }

  // API Request logging
  request(method, path, params) {
    if (!this.enabled) return;
    console.log(`${colors.magenta}${colors.bright}→ ${method} ${path}${colors.reset}`);
    if (params && Object.keys(params).length > 0) {
      console.log(`${colors.dim}  Params: ${JSON.stringify(params)}${colors.reset}`);
    }
  }

  // API Response logging
  response(method, path, status, duration) {
    if (!this.enabled) return;
    const statusColor = status < 400 ? colors.green : colors.red;
    console.log(`${statusColor}← ${method} ${path} [${status}] (${duration}ms)${colors.reset}`);
  }

  // Database query logging
  query(operation, collection, query) {
    if (!this.enabled) return;
    console.log(`${colors.cyan}[DB] ${operation} on ${collection}${colors.reset}`);
    if (query) {
      console.log(`${colors.dim}  Query: ${JSON.stringify(query)}${colors.reset}`);
    }
  }

  // Validation error logging
  validation(field, message, value) {
    if (!this.enabled) return;
    console.log(`${colors.yellow}[VALIDATION] ${field}: ${message}${colors.reset}`);
    if (value !== undefined) {
      console.log(`${colors.dim}  Received: ${JSON.stringify(value)}${colors.reset}`);
    }
  }

  // Authentication logging
  auth(action, userId, details) {
    if (!this.enabled) return;
    console.log(`${colors.magenta}[AUTH] ${action} - User: ${userId}${colors.reset}`);
    if (details) {
      console.log(`${colors.dim}  ${JSON.stringify(details)}${colors.reset}`);
    }
  }

  // Performance timing
  time(label) {
    if (!this.enabled) return;
    console.time(`${colors.cyan}[TIMER] ${label}${colors.reset}`);
  }

  timeEnd(label) {
    if (!this.enabled) return;
    console.timeEnd(`${colors.cyan}[TIMER] ${label}${colors.reset}`);
  }

  // Separator for better readability
  separator() {
    if (!this.enabled) return;
    console.log(`${colors.dim}${'='.repeat(80)}${colors.reset}`);
  }

  // Table for structured data
  table(data) {
    if (!this.enabled) return;
    console.table(data);
  }
}

// Export singleton instance
const debug = new Debug();

export default debug;
