/**
 * Test script for location and device capture functionality
 * 
 * Run this in browser console to test the capture functionality:
 * import('./utils/testLocationCapture.js').then(m => m.testLocationCapture())
 */

import { captureLocationAndDevice, requestLocationPermission, checkLocationAvailability } from './locationDeviceCapture.js';

export const testLocationCapture = async () => {
  console.log('🧪 Testing Location and Device Capture...');
  
  try {
    // Test 1: Check location availability
    console.log('\n1️⃣ Checking location availability...');
    const isAvailable = await checkLocationAvailability();
    console.log('Location available:', isAvailable);
    
    // Test 2: Check permission status
    console.log('\n2️⃣ Checking location permission...');
    const permission = await requestLocationPermission();
    console.log('Permission status:', permission);
    
    // Test 3: Test different work modes
    const workModes = ['office', 'wfh', 'field', 'hybrid'];
    
    for (const workMode of workModes) {
      console.log(`\n3️⃣ Testing ${workMode} mode...`);
      
      const result = await captureLocationAndDevice(workMode, {
        allowIPFallback: true,
        timeout: 5000
      });
      
      console.log(`${workMode} result:`, {
        deviceCaptured: !!result.deviceInfo,
        locationCaptured: !!result.location,
        locationRequired: result.locationRequired,
        workMode: result.workMode
      });
      
      if (result.deviceInfo) {
        console.log(`${workMode} device info keys:`, Object.keys(result.deviceInfo));
      }
      
      if (result.location) {
        console.log(`${workMode} location type:`, result.location.type);
        if (result.location.coordinates) {
          console.log(`${workMode} has coordinates:`, !!result.location.coordinates.latitude);
        }
      }
    }
    
    console.log('\n✅ Location capture test completed!');
    
  } catch (error) {
    console.error('❌ Location capture test failed:', error);
  }
};

export const testClockInPayload = async (workMode = 'office') => {
  console.log(`🧪 Testing complete clock-in payload for ${workMode}...`);
  
  try {
    const captureData = await captureLocationAndDevice(workMode, {
      allowIPFallback: true,
      timeout: 8000
    });

    const clockInPayload = {
      workMode: workMode,
      workLocation: workMode,
      locationDetails: workMode === 'field' ? 'Test Field Location' : null,
      location: captureData.location,
      deviceInfo: captureData.deviceInfo,
      captureMetadata: {
        locationRequired: captureData.locationRequired,
        locationCaptured: captureData.locationCaptured,
        captureTimestamp: captureData.captureTimestamp
      }
    };

    console.log('📦 Complete clock-in payload:', clockInPayload);
    console.log('📊 Payload analysis:', {
      hasWorkMode: !!clockInPayload.workMode,
      hasLocation: !!clockInPayload.location,
      hasDeviceInfo: !!clockInPayload.deviceInfo,
      locationRequired: clockInPayload.captureMetadata.locationRequired,
      locationCaptured: clockInPayload.captureMetadata.locationCaptured,
      payloadSize: JSON.stringify(clockInPayload).length + ' bytes'
    });

    return clockInPayload;
    
  } catch (error) {
    console.error('❌ Clock-in payload test failed:', error);
    return null;
  }
};

// Auto-run basic test if in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Development mode detected - location capture utilities loaded');
  console.log('Run testLocationCapture() or testClockInPayload() to test functionality');
}