/**
 * Holiday Selection List Component
 * Displays holidays with checkbox selection for template creation
 */

import React, { useState, useEffect } from 'react';
import { Badge } from '../../../../shared/ui/badge';
import { Checkbox } from '../../../../shared/ui/checkbox';
import { Button } from '../../../../shared/ui/button';
import { Input } from '../../../../shared/ui/input';
import { Label } from '../../../../shared/ui/label';
import { Alert, AlertDescription } from '../../../../shared/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { 
  Save, 
  Search, 
  Filter, 
  CheckSquare, 
  Square,
  AlertTriangle,
  Info
} from 'lucide-react';
import calendarificService from '../../../../services/calendarificService';

const HolidaySelectionList = ({ 
  holidays = [], 
  onSelectionChange,
  maxSelection = 10,
  showTemplateCreation = true,
  initialSelection = []
}) => {
  const [selectedHolidays, setSelectedHolidays] = useState(initialSelection);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [showTemplateForm, setShowTemplateForm] = useState(false);

  // Filter holidays based on search and type
  const filteredHolidays = holidays.filter(holiday => {
    const matchesSearch = holiday.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || holiday.category === filterType;
    return matchesSearch && matchesType;
  });

  // Get unique categories for filter dropdown
  const categories = [...new Set(holidays.map(h => h.category))];

  // Handle individual holiday selection
  const toggleHoliday = (holidayName) => {
    const newSelection = selectedHolidays.includes(holidayName)
      ? selectedHolidays.filter(name => name !== holidayName)
      : [...selectedHolidays, holidayName];

    // Enforce max selection limit
    if (newSelection.length <= maxSelection) {
      setSelectedHolidays(newSelection);
      onSelectionChange?.(newSelection);
    }
  };

  // Select all visible holidays
  const selectAllVisible = () => {
    const visibleHolidayNames = filteredHolidays.map(h => h.name);
    const newSelection = [...new Set([...selectedHolidays, ...visibleHolidayNames])];
    
    if (newSelection.length <= maxSelection) {
      setSelectedHolidays(newSelection);
      onSelectionChange?.(newSelection);
    }
  };

  // Clear all selections
  const clearAll = () => {
    setSelectedHolidays([]);
    onSelectionChange?.([]);
  };

  // Handle template creation
  const handleCreateTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (selectedHolidays.length === 0) {
      alert('Please select at least one holiday');
      return;
    }

    const templateData = {
      name: templateName.trim(),
      description: templateDescription.trim(),
      selectedHolidays: selectedHolidays,
      maxHolidays: maxSelection,
      holidayCount: selectedHolidays.length
    };

    // Emit template creation event
    onSelectionChange?.(selectedHolidays, templateData);
    
    // Reset form
    setTemplateName('');
    setTemplateDescription('');
    setShowTemplateForm(false);
  };

  if (!holidays || holidays.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No holidays to display</p>
        <p className="text-sm mt-2">Load a preview first to see available holidays</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection Summary */}
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-blue-600" />
          <span className="font-medium">
            {selectedHolidays.length} of {maxSelection} holidays selected
          </span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={selectAllVisible}
            disabled={filteredHolidays.length === 0}
          >
            Select All Visible
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAll}
            disabled={selectedHolidays.length === 0}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search holidays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-48">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selection Limit Warning */}
      {selectedHolidays.length >= maxSelection && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You've reached the maximum selection limit of {maxSelection} holidays. 
            Deselect some holidays to select others.
          </AlertDescription>
        </Alert>
      )}

      {/* Holiday List */}
      <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-2">
        {filteredHolidays.map((holiday, index) => {
          const formatted = calendarificService.formatHolidayForDisplay(holiday);
          const isSelected = selectedHolidays.includes(holiday.name);
          const isDisabled = !isSelected && selectedHolidays.length >= maxSelection;
          
          return (
            <div 
              key={index} 
              className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                isSelected 
                  ? 'bg-blue-50 border-blue-200' 
                  : isDisabled 
                  ? 'bg-gray-50 border-gray-200 opacity-60' 
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleHoliday(holiday.name)}
                  disabled={isDisabled}
                />
                <span className="text-lg">{formatted.categoryIcon}</span>
                <div>
                  <p className={`font-medium ${isDisabled ? 'text-gray-500' : ''}`}>
                    {holiday.name}
                  </p>
                  <p className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-muted-foreground'}`}>
                    {formatted.displayDate} • {formatted.typeLabel}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge 
                  variant="outline" 
                  style={{ 
                    backgroundColor: holiday.color + '20', 
                    color: holiday.color 
                  }}
                >
                  {holiday.category}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {holiday.sourceType}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredHolidays.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          <p>No holidays match your search criteria</p>
          <p className="text-sm mt-2">Try adjusting your search or filter</p>
        </div>
      )}

      {/* Template Creation */}
      {showTemplateCreation && selectedHolidays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save as Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!showTemplateForm ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Save your selection of {selectedHolidays.length} holidays as a reusable template
                  </p>
                </div>
                <Button onClick={() => setShowTemplateForm(true)}>
                  Create Template
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    placeholder="e.g., Company National Holidays"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="templateDescription">Description (Optional)</Label>
                  <Input
                    id="templateDescription"
                    placeholder="Brief description of this holiday selection"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateTemplate}>
                    Save Template
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowTemplateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selection Summary */}
      {selectedHolidays.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Selected Holidays:</strong> {selectedHolidays.join(', ')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default HolidaySelectionList;