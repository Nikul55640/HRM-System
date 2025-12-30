import React from 'react';
import UnifiedCalendarView from '../components/UnifiedCalendarView';

const CalendarView = () => {
  return (
    <UnifiedCalendarView 
      viewMode="calendar" 
      showManagementFeatures={false} 
    />
  );
};

export default CalendarView;