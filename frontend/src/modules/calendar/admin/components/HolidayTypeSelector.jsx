/**
 * Holiday Type Selector Component
 * Reusable component for selecting holiday types with checkboxes
 */

import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Checkbox } from '../../../../shared/ui/checkbox';
import { Label } from '../../../../shared/ui/label';
import { Button } from '../../../../shared/ui/button';
import { Badge } from '../../../../shared/ui/badge';
import { HOLIDAY_TYPES, DEFAULT_SELECTED_TYPES } from '../constants/holidayTypes';

const HolidayTypeSelector = ({ selectedTypes, onTypesChange, disabled = false }) => {
  const handleSelectAll = (checked) => {
    if (checked) {
      onTypesChange(HOLIDAY_TYPES.map(t => t.value));
    } else {
      onTypesChange([]);
    }
  };

  const handleTypeToggle = (typeValue, checked) => {
    if (checked) {
      onTypesChange([...selectedTypes, typeValue]);
    } else {
      onTypesChange(selectedTypes.filter(t => t !== typeValue));
    }
  };

  const handleResetToDefault = () => {
    onTypesChange(DEFAULT_SELECTED_TYPES);
  };

  return (
    <div>
      <Label>Holiday Types</Label>
      <div className="space-y-2 mt-2 border rounded-lg p-2 bg-gray-50">
        {/* Select All Header */}
        <div className="flex items-center space-x-2 mb-2 pb-2 border-b">
          <Checkbox
            id="select-all"
            checked={selectedTypes.length === HOLIDAY_TYPES.length}
            onCheckedChange={handleSelectAll}
            disabled={disabled}
          />
          <Label htmlFor="select-all" className="text-sm font-medium">
            Select All ({selectedTypes.length}/{HOLIDAY_TYPES.length})
          </Label>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetToDefault}
            disabled={disabled}
          >
            Reset to Default
          </Button>
        </div>

        {/* Individual Type Checkboxes */}
        {HOLIDAY_TYPES.map((type) => {
          const IconComponent = type.icon;
          return (
            <div 
              key={type.value} 
              className={`flex items-center space-x-2 p-2 rounded transition-colors ${
                selectedTypes.includes(type.value) 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <Checkbox
                id={type.value}
                checked={selectedTypes.includes(type.value)}
                onCheckedChange={(checked) => handleTypeToggle(type.value, checked)}
                disabled={disabled}
              />
              <div className="flex items-center gap-2 flex-1">
                <IconComponent className="w-5 h-5 text-gray-600" />
                <div>
                  <Label htmlFor={type.value} className="text-sm font-medium cursor-pointer">
                    {type.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
              </div>
              {selectedTypes.includes(type.value) && (
                <Badge variant="secondary" className="text-xs">Selected</Badge>
              )}
            </div>
          );
        })}

        {/* Validation Messages */}
        {selectedTypes.length === 0 && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Please select at least one holiday type
          </div>
        )}
        {selectedTypes.length > 0 && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {selectedTypes.length} type(s) selected: {selectedTypes.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default HolidayTypeSelector;
