import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';
import { X, Clock, MapPin, Calendar } from 'lucide-react';
import { getEventClasses, renderEventIcon, getEventLabel } from '../../../core/utils/calendarEventTypes';

const DayEventsDrawer = ({ date, events, onClose }) => {
  // 🔍 DEBUG: Log drawer data
  console.log(`🎯 DayEventsDrawer opened for:`, date);
  console.log(`📋 Events received in drawer:`, events);
  events.forEach((event, idx) => {
    console.log(`  Event ${idx + 1}:`, {
      type: event.eventType,
      title: event.title,
      employeeName: event.employeeName,
      leaveType: event.leaveType,
      fullEvent: event
    });
  });

  const formatTime = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return 'All Day';
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4" />
            <span className="break-words">Events on {formatDate(date)}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="self-end sm:self-auto">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No events scheduled for this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event._id || event.id}
                className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-3 border rounded-lg hover:bg-accent transition-colors space-y-2 sm:space-y-0"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-xl sm:text-2xl mt-1 flex-shrink-0">
                    {renderEventIcon(event.eventType, "h-5 w-5 sm:h-6 sm:w-6")}
                  </div>
                  <div className="flex-1 min-w-0">
                    {event.eventType === "leave" && event.employeeName ? (
                      <div className="mb-1">
                        <div className="font-semibold text-gray-900 break-words">
                          {event.employeeName}
                        </div>
                        <div className="text-sm text-gray-600 break-words">
                          {event.leaveType} Leave
                        </div>
                      </div>
                    ) : (
                      <div className="font-medium text-gray-900 mb-1 break-words">
                        {event.title}
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span className="break-words">
                          {event.isAllDay ? 'All Day' : `${formatTime(event.startDate)} - ${formatTime(event.endDate)}`}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="break-words">{event.location}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="outline" className={getEventClasses(event.eventType).badge}>
                        {renderEventIcon(event.eventType, "h-3 w-3 mr-1")}
                        {getEventLabel(event.eventType)}
                      </Badge>
                      {event.isRecurring && (
                        <Badge variant="outline">Recurring</Badge>
                      )}
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-2 break-words">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DayEventsDrawer;