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
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import calendarService from '../../../services/calendarService';
import EventModal from '../components/EventModal';
import HolidayModal from '../../organization/components/HolidayModal';
import { usePermissions } from '../../../core/hooks';
import { MODULES } from '../../../core/utils/rolePermissions';

const CalendarManagement = () => {
  const { can } = usePermissions();
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Modals
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingHoliday, setEditingHoliday] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [eventsRes, holidaysRes] = await Promise.all([
        calendarService.getCalendarEvents({
          startDate: `${selectedYear}-01-01`,
          endDate: `${selectedYear}-12-31`
        }),
        calendarService.getHolidays(selectedYear)
      ]);

      if (eventsRes.success) {
        setEvents(eventsRes.data || []);
      }
      if (holidaysRes.success) {
        setHolidays(holidaysRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setEventModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventModalOpen(true);
  };

  const handleDeleteEvent = async (eventId) => {
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

  const handleCreateHoliday = () => {
    setEditingHoliday(null);
    setHolidayModalOpen(true);
  };

  const handleEditHoliday = (holiday) => {
    setEditingHoliday(holiday);
    setHolidayModalOpen(true);
  };

  const handleDeleteHoliday = async (holidayId) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) {
      return;
    }

    try {
      await calendarService.deleteHoliday(holidayId);
      toast.success('Holiday deleted successfully');
      fetchData();
    } catch (error) {
      
      toast.error('Failed to delete holiday');
    }
  };

  const handleSyncEmployeeEvents = async () => {
    try {
      const response = await calendarService.syncEmployeeEvents();
      if (response.success) {
        toast.success(`Synced ${response.data.birthdaysCreated} birthdays and ${response.data.anniversariesCreated} anniversaries`);
        fetchData();
      }
    } catch (error) {
      
      toast.error('Failed to sync employee events');
    }
  };

  // Filter and search logic
  const filteredItems = [...events, ...holidays].filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && item.type === filterType;
  });

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
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Calendar, label: 'Event' };
    }
  };

  if (!can.do(MODULES.CALENDAR.MANAGE)) {
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar Management</h1>
          <p className="text-gray-600">Manage holidays, events, and company calendar</p>
        </div>
        <div className="flex items-center gap-3">
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
          <Button onClick={handleSyncEmployeeEvents} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Employee Events
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleCreateEvent} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
        <Button onClick={handleCreateHoliday} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Holiday
        </Button>
      </div>

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
                <option value="birthday">Birthdays</option>
                <option value="anniversary">Anniversaries</option>
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
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading calendar data...</p>
            </div>
          ) : filteredItems.length === 0 ? (
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
                      {(item.type === 'event' || item.type === 'holiday') && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => item.type === 'holiday' ? handleEditHoliday(item) : handleEditEvent(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => item.type === 'holiday' ? handleDeleteHoliday(item._id || item.id) : handleDeleteEvent(item._id || item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {(item.type === 'birthday' || item.type === 'anniversary') && (
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

      {/* Modals */}
      <EventModal
        open={eventModalOpen}
        event={editingEvent}
        onClose={() => {
          setEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSuccess={() => {
          fetchData();
          setEventModalOpen(false);
          setEditingEvent(null);
        }}
      />

      <HolidayModal
        open={holidayModalOpen}
        holiday={editingHoliday}
        onClose={() => {
          setHolidayModalOpen(false);
          setEditingHoliday(null);
        }}
        onSuccess={() => {
          fetchData();
          setHolidayModalOpen(false);
          setEditingHoliday(null);
        }}
      />
    </div>
  );
};

export default CalendarManagement;