/**
 * Holiday Preview List Component
 * Displays a list of holidays with formatting
 */

import React from 'react';
import { Badge } from '../../../../shared/ui/badge';
import calendarificService from '../../../../services/calendarificService';

const HolidayPreviewList = ({ holidays }) => {
  if (!holidays || holidays.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No holidays to display</p>
        <p className="text-sm mt-2">Select filters and click "Load Preview" to see holidays</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto space-y-2">
      {holidays.map((holiday, index) => {
        const formatted = calendarificService.formatHolidayForDisplay(holiday);
        
        return (
          <div 
            key={index} 
            className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{formatted.categoryIcon}</span>
              <div>
                <p className="font-medium">{holiday.name}</p>
                <p className="text-sm text-muted-foreground">
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
  );
};

export default HolidayPreviewList;
