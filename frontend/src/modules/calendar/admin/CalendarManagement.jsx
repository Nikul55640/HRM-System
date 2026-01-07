import React from 'react';
import { Card, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Calendar, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import UnifiedCalendarView from '../components/UnifiedCalendarView';

const CalendarManagement = () => {
  return (
    <div className="space-y-6">
    
      <UnifiedCalendarView 
        viewMode="list" 
        showManagementFeatures={true} 
      />
    </div>
  );
};

export default CalendarManagement;