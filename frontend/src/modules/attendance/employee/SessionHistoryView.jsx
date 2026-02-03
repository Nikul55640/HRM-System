import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Badge } from '../../../shared/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../shared/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../shared/ui/dropdown-menu';
import { Calendar, Clock, MapPin, Coffee, Building2, Home, Users, MoreHorizontal, AlertCircle, Eye, Edit, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import { formatDecimal } from '../../../lib/utils';

const SessionHistoryView = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
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
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      present: { label: 'Completed', className: 'bg-green-100 text-green-800 border-green-200' },
      incomplete: { label: 'In Progress', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      absent: { label: 'Absent', className: 'bg-red-100 text-red-800 border-red-200' },
      half_day: { label: 'Half Day', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      holiday: { label: 'Holiday', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      weekend: { label: 'Weekend', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
    
    return (
      <Badge variant="outline" className={`${config.className} font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const getLateMinutesDisplay = (record) => {
    if (!record.isLate || !record.lateMinutes) {
      return <span className="text-green-600 font-medium">0m</span>;
    }
    return <span className="text-red-600 font-medium">{record.lateMinutes}m</span>;
  };

  const getClockInDisplay = (record) => {
    if (!record.clockIn) {
      return <span className="text-gray-400">--:--</span>;
    }
    
    const time = formatTime(record.clockIn);
    const isLate = record.isLate && record.lateMinutes > 0;
    
    return (
      <div className="flex flex-col">
        <span className={isLate ? 'text-red-600 font-medium' : 'text-gray-900'}>{time}</span>
        {isLate && (
          <span className="text-xs text-red-500">{record.lateMinutes}m late</span>
        )}
      </div>
    );
  };

  const getWorkingHoursDisplay = (record) => {
    const hours = formatDecimal(record.workHours || 0);
    return <span className="font-medium">{hours}h</span>;
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedSessions = useMemo(() => {
    let sortableSessions = [...sessions];
    if (sortConfig.key) {
      sortableSessions.sort((a, b) => {
        if (sortConfig.key === 'date') {
          const aDate = new Date(a.date);
          const bDate = new Date(b.date);
          return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
        }
        if (sortConfig.key === 'workHours') {
          const aHours = a.workHours || 0;
          const bHours = b.workHours || 0;
          return sortConfig.direction === 'asc' ? aHours - bHours : bHours - aHours;
        }
        if (sortConfig.key === 'lateMinutes') {
          const aLate = a.lateMinutes || 0;
          const bLate = b.lateMinutes || 0;
          return sortConfig.direction === 'asc' ? aLate - bLate : bLate - aLate;
        }
        return 0;
      });
    }
    return sortableSessions;
  }, [sessions, sortConfig]);

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return null;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="ml-1 h-4 w-4" /> : 
      <ChevronDown className="ml-1 h-4 w-4" />;
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Session History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workLocation" className="text-sm font-medium">Work Location</Label>
              <Select
                value={filters.workLocation}
                onValueChange={(value) =>
                  setFilters({ ...filters, workLocation: value === 'all' ? '' : value })
                }
              >
                <SelectTrigger id="workLocation" className="w-full">
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
            <div className="text-center py-12">
              <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-sm text-gray-600">Loading sessions...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && sessions.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
              <p className="text-sm text-gray-600">No attendance sessions found for the selected period.</p>
            </div>
          )}

          {/* Sessions Table */}
          {!loading && sessions.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead 
                      className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">
                        Date
                        {getSortIcon('date')}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Clock In</TableHead>
                    <TableHead className="font-semibold text-gray-900">Clock Out</TableHead>
                    <TableHead 
                      className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('lateMinutes')}
                    >
                      <div className="flex items-center">
                        Late Minutes
                        {getSortIcon('lateMinutes')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('workHours')}
                    >
                      <div className="flex items-center">
                        Working Hours
                        {getSortIcon('workHours')}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSessions.map((record, index) => (
                    <TableRow 
                      key={record.id || record._id || `record-${index}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {formatDate(record.date)}
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>
                      
                      <TableCell>
                        {getClockInDisplay(record)}
                      </TableCell>
                      
                      <TableCell>
                        <span className={record.clockOut ? 'text-gray-900' : 'text-gray-400'}>
                          {record.clockOut ? formatTime(record.clockOut) : '--:--'}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        {getLateMinutesDisplay(record)}
                      </TableCell>
                      
                      <TableCell>
                        {getWorkingHoursDisplay(record)}
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {record.status === 'incomplete' && (
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" />
                                Request Correction
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="cursor-pointer">
                              <FileText className="mr-2 h-4 w-4" />
                              Export Record
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary Stats */}
          {!loading && sessions.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {sessions.length}
                </div>
                <div className="text-sm text-gray-600">Total Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {sessions.filter(s => s.status === 'present').length}
                </div>
                <div className="text-sm text-gray-600">Present</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {sessions.filter(s => s.status === 'absent').length}
                </div>
                <div className="text-sm text-gray-600">Absent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatDecimal(sessions.reduce((total, s) => total + (s.workHours || 0), 0))}h
                </div>
                <div className="text-sm text-gray-600">Total Hours</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionHistoryView;
