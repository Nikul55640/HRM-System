/**
 * Location and Device Information Capture Utility
 * 
 * Handles browser geolocation and device info collection for attendance tracking
 */

/**
 * Capture device information from browser
 * @returns {Object} Device information object
 */
export const captureDeviceInfo = () => {
  try {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to capture device info:', error);
    return {
      userAgent: 'Unknown',
      platform: 'Unknown',
      language: 'en-US',
      timezone: 'UTC',
      timestamp: new Date().toISOString(),
      error: 'Failed to capture device info'
    };
  }
};

/**
 * Capture GPS location from browser
 * @param {Object} options - Geolocation options
 * @returns {Promise<Object>} Location data or null if failed/denied
 */
export const captureLocation = (options = {}) => {
  return new Promise((resolve) => {
    // Default options
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 300000, // 5 minutes
      ...options
    };

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          const locationData = {
            type: 'gps',
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed
            },
            timestamp: new Date(position.timestamp).toISOString(),
            source: 'browser_geolocation'
          };

          console.log('✅ Location captured successfully:', locationData);
          resolve(locationData);
        } catch (error) {
          console.error('Error processing location data:', error);
          resolve(null);
        }
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        
        // Handle different error types
        let errorReason = 'unknown';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorReason = 'permission_denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorReason = 'position_unavailable';
            break;
          case error.TIMEOUT:
            errorReason = 'timeout';
            break;
        }

        // Return error info instead of null for debugging
        resolve({
          type: 'error',
          error: errorReason,
          message: error.message,
          timestamp: new Date().toISOString()
        });
      },
      defaultOptions
    );
  });
};

/**
 * Get IP-based location (fallback method)
 * @returns {Promise<Object>} IP-based location data
 */
export const getIPLocation = async () => {
  try {
    // You can use a free IP geolocation service
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    return {
      type: 'ip',
      coordinates: {
        latitude: data.latitude,
        longitude: data.longitude
      },
      city: data.city,
      region: data.region,
      country: data.country_name,
      timezone: data.timezone,
      source: 'ip_geolocation',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get IP location:', error);
    return null;
  }
};

/**
 * Comprehensive location capture with fallbacks
 * @param {string} workMode - Work mode (office, wfh, field, hybrid)
 * @param {Object} options - Capture options
 * @returns {Promise<Object>} Complete location and device data
 */
export const captureLocationAndDevice = async (workMode = 'office', options = {}) => {
  console.log(`🔍 Capturing location and device info for work mode: ${workMode}`);
  
  // Always capture device info
  const deviceInfo = captureDeviceInfo();
  
  // Determine if location is required based on work mode
  const locationRequired = ['office', 'field'].includes(workMode);
  const locationOptional = ['hybrid'].includes(workMode);
  const locationSkipped = ['wfh'].includes(workMode);
  
  let locationData = null;
  
  if (locationSkipped) {
    console.log('📍 Skipping location capture for WFH mode');
  } else if (locationRequired || locationOptional) {
    console.log(`📍 ${locationRequired ? 'Required' : 'Optional'} location capture for ${workMode} mode`);
    
    // Try GPS first
    locationData = await captureLocation(options);
    
    // If GPS failed and it's required, try IP fallback
    if (!locationData && locationRequired && options.allowIPFallback) {
      console.log('📍 GPS failed, trying IP fallback...');
      locationData = await getIPLocation();
    }
  }
  
  const result = {
    deviceInfo,
    location: locationData,
    workMode,
    captureTimestamp: new Date().toISOString(),
    locationRequired,
    locationCaptured: !!locationData
  };
  
  console.log('📊 Capture complete:', {
    deviceCaptured: !!deviceInfo,
    locationCaptured: !!locationData,
    workMode,
    locationRequired
  });
  
  return result;
};

/**
 * Request location permission (call this before actual capture)
 * @returns {Promise<string>} Permission state: 'granted', 'denied', 'prompt', or 'unsupported'
 */
export const requestLocationPermission = async () => {
  if (!navigator.permissions) {
    return 'unsupported';
  }
  
  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state;
  } catch (error) {
    console.error('Failed to check location permission:', error);
    return 'unsupported';
  }
};

/**
 * Check if location services are available and working
 * @returns {Promise<boolean>} True if location services are available
 */
export const checkLocationAvailability = async () => {
  if (!navigator.geolocation) {
    return false;
  }
  
  try {
    const permission = await requestLocationPermission();
    return permission !== 'denied';
  } catch (error) {
    return false;
  }
};