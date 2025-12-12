import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Textarea } from '../../../shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../shared/ui/dialog';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../../../stores/useAuthStore';

const UnifiedCalendar = () => {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'meeting',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    allDay: false
  });

  // Check if user can manage events (Admin, HR Manager, SuperAdmin)
  const canManageEvents = () => {
    if (!user) return false;
    const allowedRoles = ['SuperAdmin', 'HR Administrator', 'HR Manager', 'Admin'];
    return allowedRoles.includes(user.role);
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, [currentDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const currentYear = currentDate.getFullYear();
      const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
      
      setEvents([
        { 
          id: 1,
          date: `${currentYear}-${currentMonth}-01`, 
          type: 'holiday', 
          title: 'New Year',
          description: 'National Holiday',
          allDay: true
        },
        { 
          id: 2,
          date: `${currentYear}-${currentMonth}-15`, 
          type: 'leave', 
          title: 'Annual Leave',
          description: 'Personal vacation time',
          allDay: true
        },
        { 
          id: 3,
          date: `${currentYear}-${currentMonth}-26`, 
          type: 'holiday', 
          title: 'Republic Day',
          description: 'National Holiday',
          allDay: true
        },
        {
          id: 4,
          date: `${currentYear}-${currentMonth}-10`,
          type: 'meeting',
          title: 'Team Meeting',
          description: 'Weekly team sync',
          startTime: '10:00',
          endTime: '11:00',
          allDay: false
        }
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

  const getEventsForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const handleAddEvent = () => {
    if (!canManageEvents()) {
      toast.error('You do not have permission to create events. Only Admin and HR Manager can create events.');
      return;
    }
    
    if (selectedDate) {
      setNewEvent({
        ...newEvent,
        date: selectedDate
      });
    }
    setShowAddEventModal(true);
  };

  const handleSaveEvent = async () => {
    try {
      if (!newEvent.title || !newEvent.date) {
        toast.error('Please fill in required fields');
        return;
      }

      const eventToAdd = {
        id: Date.now(), // In real app, this would come from backend
        ...newEvent,
        date: newEvent.date
      };

      setEvents([...events, eventToAdd]);
      setShowAddEventModal(false);
      setNewEvent({
        title: '',
        description: '',
        type: 'meeting',
        date: '',
        startTime: '09:00',
        endTime: '10:00',
        allDay: false
      });
      toast.success('Event added successfully');
    } catch (error) {
      toast.error('Failed to add event');
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!canManageEvents()) {
      toast.error('You do not have permission to delete events. Only Admin and HR Manager can delete events.');
      return;
    }
    
    try {
      setEvents(events.filter(e => e.id !== eventId));
      setShowEventDetailsModal(false);
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleDateClick = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setNewEvent({
      ...newEvent,
      date: dateStr
    });
    
    // Just set the selected date, don't automatically open modal
    // Users can click the "Add Event" button if they have permission
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'holiday':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'leave':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'meeting':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'training':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'other':
        return 'text-orange-600 bg-orange-50 border-orange-200';
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
          <p className="text-gray-500 text-sm mt-1">
            View holidays, leaves, and important dates
            {!canManageEvents() && (
              <span className="block text-amber-600 text-xs mt-1">
                📝 Only Admin and HR Manager can create/edit events
              </span>
            )}
          </p>
        </div>
        {canManageEvents() && (
          <Button onClick={handleAddEvent}>
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        )}
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
              const dayEvents = getEventsForDate(day);
              const isToday = new Date().getDate() === day && 
                             new Date().getMonth() === currentDate.getMonth() && 
                             new Date().getFullYear() === currentDate.getFullYear();

              return (
                <div
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square border rounded-lg p-2 hover:bg-gray-50 transition-colors ${
                    canManageEvents() ? 'cursor-pointer' : 'cursor-default'
                  } ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                >
                  <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>
                    {day}
                  </div>
                  
                  {/* Events for this day */}
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        className={`text-xs px-1 py-0.5 rounded border cursor-pointer hover:opacity-80 ${getEventColor(event.type)}`}
                        title={event.title}
                      >
                        <div className="flex items-center gap-1">
                          <span>
                            {event.type === 'holiday' ? '🎉' : event.type === 'leave' ? '📅' : '📝'}
                          </span>
                          <span className="truncate">{event.title}</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show "+X more" if there are more than 2 events */}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
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
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
              <span className="text-sm text-gray-600">Training</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-50 border border-orange-200 rounded"></div>
              <span className="text-sm text-gray-600">Other</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Event Modal */}
      <Dialog open={showAddEventModal} onOpenChange={setShowAddEventModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="event-title">Title *</Label>
              <Input
                id="event-title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Event title"
              />
            </div>

            <div>
              <Label htmlFor="event-type">Type</Label>
              <Select value={newEvent.type} onValueChange={(value) => setNewEvent({...newEvent, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="leave">Leave</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="event-date">Date *</Label>
              <Input
                id="event-date"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="all-day"
                checked={newEvent.allDay}
                onChange={(e) => setNewEvent({...newEvent, allDay: e.target.checked})}
                className="w-4 h-4"
              />
              <Label htmlFor="all-day">All Day Event</Label>
            </div>

            {!newEvent.allDay && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="Event description (optional)"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddEventModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEvent}>
                Save Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Details Modal */}
      <Dialog open={showEventDetailsModal} onOpenChange={setShowEventDetailsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Event Details</span>
              {canManageEvents() && (
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${getEventColor(selectedEvent.type)}`}>
                  {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Date</Label>
                <p className="text-sm">{new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>

              {!selectedEvent.allDay && selectedEvent.startTime && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Time</Label>
                  <p className="text-sm">{selectedEvent.startTime} - {selectedEvent.endTime}</p>
                </div>
              )}

              {selectedEvent.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Description</Label>
                  <p className="text-sm text-gray-700">{selectedEvent.description}</p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setShowEventDetailsModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnifiedCalendar;
