import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, MapPin } from 'lucide-react';
import { calendarService } from '../../services';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/essHelpers';

const DailyCalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDayEvents();
  }, [selectedDate]);

  const fetchDayEvents = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await calendarService.getEventsByDateRange(dateStr, dateStr);
      
      if (response.success) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getEventColor = (type) => {
    const colors = {
      meeting: 'bg-blue-100 border-blue-500 text-blue-700',
      holiday: 'bg-red-100 border-red-500 text-red-700',
      birthday: 'bg-pink-100 border-pink-500 text-pink-700',
      anniversary: 'bg-purple-100 border-purple-500 text-purple-700',
      break: 'bg-gray-100 border-gray-500 text-gray-700',
      leave: 'bg-orange-100 border-orange-500 text-orange-700',
    };
    return colors[type] || 'bg-gray-100 border-gray-500 text-gray-700';
  };

  const getEventIcon = (type) => {
    if (type === 'meeting') return '📅';
    if (type === 'holiday') return '🏖️';
    if (type === 'birthday') return '🎂';
    if (type === 'anniversary') return '🎉';
    if (type === 'break') return '☕';
    if (type === 'leave') return '🏝️';
    return '📌';
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Daily Calendar</h1>
          <p className="text-muted-foreground mt-1">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={goToPreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant={isToday ? 'default' : 'outline'} onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" onClick={goToNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Meetings</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => e.eventType === 'meeting').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Busy Hours</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => e.eventType === 'meeting').length * 1}h
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Free Time</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {9 - events.filter(e => e.eventType === 'meeting').length}h
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No events scheduled for this day</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event._id}
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
                          {event.isAllDay ? 'All Day' : `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`}
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
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
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

export default DailyCalendarView;
