import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Badge } from '../../../../shared/ui/badge';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';

const TodayView = ({ date, events, loading }) => {
  const todayStr = date.toISOString().split('T')[0];
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.startDate).toISOString().split('T')[0];
    return eventDate === todayStr;
  });

  const getEventColor = (type) => {
    const colors = {
      meeting: 'bg-blue-100 border-blue-500 text-blue-700',
      holiday: 'bg-red-100 border-red-500 text-red-700',
      birthday: 'bg-pink-100 border-pink-500 text-pink-700',
      anniversary: 'bg-purple-100 border-purple-500 text-purple-700',
      leave: 'bg-orange-100 border-orange-500 text-orange-700',
      event: 'bg-green-100 border-green-500 text-green-700',
    };
    return colors[type] || 'bg-gray-100 border-gray-500 text-gray-700';
  };

  const getEventIcon = (type) => {
    if (type === 'meeting') return '📅';
    if (type === 'holiday') return '🏖️';
    if (type === 'birthday') return '🎂';
    if (type === 'anniversary') return '🎉';
    if (type === 'leave') return '🏝️';
    if (type === 'event') return '📌';
    return '📌';
  };

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

  const isToday = date.toDateString() === new Date().toDateString();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayEvents.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Meetings</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayEvents.filter(e => e.eventType === 'meeting').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Holidays</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayEvents.filter(e => e.eventType === 'holiday').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Birthdays</CardTitle>
            <Calendar className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayEvents.filter(e => e.eventType === 'birthday').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isToday ? "Today's Schedule" : `Schedule for ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : todayEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No events scheduled for this day</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayEvents.map((event) => (
                <div
                  key={event._id || event.id}
                  className={`p-4 rounded-lg border-l-4 ${getEventColor(event.eventType)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getEventIcon(event.eventType)}</span>
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <Badge variant="outline">{event.eventType}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
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
                      
                      {event.description && (
                        <p className="text-sm text-gray-600">{event.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TodayView;