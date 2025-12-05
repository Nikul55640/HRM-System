/**
 * IP Service
 * Handles IP address capture and encryption for privacy protection
 */

import crypto from 'crypto';

class IPService {
  constructor() {
    // Use environment variable or default key (should be set in production)
    this.encryptionKey = process.env.IP_ENCRYPTION_KEY || 'default-32-char-encryption-key!';
    
    // Ensure key is 32 bytes for AES-256
    this.key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    this.algorithm = 'aes-256-cbc';
  }

  /**
   * Capture IP address from request
   * Handles various proxy scenarios
   */
  captureIP(req) {
    try {
      // Check for IP from various headers (proxy scenarios)
      const ip =
        req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        'unavailable';

      // Clean IPv6 localhost to IPv4
      if (ip === '::1' || ip === '::ffff:127.0.0.1') {
        return '127.0.0.1';
      }

      // Remove IPv6 prefix if present
      return ip.replace('::ffff:', '');
    } catch (error) {
      console.error('Error capturing IP:', error);
      return 'unavailable';
    }
  }

  /**
   * Encrypt IP address for storage
   */
  encryptIP(ipAddress) {
    try {
      if (!ipAddress || ipAddress === 'unavailable') {
        return 'unavailable';
      }

      // Generate random IV for each encryption
      const iv = crypto.randomBytes(16);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

      // Encrypt the IP
      let encrypted = cipher.update(ipAddress, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Return IV + encrypted data (IV needed for decryption)
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Error encrypting IP:', error);
      return 'encryption_failed';
    }
  }

  /**
   * Decrypt IP address for display
   */
  decryptIP(encryptedIP) {
    try {
      if (!encryptedIP || encryptedIP === 'unavailable' || encryptedIP === 'encryption_failed') {
        return encryptedIP;
      }

      // Split IV and encrypted data
      const parts = encryptedIP.split(':');
      if (parts.length !== 2) {
        return 'invalid_format';
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

      // Decrypt the IP
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Error decrypting IP:', error);
      return 'decryption_failed';
    }
  }

  /**
   * Capture and encrypt IP in one step
   */
  captureAndEncryptIP(req) {
    const ip = this.captureIP(req);
    return this.encryptIP(ip);
  }

  /**
   * Get IP info (for logging/debugging - not encrypted)
   */
  getIPInfo(req) {
    return {
      ip: this.captureIP(req),
      headers: {
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip'],
      },
      remoteAddress: req.connection?.remoteAddress || req.socket?.remoteAddress,
    };
  }

  /**
   * Validate IP address format
   */
  isValidIP(ip) {
    if (!ip || ip === 'unavailable') return false;

    // IPv4 regex
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    
    // IPv6 regex (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Mask IP for display (show only first two octets)
   */
  maskIP(ip) {
    if (!ip || ip === 'unavailable') return ip;

    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }

    return 'xxx.xxx.xxx.xxx';
  }
}

// Export singleton instance
export default new IPService();
