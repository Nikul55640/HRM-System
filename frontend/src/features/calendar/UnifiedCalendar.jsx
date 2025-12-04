import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

const UnifiedCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendarEvents();
  }, [currentDate]);

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      setEvents([
        { date: '2024-01-01', type: 'holiday', title: 'New Year' },
        { date: '2024-01-15', type: 'leave', title: 'Your Leave' },
        { date: '2024-01-26', type: 'holiday', title: 'Republic Day' },
      ]);
    } catch (error) {
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.find(e => e.date === dateStr);
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'holiday':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'leave':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'meeting':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">View holidays, leaves, and important dates</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Calendar Days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const event = getEventForDate(day);
              const isToday = new Date().getDate() === day && 
                             new Date().getMonth() === currentDate.getMonth() && 
                             new Date().getFullYear() === currentDate.getFullYear();

              return (
                <div
                  key={day}
                  className={`aspect-square border rounded-lg p-2 hover:bg-gray-50 transition-colors ${
                    isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>
                    {day}
                  </div>
                  {event && (
                    <div className={`text-xs mt-1 px-1 py-0.5 rounded border ${getEventColor(event.type)}`}>
                      {event.type === 'holiday' ? '🎉' : event.type === 'leave' ? '📅' : '📝'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex gap-6 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span className="text-sm text-gray-600">Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
              <span className="text-sm text-gray-600">Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-50 border border-purple-200 rounded"></div>
              <span className="text-sm text-gray-600">Meeting</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedCalendar;
