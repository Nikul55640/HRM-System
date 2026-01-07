import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Badge } from '../../../shared/ui/badge';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  CalendarDays,
  Users,
  Gift,
  Award,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import { calendarService } from '../../../services';
import EventModal from './EventModal';
import { usePermissions } from '../../../core/hooks';
import { MODULES } from '../../../core/utils/rolePermissions';

const UnifiedCalendarView = ({ viewMode = 'calendar', showManagementFeatures = true }) => {
  const { can } = usePermissions();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [birthdays, setBirthdays] = useState([]);
  const [anniversaries, setAnniversaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Modal states - removed holiday modals (managed in Smart Calendar)
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // Check if user can manage calendar
  const canManageCalendar = can?.doAny([
    MODULES.CALENDAR.MANAGE_EVENTS,
    MODULES.CALENDAR.MANAGE_HOLIDAYS,
    MODULES.CALENDAR.MANAGE_SMART_CALENDAR
  ]) || false;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const year = viewMode === 'calendar' ? currentDate.getFullYear() : selectedYear;
      
      // Fetch holidays and events separately to ensure we get the data
      const [eventsRes, holidaysRes] = await Promise.all([
        calendarService.getCalendarEvents({
          startDate: `${year}-01-01`,
          endDate: `${year}-12-31`
        }).catch(error => {
          console.warn('Calendar events API failed:', error);
          return { success: false, data: null };
        }),
        calendarService.getHolidays(year).catch(error => {
          console.warn('Holidays API failed:', error);
          return { success: false, data: null };
        })
      ]);

      // Handle calendar events response
      if (eventsRes.success && eventsRes.data) {
        const calendarData = eventsRes.data;
        setEvents(calendarData.events || []);
        setLeaves(calendarData.leaves || []);
        setBirthdays(calendarData.birthdays || []);
        setAnniversaries(calendarData.anniversaries || []);
      } else {
        // If calendar events API fails, set empty arrays
        setEvents([]);
        setLeaves([]);
        setBirthdays([]);
        setAnniversaries([]);
      }

      // Handle holidays response - always use the dedicated holidays API
      if (holidaysRes.success && holidaysRes.data) {
        // The holidays API returns { success: true, data: { holidays: [...], pagination: {...} } }
        if (holidaysRes.data.data && holidaysRes.data.data.holidays && Array.isArray(holidaysRes.data.data.holidays)) {
          setHolidays(holidaysRes.data.data.holidays);
        } else if (holidaysRes.data.holidays && Array.isArray(holidaysRes.data.holidays)) {
          setHolidays(holidaysRes.data.holidays);
        } else if (Array.isArray(holidaysRes.data)) {
          setHolidays(holidaysRes.data);
        } else {
          console.warn('Unexpected holidays response structure:', holidaysRes.data);
          setHolidays([]);
        }
      } else {
        setHolidays([]);
      }

    } catch (error) {
      console.error('Error fetching calendar data:', error);
      toast.error('Failed to load calendar data');
      // Set empty arrays to prevent iteration errors
      setEvents([]);
      setHolidays([]);
      setLeaves([]);
      setBirthdays([]);
      setAnniversaries([]);
    } finally {
      setLoading(false);
    }
  }, [currentDate, selectedYear, viewMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calendar navigation
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Event handlers
  const handleCreateEvent = (date = null) => {
    if (!canManageCalendar) {
      toast.error('You don\'t have permission to create events');
      return;
    }
    setEditingEvent(null);
    setSelectedDate(date);
    setEventModalOpen(true);
  };

  const handleEditEvent = (event) => {
    if (!canManageCalendar) {
      toast.error('You don\'t have permission to edit events');
      return;
    }
    setEditingEvent(event);
    setEventModalOpen(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!canManageCalendar) {
      toast.error('You don\'t have permission to delete events');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await calendarService.deleteEvent(eventId);
      toast.success('Event deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  // Holiday management moved to Smart Calendar - this is for EVENTS only
  // Holidays are system rules, not events

  const handleSyncEmployeeEvents = async () => {
    if (!canManageCalendar) {
      toast.error('You don\'t have permission to sync employee events');
      return;
    }

    try {
      const response = await calendarService.syncEmployeeEvents();
      if (response.success) {
        toast.success(`Synced ${response.data.birthdaysCreated} birthdays and ${response.data.anniversariesCreated} anniversaries`);
        fetchData();
      }
    } catch (error) {
      console.error('Error syncing employee events:', error);
      toast.error('Failed to sync employee events');
    }
  };

  // Calendar utilities
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const allItems = [
      ...events.map(e => ({ ...e, type: e.eventType || 'event' })),
      ...holidays.map(h => ({ ...h, type: 'holiday' })),
      ...leaves.map(l => ({ ...l, type: 'leave' })),
      ...birthdays.map(b => ({ ...b, type: 'birthday' })),
      ...anniversaries.map(a => ({ ...a, type: 'anniversary' }))
    ];
    return allItems.filter(item => {
      const itemDate = item.date || item.startDate;
      return itemDate && itemDate.startsWith(dateStr);
    });
  };

  const getEventTypeInfo = (type) => {
    switch (type) {
      case 'holiday':
        return { color: 'bg-red-100 text-red-800', icon: CalendarDays, label: 'Holiday' };
      case 'event':
        return { color: 'bg-blue-100 text-blue-800', icon: Calendar, label: 'Event' };
      case 'leave':
        return { color: 'bg-orange-100 text-orange-800', icon: Users, label: 'Leave' };
      case 'birthday':
        return { color: 'bg-pink-100 text-pink-800', icon: Gift, label: 'Birthday' };
      case 'anniversary':
        return { color: 'bg-purple-100 text-purple-800', icon: Award, label: 'Anniversary' };
      case 'meeting':
        return { color: 'bg-green-100 text-green-800', icon: Calendar, label: 'Meeting' };
      case 'training':
        return { color: 'bg-indigo-100 text-indigo-800', icon: Calendar, label: 'Training' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Calendar, label: 'Event' };
    }
  };

  const getEventColor = (type) => {
    const typeInfo = getEventTypeInfo(type);
    return typeInfo.color;
  };

  const handleMouseEnter = (day, event) => {
    const dayEvents = getEventsForDate(day);
    if (dayEvents.length > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      setHoveredDay(day);
    }
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  // Filter and search logic
  const filteredItems = [
    ...events.map(e => ({ ...e, type: e.eventType || 'event' })),
    ...holidays.map(h => ({ ...h, type: 'holiday' })),
    ...leaves.map(l => ({ ...l, type: 'leave' })),
    ...birthdays.map(b => ({ ...b, type: 'birthday' })),
    ...anniversaries.map(a => ({ ...a, type: 'anniversary' }))
  ].filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.employeeName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && item.type === filterType;
  });

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (!canManageCalendar && showManagementFeatures) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h3>
            <p className="text-red-700">You don't have permission to manage calendar events.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading calendar data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {showManagementFeatures ? 'Calendar Management' : 'Calendar'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {showManagementFeatures 
              ? 'Manage company events, meetings, and training sessions'
              : 'View holidays, leaves, and important dates'
            }
            {!canManageCalendar && (
              <span className="block text-amber-600 text-sm mt-1">
                📝 Only Admin and HR Manager can create/edit events
              </span>
            )}
          
          </p>
        </div>
        <div className="flex items-center gap-3">
          {viewMode === 'list' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>{year}</option>
                );
              })}
            </select>
          )}
          {canManageCalendar && showManagementFeatures && (
            <Button onClick={handleSyncEmployeeEvents} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Employee Events
            </Button>
          )}
        </div>
      </div>

      {/* Action Buttons - EVENTS ONLY (holidays managed in Smart Calendar) */}
      {canManageCalendar && showManagementFeatures && (
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => handleCreateEvent()} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        
        </div>
      )}

      {viewMode === 'list' && showManagementFeatures && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search events and holidays..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="all">All Types</option>
                    <option value="holiday">Holidays</option>
                    <option value="event">Events</option>
                    <option value="leave">Leaves</option>
                    <option value="birthday">Birthdays</option>
                    <option value="anniversary">Anniversaries</option>
                    <option value="meeting">Meetings</option>
                    <option value="training">Training</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar Items ({filteredItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No calendar items found for the selected criteria.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map((item) => {
                    const typeInfo = getEventTypeInfo(item.type);
                    const IconComponent = typeInfo.icon;
                    const displayDate = item.date || item.startDate;
                    const endDate = item.endDate;

                    return (
                      <div
                        key={item._id || item.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${typeInfo.color}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {item.title || item.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>
                                {displayDate && format(parseISO(displayDate), 'MMM dd, yyyy')}
                                {endDate && endDate !== displayDate && 
                                  ` - ${format(parseISO(endDate), 'MMM dd, yyyy')}`
                                }
                              </span>
                              <Badge variant="secondary" className={typeInfo.color}>
                                {typeInfo.label}
                              </Badge>
                              {item.isRecurring && (
                                <Badge variant="outline">Recurring</Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1 max-w-md truncate">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Only allow editing of EVENTS - holidays managed in Smart Calendar */}
                          {canManageCalendar && item.type === 'event' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditEvent(item)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteEvent(item._id || item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {/* Holidays are system rules - managed in Smart Calendar */}
                          {item.type === 'holiday' && (
                            <Badge variant="outline" className="text-blue-600">
                              System Rule (Smart Calendar)
                            </Badge>
                          )}
                          {/* Auto-generated events */}
                          {(item.type === 'birthday' || item.type === 'anniversary' || item.type === 'leave') && (
                            <Badge variant="outline" className="text-blue-600">
                              Auto-generated
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {viewMode === 'calendar' && (
        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={previousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                {canManageCalendar && (
                  <Button size="sm" onClick={() => handleCreateEvent()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Day Headers */}
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.slice(0, 1)}</span>
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
                    onClick={() => {
                      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      if (canManageCalendar) {
                        handleCreateEvent(dateStr);
                      }
                    }}
                    onMouseEnter={(e) => handleMouseEnter(day, e)}
                    onMouseLeave={handleMouseLeave}
                    className={`aspect-square border rounded-lg p-1 sm:p-2 hover:bg-gray-50 transition-colors relative ${
                      canManageCalendar ? 'cursor-pointer' : 'cursor-default'
                    } ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  >
                    <div className={`text-xs sm:text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>
                      {day}
                    </div>
                    
                    {/* Events for this day */}
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, window.innerWidth < 640 ? 1 : 2).map((event) => (
                        <div
                          key={event._id || event.id}
                          className={`text-xs px-1 py-0.5 rounded border cursor-pointer hover:opacity-80 ${getEventColor(event.type)}`}
                          title={event.title || event.name}
                        >
                          <div className="flex items-center gap-1">
                            <span className="text-xs">
                              {event.type === 'holiday' ? '🎉' : 
                               event.type === 'leave' ? '📅' : 
                               event.type === 'birthday' ? '🎂' :
                               event.type === 'anniversary' ? '🎊' : '📝'}
                            </span>
                            <span className="truncate text-xs hidden sm:inline">{event.title || event.name}</span>
                          </div>
                        </div>
                      ))}
                      
                      {/* Show "+X more" if there are more events */}
                      {dayEvents.length > (window.innerWidth < 640 ? 1 : 2) && (
                        <div className="text-xs text-gray-500 px-1">
                          +{dayEvents.length - (window.innerWidth < 640 ? 1 : 2)} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hover Tooltip */}
            {hoveredDay && (
              <div
                className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs pointer-events-none"
                style={{
                  left: `${tooltipPosition.x}px`,
                  top: `${tooltipPosition.y}px`,
                  transform: 'translateX(-50%) translateY(-100%)'
                }}
              >
                <div className="text-sm font-semibold mb-2">
                  {new Date(currentDate.getFullYear(), currentDate.getMonth(), hoveredDay).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="space-y-1">
                  {getEventsForDate(hoveredDay).map((event, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-sm">
                        {event.type === 'holiday' ? '🎉' : 
                         event.type === 'leave' ? '📅' : 
                         event.type === 'birthday' ? '🎂' :
                         event.type === 'anniversary' ? '🎊' : '📝'}
                      </span>
                      <span className="text-xs text-gray-700 truncate">
                        {event.title || event.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-4 justify-center text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-50 border border-red-200 rounded"></div>
                <span className="text-gray-600">Holiday</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-50 border border-blue-200 rounded"></div>
                <span className="text-gray-600">Event</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-50 border border-orange-200 rounded"></div>
                <span className="text-gray-600">Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-pink-50 border border-pink-200 rounded"></div>
                <span className="text-gray-600">Birthday</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-50 border border-purple-200 rounded"></div>
                <span className="text-gray-600">Anniversary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-50 border border-green-200 rounded"></div>
                <span className="text-gray-600">Meeting</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <EventModal
        open={eventModalOpen}
        event={editingEvent}
        selectedDate={selectedDate}
        onClose={() => {
          setEventModalOpen(false);
          setEditingEvent(null);
          setSelectedDate(null);
        }}
        onSuccess={() => {
          fetchData();
          setEventModalOpen(false);
          setEditingEvent(null);
          setSelectedDate(null);
        }}
      />

      {/* Remove holiday modal - holidays managed in Smart Calendar */}
    </div>
  );
};

export default UnifiedCalendarView;