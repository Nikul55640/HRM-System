import logger from './logger.js';

/**
 * Server-Sent Events Manager
 * Manages SSE connections and broadcasts notifications
 */
class SSEManager {
  constructor() {
    this.connections = new Map(); // userId -> { res, role, lastPing }
    this.roleConnections = new Map(); // role -> Set of userIds
    
    // Cleanup inactive connections every 30 seconds
    setInterval(() => this.cleanupConnections(), 30000);
  }

  /**
   * Add a new SSE connection
   */
  addConnection(userId, res, userRole) {
    try {
      // Remove existing connection if any
      this.removeConnection(userId);

      // Store connection
      this.connections.set(userId, {
        res,
        role: userRole,
        lastPing: Date.now(),
      });

      // Add to role-based connections
      if (!this.roleConnections.has(userRole)) {
        this.roleConnections.set(userRole, new Set());
      }
      this.roleConnections.get(userRole).add(userId);

      logger.info(`SSE connection added for user ${userId} with role ${userRole}`);
      
      // Send initial connection confirmation
      const sent = this.sendToUser(userId, {
        type: 'connection',
        message: 'Connected to notification stream',
        timestamp: new Date().toISOString(),
      });

      if (!sent) {
        logger.error(`Failed to send initial connection message to user ${userId}`);
        // Remove the connection if we can't send to it
        this.removeConnection(userId);
      }
    } catch (error) {
      logger.error(`Error adding SSE connection for user ${userId}:`, error);
      // Clean up on error
      this.removeConnection(userId);
    }
  }

  /**
   * Remove SSE connection
   */
  removeConnection(userId) {
    const connection = this.connections.get(userId);
    if (connection) {
      // Remove from role connections
      const roleSet = this.roleConnections.get(connection.role);
      if (roleSet) {
        roleSet.delete(userId);
        if (roleSet.size === 0) {
          this.roleConnections.delete(connection.role);
        }
      }

      // Close connection safely
      try {
        if (!connection.res.destroyed && !connection.res.headersSent) {
          connection.res.end();
        }
      } catch (error) {
        // Connection might already be closed, ignore error
        logger.debug(`Error closing SSE connection for user ${userId}:`, error.message);
      }

      this.connections.delete(userId);
      logger.info(`SSE connection removed for user ${userId}`);
    }
  }

  /**
   * Send notification to specific user
   */
  sendToUser(userId, data) {
    const connection = this.connections.get(userId);
    if (connection && !connection.res.destroyed) {
      try {
        const sseData = `data: ${JSON.stringify(data)}\n\n`;
        connection.res.write(sseData);
        connection.lastPing = Date.now();
        logger.debug(`SSE message sent to user ${userId}: ${data.type}`);
        return true;
      } catch (error) {
        logger.error(`Failed to send SSE to user ${userId}:`, error);
        this.removeConnection(userId);
        return false;
      }
    } else {
      logger.warn(`User ${userId} not connected to SSE or connection destroyed`);
      return false;
    }
  }

  /**
   * Send notification to all users with specific role
   */
  sendToRole(role, data) {
    const userIds = this.roleConnections.get(role);
    if (!userIds) return 0;

    let sentCount = 0;
    userIds.forEach(userId => {
      if (this.sendToUser(userId, data)) {
        sentCount++;
      }
    });

    logger.info(`Sent SSE notification to ${sentCount} users with role ${role}`);
    return sentCount;
  }

  /**
   * Send notification to multiple roles
   */
  sendToRoles(roles, data) {
    let totalSent = 0;
    roles.forEach(role => {
      totalSent += this.sendToRole(role, data);
    });
    return totalSent;
  }

  /**
   * Broadcast to all connected users
   */
  broadcast(data) {
    let sentCount = 0;
    this.connections.forEach((connection, userId) => {
      if (this.sendToUser(userId, data)) {
        sentCount++;
      }
    });

    logger.info(`Broadcasted SSE notification to ${sentCount} users`);
    return sentCount;
  }

  /**
   * Send heartbeat to keep connections alive
   */
  sendHeartbeat() {
    const heartbeatData = {
      type: 'heartbeat',
      timestamp: new Date().toISOString(),
    };

    this.connections.forEach((connection, userId) => {
      this.sendToUser(userId, heartbeatData);
    });
  }

  /**
   * Clean up inactive connections
   */
  cleanupConnections() {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    this.connections.forEach((connection, userId) => {
      if (now - connection.lastPing > timeout || connection.res.destroyed) {
        this.removeConnection(userId);
      }
    });
  }

  /**
   * Get connection statistics
   */
  getStats() {
    const roleStats = {};
    this.roleConnections.forEach((userIds, role) => {
      roleStats[role] = userIds.size;
    });

    return {
      totalConnections: this.connections.size,
      roleBreakdown: roleStats,
    };
  }
}

// Export singleton instance
export default new SSEManager();