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
import api from '../../../services/api';
import { formatDecimal } from '../../../lib/utils';

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
      case 'hybrid':
        return <Users className="h-4 w-4" />;
      case 'field':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const getLocationLabel = (location) => {
    switch (location) {
      case 'office':
        return 'Office';
      case 'wfh':
        return 'Work From Home';
      case 'hybrid':
        return 'Hybrid';
      case 'field':
        return 'Field Work';
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
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="field">Field Work</SelectItem>
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
                  {records.map((record, recordIdx) => (
                    <div
                      key={record.id || record._id || `record-${date}-${recordIdx}`}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      {/* Record Summary */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatDecimal(record.workHours)} hours worked
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'present'
                              ? 'bg-green-100 text-green-700'
                              : record.status === 'half_day'
                              ? 'bg-yellow-100 text-yellow-700'
                              : record.status === 'incomplete'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {record.status}
                        </span>
                      </div>

                      {/* Main Session Info */}
                      <div className="bg-muted/50 rounded-md p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getLocationIcon(record.workMode || 'office')}
                            <span className="text-sm font-medium">{getLocationLabel(record.workMode || 'office')}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <div className="text-muted-foreground text-xs">
                              Clock In
                            </div>
                            <div className="font-medium">
                              {record.clockIn ? formatTime(record.clockIn) : '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">
                              Clock Out
                            </div>
                            <div className="font-medium">
                              {record.clockOut ? formatTime(record.clockOut) : '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">
                              Worked
                            </div>
                            <div className="font-medium">
                              {formatDuration(record.totalWorkedMinutes || 0)}
                            </div>
                          </div>
                        </div>

                        {/* Breaks */}
                        {record.breakSessions && record.breakSessions.length > 0 && (
                          <div className="pt-2 border-t">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <Coffee className="h-3 w-3" />
                              <span>
                                {record.breakSessions.length} break(s) -{' '}
                                {formatDuration(record.totalBreakMinutes || 0)}
                              </span>
                            </div>
                            <div className="space-y-1">
                              {record.breakSessions.map((breakItem, bIdx) => (
                                <div
                                  key={`break-${record.id || record._id}-${bIdx}`}
                                  className="text-xs flex items-center justify-between"
                                >
                                  <span>
                                    {formatTime(breakItem.breakIn)} -{' '}
                                    {breakItem.breakOut
                                      ? formatTime(breakItem.breakOut)
                                      : 'ongoing'}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {formatDuration(breakItem.duration || 0)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
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
