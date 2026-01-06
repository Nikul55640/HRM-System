/**
 * Notifications Controller (Employee)
 * Handles notification management for employees
 */

import jwt from 'jsonwebtoken';
import notificationService from '../../services/notificationService.js';
import sseManager from '../../utils/sseManager.js';
import logger from '../../utils/logger.js';
import { User } from '../../models/sequelize/index.js';

/**
 * Wrapper for consistent API responses
 */
const sendResponse = (res, success, message, data = null, statusCode = 200) => {
    return res.status(statusCode).json({
        success,
        message,
        data,
    });
};

const notificationsController = {
    /**
     * SSE stream endpoint for real-time notifications
     */
    streamNotifications: async (req, res) => {
        try {
            // Manual authentication for SSE (EventSource doesn't support custom headers)
            let token = null;
            
            // Try to get token from Authorization header first
            if (req.headers.authorization) {
                token = req.headers.authorization.replace('Bearer ', '');
            }
            
            // Fallback to cookies
            if (!token && req.cookies && req.cookies.accessToken) {
                token = req.cookies.accessToken;
            }
            
            // Fallback to query parameter (for testing)
            if (!token && req.query.token) {
                token = req.query.token;
            }
            
            if (!token) {
                logger.error("SSE connection failed: No authentication token provided");
                return res.status(401).json({
                    success: false,
                    message: "Authentication required for SSE connection",
                });
            }
            
            // Verify JWT token
            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
                logger.info(`SSE JWT verification successful for user ${decoded.id}`);
            } catch (jwtError) {
                logger.error("SSE JWT verification failed:", jwtError.message);
                return res.status(401).json({
                    success: false,
                    message: "Invalid authentication token",
                });
            }
            
            // Check if user exists and is active
            const user = await User.findByPk(decoded.id);
            if (!user || !user.isActive) {
                logger.error(`SSE connection failed: User ${decoded.id} not found or inactive`);
                return res.status(401).json({
                    success: false,
                    message: "User not found or inactive",
                });
            }
            
            const userId = decoded.id;
            const userRole = decoded.role;

            logger.info(`SSE connection established for user ${userId} with role ${userRole}`);

            // Check if user already has an active connection
            if (sseManager.connections && sseManager.connections.has(userId)) {
                logger.info(`Replacing existing SSE connection for user ${userId}`);
            }

            // Set SSE headers
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': req.headers.origin || '*',
                'Access-Control-Allow-Credentials': 'true',
            });

            // Flush headers immediately
            if (res.flushHeaders) {
                res.flushHeaders();
            }

            logger.info(`SSE headers sent for user ${userId}`);

            // Add connection to SSE manager
            sseManager.addConnection(userId, res, userRole);

            // Handle client disconnect
            req.on('close', () => {
                sseManager.removeConnection(userId);
                logger.info(`SSE connection closed for user ${userId}`);
            });

            req.on('aborted', () => {
                sseManager.removeConnection(userId);
                logger.info(`SSE connection aborted for user ${userId}`);
            });

            // Keep connection alive with periodic heartbeat
            const heartbeatInterval = setInterval(() => {
                if (!res.destroyed) {
                    sseManager.sendToUser(userId, {
                        type: 'heartbeat',
                        timestamp: new Date().toISOString(),
                    });
                } else {
                    clearInterval(heartbeatInterval);
                }
            }, 30000); // Send heartbeat every 30 seconds

            // Clean up on connection close
            req.on('close', () => {
                clearInterval(heartbeatInterval);
            });

        } catch (error) {
            logger.error("Controller: SSE Stream Error", error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: "Failed to establish SSE connection",
                });
            }
        }
    },

    /**
     * Get notifications for the authenticated employee
     */
    getNotifications: async (req, res) => {
        try {
            const userId = req.user.id;
            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
                isRead: req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined,
                category: req.query.category,
                type: req.query.type,
            };

            const result = await notificationService.getUserNotifications(userId, options);

            return sendResponse(res, true, "Notifications retrieved successfully", result);
        } catch (error) {
            logger.error("Controller: Get Notifications Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Get unread notifications count
     */
    getUnreadCount: async (req, res) => {
        try {
            const userId = req.user.id;
            const count = await notificationService.getUnreadCount(userId);

            return sendResponse(res, true, "Unread count retrieved successfully", { count });
        } catch (error) {
            logger.error("Controller: Get Unread Count Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Mark notification as read
     */
    markAsRead: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const updated = await notificationService.markAsRead(id, userId);

            if (!updated) {
                return sendResponse(res, false, "Notification not found or already read", null, 404);
            }

            return sendResponse(res, true, "Notification marked as read successfully");
        } catch (error) {
            logger.error("Controller: Mark As Read Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Mark multiple notifications as read
     */
    markManyAsRead: async (req, res) => {
        try {
            const { notificationIds } = req.body;
            const userId = req.user.id;

            if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
                return sendResponse(res, false, "Invalid notification IDs", null, 400);
            }

            const updatedCount = await notificationService.markManyAsRead(notificationIds, userId);

            return sendResponse(res, true, `${updatedCount} notifications marked as read successfully`, {
                updatedCount,
            });
        } catch (error) {
            logger.error("Controller: Mark Many As Read Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async (req, res) => {
        try {
            const userId = req.user.id;
            const updatedCount = await notificationService.markAllAsRead(userId);

            return sendResponse(res, true, `${updatedCount} notifications marked as read successfully`, {
                updatedCount,
            });
        } catch (error) {
            logger.error("Controller: Mark All As Read Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Delete notification
     */
    deleteNotification: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const deleted = await notificationService.deleteNotification(id, userId);

            if (!deleted) {
                return sendResponse(res, false, "Notification not found", null, 404);
            }

            return sendResponse(res, true, "Notification deleted successfully");
        } catch (error) {
            logger.error("Controller: Delete Notification Error", error);
            return sendResponse(res, false, "Internal server error", null, 500);
        }
    },

    /**
     * Send a test notification (for debugging)
     */
    sendTestNotification: async (req, res) => {
        try {
            const userId = req.user.id;
            
            const testNotification = {
                title: 'Test Notification',
                message: 'This is a test notification to verify the system is working correctly.',
                type: 'info',
                category: 'system',
                metadata: {
                    test: true,
                    timestamp: new Date().toISOString()
                }
            };

            await notificationService.sendToUser(userId, testNotification);

            return sendResponse(res, true, "Test notification sent successfully");
        } catch (error) {
            logger.error("Controller: Send Test Notification Error", error);
            return sendResponse(res, false, "Failed to send test notification", null, 500);
        }
    }
};

export default notificationsController;