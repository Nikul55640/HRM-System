import React from 'react';
import UnifiedCalendarView from '../components/UnifiedCalendarView';

const CalendarManagement = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Calendar Management</h1>
        <p className="text-gray-600 mt-1">Manage events and view calendar activities</p>
      </div>
      
      <UnifiedCalendarView 
        viewMode="list" 
        showManagementFeatures={true} 
      />
    </div>
  );
};

export default CalendarManagement;