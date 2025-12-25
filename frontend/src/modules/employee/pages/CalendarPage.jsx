import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";
import { Icon, LoadingSpinner } from "../../../shared/components";
import { useToast } from "../../../core/hooks/use-toast";

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // const [eventsRes, holidaysRes] = await Promise.all([
      //   api.get('/employee/calendar/events'),
      //   api.get('/employee/calendar/holidays')
      // ]);
      
      // Mock data for now
      const mockEvents = [
        {
          id: 1,
          title: "Team Meeting",
          date: "2024-12-26",
          time: "10:00 AM",
          type: "meeting",
          description: "Weekly team sync meeting"
        },
        {
          id: 2,
          title: "Training Session",
          date: "2024-12-27",
          time: "2:00 PM",
          type: "training",
          description: "New software training"
        }
      ];

      const mockHolidays = [
        {
          id: 1,
          name: "Christmas Day",
          date: "2024-12-25",
          type: "public"
        },
        {
          id: 2,
          name: "New Year's Day",
          date: "2025-01-01",
          type: "public"
        }
      ];
      
      setEvents(mockEvents);
      setHolidays(mockHolidays);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch calendar data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800";
      case "training":
        return "bg-green-100 text-green-800";
      case "holiday":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading calendar..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">View company events, holidays, and important dates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Icon name="Download" className="w-4 h-4 mr-2" />
            Export Calendar
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon name="Calendar" className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Icon name="PartyPopper" className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Holidays This Month</p>
                <p className="text-2xl font-bold">{holidays.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Icon name="Clock" className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Date</p>
                <p className="text-lg font-bold">
                  {new Date().toLocaleDateString("en-US", { 
                    month: "short", 
                    day: "numeric" 
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Calendar" className="w-5 h-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon name="Calendar" className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Icon name="Calendar" className="w-4 h-4" />
                            {formatDate(event.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Clock" className="w-4 h-4" />
                            {event.time}
                          </span>
                        </div>
                      </div>
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="Calendar" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming events</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Holidays */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="PartyPopper" className="w-5 h-5" />
            Company Holidays
          </CardTitle>
        </CardHeader>
        <CardContent>
          {holidays.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="flex items-center gap-3 p-4 border rounded-lg"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Icon name="PartyPopper" className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{holiday.name}</h3>
                    <p className="text-sm text-gray-600">{formatDate(holiday.date)}</p>
                  </div>
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    {holiday.type}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="PartyPopper" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No holidays scheduled</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;