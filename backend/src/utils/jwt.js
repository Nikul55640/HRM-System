import jwt from "jsonwebtoken";
import config from "../config/index.js";

/**
 * Generate access token
 * @param {Object} payload - Token payload
 * @returns {String} JWT access token
 */
const generateAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessTokenExpire,
  });

/**
 * Generate refresh token
 * @param {Object} payload - Token payload
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (payload) =>
  jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshTokenExpire,
  });

/**
 * Generate both access and refresh tokens
 * @param {Object} user - User object
 * @returns {Object} Object containing accessToken and refreshToken
 */
const generateTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    assignedDepartments: user.assignedDepartments || [],
    employeeId: user.employeeId, // ✅ ADD THIS
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ id: user._id });

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Verify access token
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const err = new Error("Access token has expired");
      err.name = "TokenExpiredError";
      throw err;
    }
    if (error.name === "JsonWebTokenError") {
      const err = new Error("Invalid access token");
      err.name = "JsonWebTokenError";
      throw err;
    }
    throw error;
  }
};

/**
 * Verify refresh token
 * @param {String} token - JWT refresh token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const err = new Error("Refresh token has expired");
      err.name = "TokenExpiredError";
      throw err;
    }
    if (error.name === "JsonWebTokenError") {
      const err = new Error("Invalid refresh token");
      err.name = "JsonWebTokenError";
      throw err;
    }
    throw error;
  }
};

/**
 * Decode token without verification
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => jwt.decode(token);

/**
 * Extract token from Authorization header
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} Extracted token or null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
};

/**
 * Check if token is expired
 * @param {Object} decodedToken - Decoded token payload
 * @returns {Boolean} True if token is expired
 */
const isTokenExpired = (decodedToken) => {
  if (!decodedToken || !decodedToken.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decodedToken.exp < currentTime;
};

export {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  extractTokenFromHeader,
  isTokenExpired,
};
