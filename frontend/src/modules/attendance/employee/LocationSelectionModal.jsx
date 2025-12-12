import React, { useState } from 'react';
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
import { MapPin, Building2, Home, Users } from 'lucide-react';

const LocationSelectionModal = ({ isOpen, onClose, onConfirm, loading = false }) => {
  const [workLocation, setWorkLocation] = useState('office');
  const [locationDetails, setLocationDetails] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    // Validate
    if (!workLocation) {
      setError('Please select a work location');
      return;
    }

    if (workLocation === 'client_site' && !locationDetails.trim()) {
      setError('Please enter client site details');
      return;
    }

    // Call confirm callback
    onConfirm({
      workLocation,
      locationDetails: workLocation === 'client_site' ? locationDetails.trim() : null,
    });
  };

  const handleClose = () => {
    if (!loading) {
      setWorkLocation('office');
      setLocationDetails('');
      setError('');
      onClose();
    }
  };

  const locationOptions = [
    {
      value: 'office',
      label: 'Office',
      description: 'Working from company office',
      icon: Building2,
    },
    {
      value: 'wfh',
      label: 'Work From Home',
      description: 'Working remotely from home',
      icon: Home,
    },
    {
      value: 'client_site',
      label: 'Client Site',
      description: 'Working at client location',
      icon: Users,
    },
  ];

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
          <RadioGroup value={workLocation} onValueChange={setWorkLocation}>
            {locationOptions.map((option) => {
              const Icon = option.icon;
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
                      <Icon className="h-4 w-4" />
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

          {/* Conditional input for client site */}
          {workLocation === 'client_site' && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="locationDetails">
                Client Site Details <span className="text-red-500">*</span>
              </Label>
              <Input
                id="locationDetails"
                placeholder="Enter client name or location"
                value={locationDetails}
                onChange={(e) => {
                  setLocationDetails(e.target.value);
                  setError('');
                }}
                disabled={loading}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                Please specify the client site location
              </p>
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
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Confirming...' : 'Confirm & Clock In'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSelectionModal;
