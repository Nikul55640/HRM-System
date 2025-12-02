import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';

const UnifiedCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchCalendarEvents();
  }, [currentDate]);

  const fetchCalendarEvents = async () => {
    // Mock data - replace with actual API call
    setEvents([
      { date: '2024-01-01', type: 'holiday', title: 'New Year' },
      { date: '2024-01-15', type: 'leave', title: 'Your Leave' },
      { date: '2024-01-26', type: 'holiday', title: 'Republic Day' },
    ]);
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

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Calendar</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {dayNames.map(day => (
              <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
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
                  className={`aspect-square border rounded-lg p-2 hover:bg-muted/50 transition-colors ${
                    isToday ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="text-sm font-medium">{day}</div>
                  {event && (
                    <Badge 
                      variant={event.type === 'holiday' ? 'destructive' : 'default'} 
                      className="text-xs mt-1 w-full justify-center"
                    >
                      {event.type === 'holiday' ? '🎉' : '📅'}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex gap-4 justify-center">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">🎉</Badge>
              <span className="text-sm">Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">📅</Badge>
              <span className="text-sm">Leave</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedCalendar;
