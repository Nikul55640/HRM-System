import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/ui/dialog';
import { Button } from '../../../shared/ui/button';
import { Label } from '../../../shared/ui/label';
import { Input } from '../../../shared/ui/input';
import { RadioGroup, RadioGroupItem } from '../../../shared/ui/radio-group';
import { MapPin, Building2, Home, Users, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../../../services/api';
import { captureLocationAndDevice, requestLocationPermission } from '../../../utils/locationDeviceCapture';

const LocationSelectionModal = ({ isOpen, onClose, onConfirm, loading = false }) => {
  const [workLocation, setWorkLocation] = useState('office');
  const [locationDetails, setLocationDetails] = useState('');
  const [error, setError] = useState('');
  const [locationOptions, setLocationOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [capturingLocation, setCapturingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState('unknown');
  const [locationStatus, setLocationStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadWorkLocations();
      checkLocationPermission();
    }
  }, [isOpen]);

  const checkLocationPermission = async () => {
    try {
      const permission = await requestLocationPermission();
      setLocationPermission(permission);
    } catch (error) {
      setLocationPermission('unsupported');
    }
  };

  const loadWorkLocations = async () => {
    try {
      setLoadingOptions(true);
      const response = await api.get('/admin/work-locations');
      if (response.data.success) {
        setLocationOptions(response.data.data);
      }
    } catch (error) {
      console.error('Error loading work locations:', error);
      // Fallback to hardcoded options
      setLocationOptions([
        {
          value: 'office',
          label: 'Office',
          description: 'Working from company office',
          icon: 'Building2',
        },
        {
          value: 'wfh',
          label: 'Work From Home',
          description: 'Working remotely from home',
          icon: 'Home',
        },
        {
          value: 'hybrid',
          label: 'Hybrid',
          description: 'Combination of office and remote work',
          icon: 'Users',
        },
        {
          value: 'field',
          label: 'Field Work',
          description: 'Working at client location or field site',
          icon: 'MapPin',
          requiresDetails: true
        },
      ]);
    } finally {
      setLoadingOptions(false);
    }
  };

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'Building2': return Building2;
      case 'Home': return Home;
      case 'Users': return Users;
      case 'MapPin': return MapPin;
      default: return Building2;
    }
  };

  const handleConfirm = async () => {
    // Validate
    if (!workLocation) {
      setError('Please select a work location');
      return;
    }

    const selectedOption = locationOptions.find(opt => opt.value === workLocation);
    if (selectedOption?.requiresDetails && !locationDetails.trim()) {
      setError('Please enter field work location details');
      return;
    }

    try {
      setCapturingLocation(true);
      setError('');
      setLocationStatus('Capturing location and device information...');

      // 🔥 CAPTURE LOCATION AND DEVICE INFO
      const captureData = await captureLocationAndDevice(workLocation, {
        allowIPFallback: true,
        timeout: 8000
      });

      // Prepare the complete data payload
      const clockInData = {
        workMode: workLocation,
        workLocation: workLocation, // Keep for backward compatibility
        locationDetails: selectedOption?.requiresDetails ? locationDetails.trim() : null,
        location: captureData.location,
        deviceInfo: captureData.deviceInfo,
        captureMetadata: {
          locationRequired: captureData.locationRequired,
          locationCaptured: captureData.locationCaptured,
          captureTimestamp: captureData.captureTimestamp
        }
      };

      console.log('🔍 Complete clock-in data:', clockInData);

      // Show success status
      if (captureData.locationCaptured) {
        setLocationStatus('✅ Location and device info captured successfully');
      } else if (captureData.locationRequired) {
        setLocationStatus('⚠️ Location capture failed, but proceeding...');
      } else {
        setLocationStatus('✅ Device info captured (location not required)');
      }

      // Small delay to show the status
      setTimeout(() => {
        onConfirm(clockInData);
      }, 1000);

    } catch (error) {
      console.error('Failed to capture location/device info:', error);
      setError('Failed to capture location information. Please try again.');
      setLocationStatus(null);
    } finally {
      setCapturingLocation(false);
    }
  };

  const handleClose = () => {
    if (!loading && !capturingLocation) {
      setWorkLocation('office');
      setLocationDetails('');
      setError('');
      setLocationStatus(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Select Work Location
          </DialogTitle>
          <DialogDescription>
            Please select where you'll be working today
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loadingOptions ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <RadioGroup value={workLocation} onValueChange={setWorkLocation}>
              {locationOptions.map((option) => {
                const IconComponent = getIconComponent(option.icon);
                return (
                  <div
                    key={option.value}
                    className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                      workLocation === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setWorkLocation(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="flex-1">
                      <Label
                        htmlFor={option.value}
                        className="flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <IconComponent className="h-4 w-4" />
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          )}

          {/* Location Permission Status */}
          {!loadingOptions && ['office', 'field', 'hybrid'].includes(workLocation) && (
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Location Services</span>
              </div>
              <div className={`p-2 rounded text-xs ${
                locationPermission === 'granted' ? 'bg-green-50 text-green-700' :
                locationPermission === 'denied' ? 'bg-red-50 text-red-700' :
                'bg-yellow-50 text-yellow-700'
              }`}>
                {locationPermission === 'granted' && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Location access granted - GPS coordinates will be captured
                  </div>
                )}
                {locationPermission === 'denied' && (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Location access denied - only device info will be captured
                  </div>
                )}
                {locationPermission === 'prompt' && (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Location permission will be requested when you clock in
                  </div>
                )}
                {locationPermission === 'unsupported' && (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Location services not supported by your browser
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Conditional input for field work */}
          {workLocation === 'field' && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="locationDetails">
                Field Work Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="locationDetails"
                placeholder="Enter client name or field location"
                value={locationDetails}
                onChange={(e) => {
                  setLocationDetails(e.target.value);
                  setError('');
                }}
                disabled={loading}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                Please specify the field work location
              </p>
            </div>
          )}

          {/* Capturing Status */}
          {capturingLocation && (
            <div className="text-sm bg-blue-50 border border-blue-200 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium">Capturing Information...</span>
              </div>
              {locationStatus && (
                <div className="mt-2 text-xs text-blue-600">
                  {locationStatus}
                </div>
              )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading || capturingLocation}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleConfirm} 
            disabled={loading || capturingLocation}
          >
            {capturingLocation ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Capturing...
              </>
            ) : loading ? (
              'Confirming...'
            ) : (
              'Confirm & Clock In'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSelectionModal;
