import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';
import { X, Clock, MapPin } from 'lucide-react';
import { getEventClasses, getEventIcon, getEventLabel } from '../../../core/utils/calendarEventTypes';

const DayEventsDrawer = ({ date, events, onClose }) => {
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
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            📅 Events on {formatDate(date)}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">📅</div>
            <p>No events scheduled for this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event._id || event.id}
                className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-2xl mt-1">
                    {getEventIcon(event.eventType)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                      {event.title}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {event.isAllDay ? 'All Day' : `${formatTime(event.startDate)} - ${formatTime(event.endDate)}`}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={getEventClasses(event.eventType).badge}>
                        {getEventIcon(event.eventType)} {getEventLabel(event.eventType)}
                      </Badge>
                      {event.isRecurring && (
                        <Badge variant="outline">Recurring</Badge>
                      )}
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-2">
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