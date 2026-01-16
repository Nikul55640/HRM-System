import { Op } from 'sequelize';
import { 
  AttendanceRecord, 
  LeaveRequest, 
  AttendanceCorrectionRequest,
  Employee,
  User,
  Lead,
  Notification
} from '../../models/sequelize/index.js';

class RecentActivityService {
  /**
   * Get recent activities for an employee
   * @param {number} employeeId - Employee ID
   * @param {object} options - Query options
   * @returns {Promise<Array>} Recent activities
   */
  async getRecentActivities(employeeId, options = {}) {
    const {
      limit = 10,
      days = 7,
      types = null // Array of activity types to filter
    } = options;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const activities = [];

      // Get attendance activities
      if (!types || types.includes('attendance')) {
        const attendanceActivities = await this.getAttendanceActivities(employeeId, startDate, limit);
        activities.push(...attendanceActivities);
      }

      // Get leave activities
      if (!types || types.includes('leave')) {
        const leaveActivities = await this.getLeaveActivities(employeeId, startDate, limit);
        activities.push(...leaveActivities);
      }

      // Get attendance correction activities
      if (!types || types.includes('correction')) {
        const correctionActivities = await this.getCorrectionActivities(employeeId, startDate, limit);
        activities.push(...correctionActivities);
      }

      // Get lead activities (if employee has access)
      if (!types || types.includes('lead')) {
        const leadActivities = await this.getLeadActivities(employeeId, startDate, limit);
        activities.push(...leadActivities);
      }

      // Get profile update activities
      if (!types || types.includes('profile')) {
        const profileActivities = await this.getProfileActivities(employeeId, startDate, limit);
        activities.push(...profileActivities);
      }

      // Sort by timestamp and limit results
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);

      return {
        success: true,
        data: sortedActivities,
        total: sortedActivities.length
      };

    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return {
        success: false,
        error: 'Failed to fetch recent activities',
        data: []
      };
    }
  }

  /**
   * Get attendance-related activities
   */
  async getAttendanceActivities(employeeId, startDate, limit) {
    try {
      const records = await AttendanceRecord.findAll({
        where: {
          employeeId,
          date: {
            [Op.gte]: startDate
          }
        },
        order: [['date', 'DESC']],
        limit: Math.ceil(limit / 2) // Allocate portion of limit
      });

      const activities = [];

      records.forEach(record => {
        // Parse sessions if available
        if (record.sessions && Array.isArray(record.sessions)) {
          record.sessions.forEach(session => {
            if (session.checkIn) {
              activities.push({
                id: `attendance-checkin-${record.id}-${session.checkIn}`,
                type: 'attendance',
                subType: 'check_in',
                title: 'Clocked In',
                description: `Started work session at ${session.location || 'Office'}`,
                timestamp: session.checkIn,
                icon: 'CheckCircle',
                color: 'green',
                status: 'completed',
                metadata: {
                  location: session.location,
                  recordId: record.id
                }
              });
            }

            if (session.checkOut) {
              activities.push({
                id: `attendance-checkout-${record.id}-${session.checkOut}`,
                type: 'attendance',
                subType: 'check_out',
                title: 'Clocked Out',
                description: `Ended work session (${this.calculateDuration(session.checkIn, session.checkOut)})`,
                timestamp: session.checkOut,
                icon: 'CheckCircle',
                color: 'blue',
                status: 'completed',
                metadata: {
                  duration: this.calculateDuration(session.checkIn, session.checkOut),
                  recordId: record.id
                }
              });
            }

            // Add break activities
            if (session.breaks && Array.isArray(session.breaks)) {
              session.breaks.forEach(breakItem => {
                if (breakItem.startTime) {
                  activities.push({
                    id: `break-start-${record.id}-${breakItem.startTime}`,
                    type: 'attendance',
                    subType: 'break_start',
                    title: 'Break Started',
                    description: `Started ${breakItem.type || 'break'}`,
                    timestamp: breakItem.startTime,
                    icon: 'Coffee',
                    color: 'orange',
                    status: 'completed',
                    metadata: {
                      breakType: breakItem.type,
                      recordId: record.id
                    }
                  });
                }

                if (breakItem.endTime) {
                  activities.push({
                    id: `break-end-${record.id}-${breakItem.endTime}`,
                    type: 'attendance',
                    subType: 'break_end',
                    title: 'Break Ended',
                    description: `Resumed work after ${breakItem.type || 'break'}`,
                    timestamp: breakItem.endTime,
                    icon: 'Play',
                    color: 'green',
                    status: 'completed',
                    metadata: {
                      breakType: breakItem.type,
                      duration: this.calculateDuration(breakItem.startTime, breakItem.endTime),
                      recordId: record.id
                    }
                  });
                }
              });
            }
          });
        } else if (record.checkIn) {
          // Legacy format
          activities.push({
            id: `attendance-legacy-${record.id}`,
            type: 'attendance',
            subType: 'check_in',
            title: 'Clocked In',
            description: 'Started work session',
            timestamp: record.checkIn,
            icon: 'CheckCircle',
            color: 'green',
            status: 'completed',
            metadata: {
              recordId: record.id
            }
          });

          if (record.checkOut) {
            activities.push({
              id: `attendance-legacy-out-${record.id}`,
              type: 'attendance',
              subType: 'check_out',
              title: 'Clocked Out',
              description: `Ended work session (${this.calculateDuration(record.checkIn, record.checkOut)})`,
              timestamp: record.checkOut,
              icon: 'CheckCircle',
              color: 'blue',
              status: 'completed',
              metadata: {
                duration: this.calculateDuration(record.checkIn, record.checkOut),
                recordId: record.id
              }
            });
          }
        }
      });

      return activities;
    } catch (error) {
      console.error('Error fetching attendance activities:', error);
      return [];
    }
  }

  /**
   * Get leave-related activities
   */
  async getLeaveActivities(employeeId, startDate, limit) {
    try {
      const leaveRequests = await LeaveRequest.findAll({
        where: {
          employeeId,
          createdAt: {
            [Op.gte]: startDate
          }
        },
        order: [['createdAt', 'DESC']],
        limit: Math.ceil(limit / 4)
      });

      return leaveRequests.map(leave => ({
        id: `leave-${leave.id}`,
        type: 'leave',
        subType: leave.status,
        title: `Leave Request ${this.capitalizeFirst(leave.status)}`,
        description: `${leave.leaveType} leave from ${this.formatDate(leave.startDate)} to ${this.formatDate(leave.endDate)}`,
        timestamp: leave.updatedAt || leave.createdAt,
        icon: 'Palmtree',
        color: this.getLeaveStatusColor(leave.status),
        status: leave.status,
        metadata: {
          leaveType: leave.leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate,
          days: leave.totalDays,
          reason: leave.reason,
          leaveId: leave.id
        }
      }));
    } catch (error) {
      console.error('Error fetching leave activities:', error);
      return [];
    }
  }

  /**
   * Get attendance correction activities
   */
  async getCorrectionActivities(employeeId, startDate, limit) {
    try {
      const corrections = await AttendanceCorrectionRequest.findAll({
        where: {
          employeeId,
          createdAt: {
            [Op.gte]: startDate
          }
        },
        order: [['createdAt', 'DESC']],
        limit: Math.ceil(limit / 4)
      });

      return corrections.map(correction => ({
        id: `correction-${correction.id}`,
        type: 'correction',
        subType: correction.status,
        title: `Attendance Correction ${this.capitalizeFirst(correction.status)}`,
        description: `Requested correction for ${this.formatDate(correction.date)} - ${correction.reason}`,
        timestamp: correction.updatedAt || correction.createdAt,
        icon: 'AlertCircle',
        color: this.getCorrectionStatusColor(correction.status),
        status: correction.status,
        metadata: {
          date: correction.date,
          reason: correction.reason,
          correctionId: correction.id
        }
      }));
    } catch (error) {
      console.error('Error fetching correction activities:', error);
      return [];
    }
  }

  /**
   * Get lead-related activities
   */
  async getLeadActivities(employeeId, startDate, limit) {
    try {
      const leads = await Lead.findAll({
        where: {
          assignedTo: employeeId,
          updatedAt: {
            [Op.gte]: startDate
          }
        },
        order: [['updatedAt', 'DESC']],
        limit: Math.ceil(limit / 4)
      });

      return leads.map(lead => ({
        id: `lead-${lead.id}`,
        type: 'lead',
        subType: lead.status,
        title: `Lead ${this.capitalizeFirst(lead.status)}`,
        description: `${lead.companyName || lead.contactName} - ${lead.status}`,
        timestamp: lead.updatedAt,
        icon: 'Target',
        color: this.getLeadStatusColor(lead.status),
        status: lead.status,
        metadata: {
          leadId: lead.id,
          companyName: lead.companyName,
          contactName: lead.contactName,
          value: lead.estimatedValue
        }
      }));
    } catch (error) {
      console.error('Error fetching lead activities:', error);
      return [];
    }
  }

  /**
   * Get profile update activities
   */
  async getProfileActivities(employeeId, startDate, limit) {
    try {
      // This would typically come from an audit log
      // For now, we'll return empty array or implement basic tracking
      return [];
    } catch (error) {
      console.error('Error fetching profile activities:', error);
      return [];
    }
  }

  // Helper methods
  calculateDuration(start, end) {
    if (!start || !end) return 'Unknown';
    
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime - startTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  getLeaveStatusColor(status) {
    const colors = {
      pending: 'yellow',
      approved: 'green',
      rejected: 'red',
      cancelled: 'gray'
    };
    return colors[status] || 'blue';
  }

  getCorrectionStatusColor(status) {
    const colors = {
      pending: 'yellow',
      approved: 'green',
      rejected: 'red'
    };
    return colors[status] || 'blue';
  }

  getLeadStatusColor(status) {
    const colors = {
      new: 'blue',
      contacted: 'yellow',
      qualified: 'green',
      proposal: 'purple',
      won: 'green',
      lost: 'red'
    };
    return colors[status] || 'blue';
  }
}

export default new RecentActivityService();







