import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/select';
import { Calendar, Clock, MapPin, Coffee, Building2, Home, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../core/api/api';

const SessionHistoryView = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    workLocation: 'all',
  });

  useEffect(() => {
    // Set default date range (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setFilters({
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0],
      workLocation: 'all',
    });
  }, []);

  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      fetchSessions();
    }
  }, [filters]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
      };

      if (filters.workLocation && filters.workLocation !== 'all') {
        params.workLocation = filters.workLocation;
      }

      const response = await api.get('/employee/attendance/sessions', { params });

      if (response.data.success) {
        setSessions(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load session history');
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getLocationIcon = (location) => {
    switch (location) {
      case 'office':
        return <Building2 className="h-4 w-4" />;
      case 'wfh':
        return <Home className="h-4 w-4" />;
      case 'client_site':
        return <Users className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getLocationLabel = (location) => {
    switch (location) {
      case 'office':
        return 'Office';
      case 'wfh':
        return 'Work From Home';
      case 'client_site':
        return 'Client Site';
      default:
        return location;
    }
  };

  // Group sessions by date
  const groupedSessions = sessions.reduce((acc, record) => {
    const dateKey = formatDate(record.date);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(record);
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Session History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workLocation">Work Location</Label>
              <Select
                value={filters.workLocation}
                onValueChange={(value) =>
                  setFilters({ ...filters, workLocation: value === 'all' ? '' : value })
                }
              >
                <SelectTrigger id="workLocation">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="wfh">Work From Home</SelectItem>
                  <SelectItem value="client_site">Client Site</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8 text-muted-foreground">
              Loading sessions...
            </div>
          )}

          {/* Empty State */}
          {!loading && sessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No sessions found for the selected period
            </div>
          )}

          {/* Sessions List */}
          {!loading && sessions.length > 0 && (
            <div className="space-y-6">
              {Object.entries(groupedSessions).map(([date, records]) => (
                <div key={date} className="space-y-3">
                  <h3 className="font-semibold text-lg sticky top-0 bg-background py-2">
                    {date}
                  </h3>
                  {records.map((record) => (
                    <div
                      key={record._id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      {/* Record Summary */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {record.workHours?.toFixed(2) || 0} hours worked
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'present'
                              ? 'bg-green-100 text-green-700'
                              : record.status === 'half_day'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {record.status}
                        </span>
                      </div>

                      {/* Sessions */}
                      {record.sessions && record.sessions.length > 0 && (
                        <div className="space-y-2">
                          {record.sessions.map((session, idx) => (
                            <div
                              key={session.sessionId || idx}
                              className="bg-muted/50 rounded-md p-3 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getLocationIcon(session.workLocation)}
                                  <span className="text-sm font-medium">
                                    {getLocationLabel(session.workLocation)}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  Session {idx + 1}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <div className="text-muted-foreground text-xs">
                                    Clock In
                                  </div>
                                  <div className="font-medium">
                                    {formatTime(session.checkIn)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground text-xs">
                                    Clock Out
                                  </div>
                                  <div className="font-medium">
                                    {session.checkOut
                                      ? formatTime(session.checkOut)
                                      : '-'}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground text-xs">
                                    Worked
                                  </div>
                                  <div className="font-medium">
                                    {formatDuration(session.workedMinutes || 0)}
                                  </div>
                                </div>
                              </div>

                              {/* Breaks */}
                              {session.breaks && session.breaks.length > 0 && (
                                <div className="pt-2 border-t">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                    <Coffee className="h-3 w-3" />
                                    <span>
                                      {session.breaks.length} break(s) -{' '}
                                      {formatDuration(
                                        session.totalBreakMinutes || 0
                                      )}
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    {session.breaks.map((breakItem, bIdx) => (
                                      <div
                                        key={breakItem.breakId || bIdx}
                                        className="text-xs flex items-center justify-between"
                                      >
                                        <span>
                                          {formatTime(breakItem.startTime)} -{' '}
                                          {breakItem.endTime
                                            ? formatTime(breakItem.endTime)
                                            : 'ongoing'}
                                        </span>
                                        <span className="text-muted-foreground">
                                          {formatDuration(
                                            breakItem.durationMinutes || 0
                                          )}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {session.locationDetails && (
                                <div className="text-xs text-muted-foreground">
                                  📍 {session.locationDetails}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionHistoryView;
