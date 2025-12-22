import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for logout endpoint to prevent spam attacks
 */
export const logoutRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5, // Limit each IP to 5 logout requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many logout requests. Please try again later.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests
  skipSuccessfulRequests: true,
  // Custom key generator to include user ID if available
  keyGenerator: (req) => {
    return req.user?.id ? `${req.ip}-${req.user.id}` : req.ip;
  },
});

/**
 * General API rate limiter
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP. Please try again later.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for auth endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again later.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Only apply to failed requests
  skipSuccessfulRequests: true,
});