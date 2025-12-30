import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shared/ui/select';
import {
  Users,
  RefreshCw,
  Clock,
  Coffee,
  Building2,
  Home,
  MapPin,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const LiveAttendanceDashboard = () => {
  const [liveData, setLiveData] = useState([]);
  const [summary, setSummary] = useState({ totalActive: 0, working: 0, onBreak: 0 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    department: 'all',
    workLocation: 'all',
  });
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLiveAttendance = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const params = {};
      if (filters.department && filters.department !== 'all') params.department = filters.department;
      if (filters.workLocation && filters.workLocation !== 'all') params.workLocation = filters.workLocation;

      const response = await api.get('/admin/attendance/live', { params });
      
      // Debug: Log the actual response structure
      console.log('🔍 [LIVE ATTENDANCE] API Response:', response);

      // Handle response with proper success check
      if (response?.data?.success) {
        setLiveData(response.data.data || []);
        setSummary(response.data.summary || {});
        
        // Show message if using mock data
        if (response.data.meta?.usingMockData && !silent) {
          toast.info('Showing demo data - no active attendance sessions found');
        } else if (response.data.meta?.realRecordsFound === 0 && !silent) {
          toast.info('No employees currently clocked in');
        }
        
        console.log('✅ [LIVE ATTENDANCE] Data loaded:', {
          liveData: response.data.data?.length || 0,
          summary: response.data.summary,
          usingMockData: response.data.meta?.usingMockData,
          realRecordsFound: response.data.meta?.realRecordsFound
        });
      } else {
        // Handle case where success is false
        console.warn('⚠️ [LIVE ATTENDANCE] API returned success: false');
        setLiveData([]);
        setSummary({});
        
        if (!silent) {
          toast.error(response?.data?.message || 'Failed to load live attendance');
        }
      }
    } catch (error) {
      console.error('Failed to fetch live attendance:', error);
      setLiveData([]);
      setSummary({});
      
      if (!silent) {
        toast.error('Failed to load live attendance');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLiveAttendance();
  }, [fetchLiveAttendance]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLiveAttendance(true); // Silent refresh
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchLiveAttendance]);

  const handleRefresh = () => {
    fetchLiveAttendance();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
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
        return 'WFH';
      case 'client_site':
        return 'Client Site';
      default:
        return location;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Attendance</h1>
          <p className="text-muted-foreground">
            Real-time view of employee attendance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '⏸️ Pause' : '▶️ Resume'} Auto-Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Active</p>
                <p className="text-3xl font-bold">{summary.totalActive}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Working</p>
                <p className="text-3xl font-bold text-green-600">{summary.working}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Break</p>
                <p className="text-3xl font-bold text-orange-600">{summary.onBreak}</p>
              </div>
              <Coffee className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              value={filters.department}
              onValueChange={(value) =>
                setFilters({ ...filters, department: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.workLocation}
              onValueChange={(value) =>
                setFilters({ ...filters, workLocation: value })
              }
            >
              <SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && liveData.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Loading live attendance...
          </div>
        ) : liveData.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No employees currently clocked in
          </div>
        ) : (
          liveData.map((employee) => (
            <Card key={employee.employeeId} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{employee.fullName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {employee.department} • {employee.position}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      employee.currentSession.status === 'on_break'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {employee.currentSession.status === 'on_break'
                      ? '☕ Break'
                      : '🟢 Active'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Location */}
                <div className="flex items-center gap-2 text-sm">
                  {getLocationIcon(employee.currentSession.workLocation)}
                  <span>{getLocationLabel(employee.currentSession.workLocation)}</span>
                </div>

                {employee.currentSession.locationDetails && (
                  <div className="text-xs text-muted-foreground">
                    📍 {employee.currentSession.locationDetails}
                  </div>
                )}

                {/* Time Info */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">Clock In</div>
                    <div className="font-medium">
                      {formatTime(employee.currentSession.checkInTime)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Worked</div>
                    <div className="font-medium">
                      {formatDuration(employee.currentSession.totalWorkedMinutes)}
                    </div>
                  </div>
                </div>

                {/* Break Info */}
                {employee.currentSession.breakCount > 0 && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>
                      {employee.currentSession.breakCount} break(s)
                    </span>
                    <span>
                      {formatDuration(employee.currentSession.totalBreakMinutes)}
                    </span>
                  </div>
                )}

                {/* Current Break */}
                {employee.currentSession.currentBreak && (
                  <div className="bg-orange-50 border border-orange-200 rounded p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-orange-700">On break since</span>
                      <span className="font-medium">
                        {formatTime(employee.currentSession.currentBreak.startTime)}
                      </span>
                    </div>
                    <div className="text-orange-600 mt-1">
                      Duration: {formatDuration(employee.currentSession.currentBreak.durationMinutes)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions */}
      {/* Last Updated */}
      {!loading && liveData.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
          {autoRefresh && ' • Auto-refreshing every 30 seconds'}
        </div>
      )}
    </div>
  );
};

export default LiveAttendanceDashboard;
