import React from 'react';
import UnifiedCalendarView from '../components/UnifiedCalendarView';

const CalendarView = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Calendar View</h1>
        <p className="text-gray-600 mt-1">View company calendar, holidays, and events</p>
      </div>
      
      <UnifiedCalendarView 
        viewMode="calendar" 
        showManagementFeatures={false} 
      />
    </div>
  );
};

export default CalendarView;