import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js';

/**
 * Register a new user (for initial setup)
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const {
      email, password, role, assignedDepartments,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'A user with this email already exists.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Create user data
    const userData = {
      email,
      password,
      role: role || 'Employee',
    };

    // Add assigned departments for HR Manager
    if (role === 'HR Manager' && assignedDepartments) {
      userData.assignedDepartments = assignedDepartments;
    }

    // Create user
    const user = await User.create(userData);

    // Generate tokens
    const tokens = generateTokens(user);

    // Save refresh token to user
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Return success response
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          assignedDepartments: user.assignedDepartments,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: 'User registered successfully.',
    });
  } catch (error) {
    console.error('Register error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed.',
          details: Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
          })),
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_ERROR',
        message: 'An error occurred during registration.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Please provide email and password.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_DEACTIVATED',
          message: 'Your account has been deactivated. Please contact administrator.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Generate tokens
    const tokens = generateTokens(user);

    // Save refresh token to user
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          assignedDepartments: user.assignedDepartments,
          employeeId: user.employeeId,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: 'Login successful.',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: 'An error occurred during login.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Please provide a refresh token.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'REFRESH_TOKEN_EXPIRED',
            message: 'Refresh token has expired. Please login again.',
            timestamp: new Date().toISOString(),
          },
        });
      }

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid refresh token.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Find user and verify refresh token
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_DEACTIVATED',
          message: 'Your account has been deactivated.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Verify that the refresh token matches the one stored in database
    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid refresh token.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Update refresh token in database
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Return new tokens
    res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: 'Token refreshed successfully.',
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REFRESH_ERROR',
        message: 'An error occurred while refreshing token.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Clear refresh token from database
    await User.findByIdAndUpdate(userId, {
      $unset: { refreshToken: 1 },
    });

    res.status(200).json({
      success: true,
      message: 'Logout successful.',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGOUT_ERROR',
        message: 'An error occurred during logout.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_EMAIL',
          message: 'Please provide an email address.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // TODO: Send email with reset token
    // For now, return the token in response (in production, this should be sent via email)
    res.status(200).json({
      success: true,
      message: 'Password reset token generated.',
      data: {
        resetToken, // Remove this in production
      },
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FORGOT_PASSWORD_ERROR',
        message: 'An error occurred while processing password reset request.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Reset password
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Please provide reset token and new password.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken');

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired reset token.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Verify reset token
   
    const isValidToken = bcrypt.compareSync(resetToken, user.passwordResetToken);

    if (!isValidToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired reset token.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined; // Invalidate all refresh tokens
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password validation failed.',
          details: Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
          })),
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'RESET_PASSWORD_ERROR',
        message: 'An error occurred while resetting password.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Change password (for authenticated users)
 * POST /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Please provide current password and new password.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Find user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Current password is incorrect.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Update password
    user.password = newPassword;
    user.refreshToken = undefined; // Invalidate all refresh tokens
    await user.save();

    // Generate new tokens
    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: 'Password changed successfully.',
    });
  } catch (error) {
    console.error('Change password error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password validation failed.',
          details: Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
          })),
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'CHANGE_PASSWORD_ERROR',
        message: 'An error occurred while changing password.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('employeeId');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_USER_ERROR',
        message: 'An error occurred while fetching user profile.',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

export default {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
};
