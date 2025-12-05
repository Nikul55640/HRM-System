/**
 * IP Detection Service
 * Detects client IP address for attendance tracking
 */

class IPDetectionService {
  constructor() {
    this.cachedIP = null;
    this.cacheExpiry = null;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get client IP address
   * Uses ipify API as fallback
   */
  async getClientIP() {
    try {
      // Return cached IP if still valid
      if (this.cachedIP && this.cacheExpiry && Date.now() < this.cacheExpiry) {
        return this.cachedIP;
      }

      // Try to get IP from ipify API
      const response = await fetch('https://api.ipify.org?format=json', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch IP address');
      }

      const data = await response.json();
      
      if (data.ip) {
        // Cache the IP
        this.cachedIP = data.ip;
        this.cacheExpiry = Date.now() + this.cacheDuration;
        return data.ip;
      }

      return 'unavailable';
    } catch (error) {
      console.error('Error detecting IP:', error);
      return 'unavailable';
    }
  }

  /**
   * Get IP info (for debugging)
   */
  async getIPInfo() {
    try {
      const ip = await this.getClientIP();
      
      return {
        ip,
        cached: this.cachedIP === ip,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting IP info:', error);
      return {
        ip: 'unavailable',
        error: error.message,
      };
    }
  }

  /**
   * Clear cached IP
   */
  clearCache() {
    this.cachedIP = null;
    this.cacheExpiry = null;
  }

  /**
   * Check if IP detection is available
   */
  async isAvailable() {
    try {
      const ip = await this.getClientIP();
      return ip !== 'unavailable';
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export default new IPDetectionService();
