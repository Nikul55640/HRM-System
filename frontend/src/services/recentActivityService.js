import api from './api';

class RecentActivityService {
  /**
   * Get recent activities for the current employee
   * @param {Object} options - Query options
   * @returns {Promise} API response
   */
  async getRecentActivities(options = {}) {
    try {
      const {
        limit = 10,
        days = 7,
        types = null
      } = options;

      const params = new URLSearchParams({
        limit: limit.toString(),
        days: days.toString()
      });

      if (types && Array.isArray(types)) {
        params.append('types', types.join(','));
      }

      const response = await api.get(`/employee/recent-activities?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch recent activities',
        data: []
      };
    }
  }

  /**
   * Get activity statistics for the current employee
   * @param {Object} options - Query options
   * @returns {Promise} API response
   */
  async getActivityStats(options = {}) {
    try {
      const { days = 7 } = options;

      const params = new URLSearchParams({
        days: days.toString()
      });

      const response = await api.get(`/employee/recent-activities/stats?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch activity statistics',
        data: {
          attendance: 0,
          leave: 0,
          corrections: 0,
          leads: 0,
          total: 0
        }
      };
    }
  }

  /**
   * Get activities by type
   * @param {string} type - Activity type
   * @param {Object} options - Query options
   * @returns {Promise} API response
   */
  async getActivitiesByType(type, options = {}) {
    return this.getRecentActivities({
      ...options,
      types: [type]
    });
  }

  /**
   * Get today's activities only
   * @returns {Promise} API response
   */
  async getTodayActivities() {
    return this.getRecentActivities({
      days: 1,
      limit: 20
    });
  }

  /**
   * Get this week's activities
   * @returns {Promise} API response
   */
  async getWeekActivities() {
    return this.getRecentActivities({
      days: 7,
      limit: 50
    });
  }

  /**
   * Format activity for display
   * @param {Object} activity - Activity object
   * @returns {Object} Formatted activity
   */
  formatActivity(activity) {
    return {
      ...activity,
      formattedTime: this.formatTime(activity.timestamp),
      formattedDate: this.formatDate(activity.timestamp),
      displayIcon: this.getActivityIcon(activity.icon),
      displayColor: this.getActivityColor(activity.color)
    };
  }

  /**
   * Format time for display
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Formatted time
   */
  formatTime(timestamp) {
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return '--:--';
    }
  }

  /**
   * Format date for display
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Formatted date
   */
  formatDate(timestamp) {
    try {
      return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Get icon component name for activity
   * @param {string} iconName - Icon name from backend
   * @returns {string} Icon component name
   */
  getActivityIcon(iconName) {
    const iconMap = {
      'CheckCircle': 'CheckCircle',
      'Coffee': 'Coffee',
      'Play': 'Play',
      'Timer': 'Timer',
      'Palmtree': 'Palmtree',
      'AlertCircle': 'AlertCircle',
      'Target': 'Target',
      'User': 'User',
      'FileText': 'FileText',
      'Settings': 'Settings'
    };
    return iconMap[iconName] || 'Activity';
  }

  /**
   * Get color class for activity
   * @param {string} color - Color name from backend
   * @returns {string} CSS color class
   */
  getActivityColor(color) {
    const colorMap = {
      'green': 'text-green-600 bg-green-100',
      'blue': 'text-blue-600 bg-blue-100',
      'orange': 'text-orange-600 bg-orange-100',
      'yellow': 'text-yellow-600 bg-yellow-100',
      'red': 'text-red-600 bg-red-100',
      'purple': 'text-purple-600 bg-purple-100',
      'gray': 'text-gray-600 bg-gray-100'
    };
    return colorMap[color] || 'text-gray-600 bg-gray-100';
  }

  /**
   * Group activities by date
   * @param {Array} activities - Array of activities
   * @returns {Object} Activities grouped by date
   */
  groupActivitiesByDate(activities) {
    const grouped = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.timestamp).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(this.formatActivity(activity));
    });

    return grouped;
  }

  /**
   * Filter activities by status
   * @param {Array} activities - Array of activities
   * @param {string} status - Status to filter by
   * @returns {Array} Filtered activities
   */
  filterByStatus(activities, status) {
    return activities.filter(activity => activity.status === status);
  }

  /**
   * Get activity type display name
   * @param {string} type - Activity type
   * @returns {string} Display name
   */
  getTypeDisplayName(type) {
    const typeMap = {
      'attendance': 'Attendance',
      'leave': 'Leave',
      'correction': 'Correction',
      'lead': 'Lead',
      'profile': 'Profile'
    };
    return typeMap[type] || type;
  }
}

export default new RecentActivityService();