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
  AlertTriangle,
  Timer,
  Award,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import { mapLiveAttendanceData, formatDuration, formatTime } from '../../../utils/attendanceDataMapper';

const LiveAttendanceDashboard = () => {
  const [liveData, setLiveData] = useState([]);
  const [summary, setSummary] = useState({ 
    totalActive: 0, 
    working: 0, 
    onBreak: 0, 
    late: 0, 
    overtime: 0 
  });
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
        const liveData = response.data.data || [];
        const summary = response.data.summary || {};
        
        // ✅ ENHANCED: Process live data to include late status from attendance records
        const processedLiveData = liveData.map(employee => mapLiveAttendanceData(employee));
        
        setLiveData(processedLiveData);
        setSummary({
          ...summary,
          // Ensure all summary fields are present
          totalActive: summary.totalActive || liveData.length,
          working: summary.working || liveData.filter(emp => emp.currentSession?.status === 'active').length,
          onBreak: summary.onBreak || liveData.filter(emp => emp.currentSession?.status === 'on_break').length,
          late: summary.late || liveData.filter(emp => emp.isLate).length,
          overtime: summary.overtime || 0,
          incomplete: summary.incomplete || liveData.filter(emp => emp.status === 'incomplete').length
        });
        
        // Show message if using mock data
        if (response.data.meta?.usingMockData && !silent) {
          toast.info('Showing demo data - no active attendance sessions found');
        } else if (response.data.meta?.realRecordsFound === 0 && !silent) {
          toast.info('No employees currently clocked in');
        }
        
        console.log('✅ [LIVE ATTENDANCE] Data loaded:', {
          liveData: processedLiveData.length,
          summary: summary,
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

  const handleCreateTestData = async () => {
    try {
      setLoading(true);
      const response = await api.post('/admin/attendance/debug/create-test-data');
      
      if (response.data.success) {
        toast.success('Test attendance data created successfully!');
        // Refresh the data
        fetchLiveAttendance();
      } else {
        toast.error(response.data.message || 'Failed to create test data');
      }
    } catch (error) {
      console.error('Error creating test data:', error);
      toast.error('Failed to create test data');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeDisplay = (dateString) => {
    return formatTime(dateString);
  };

  const formatDurationDisplay = (minutes) => {
    return formatDuration(minutes);
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

  const isInOvertime = (employee) => {
    if (!employee.shift) return false;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const shiftEndTime = new Date(`${today} ${employee.shift.shiftEndTime}`);
    return now > shiftEndTime;
  };

  const getOvertimeMinutes = (employee) => {
    if (!employee.shift || !isInOvertime(employee)) return 0;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const shiftEndTime = new Date(`${today} ${employee.shift.shiftEndTime}`);
    return Math.floor((now - shiftEndTime) / (1000 * 60));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Attendance Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time view of employee attendance with shift tracking
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
          {process.env.NODE_ENV !== 'production' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCreateTestData}
              disabled={loading}
            >
              🧪 Create Test Data
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Active</p>
                <p className="text-3xl font-bold">{summary.totalActive || 0}</p>
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
                <p className="text-3xl font-bold text-green-600">{summary.working || 0}</p>
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
                <p className="text-3xl font-bold text-orange-600">{summary.onBreak || 0}</p>
              </div>
              <Coffee className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className={summary.late > 0 ? "border-yellow-300 bg-yellow-50" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Late Today</p>
                <p className="text-3xl font-bold text-yellow-600">{summary.late || 0}</p>
                {summary.late > 0 && (
                  <p className="text-xs text-yellow-600 mt-1">Requires attention</p>
                )}
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Overtime</p>
                <p className="text-3xl font-bold text-purple-600">{summary.overtime || 0}</p>
              </div>
              <Timer className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className={summary.incomplete > 0 ? "border-orange-300 bg-orange-50" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Incomplete</p>
                <p className="text-3xl font-bold text-orange-600">{summary.incomplete || 0}</p>
                {summary.incomplete > 0 && (
                  <p className="text-xs text-orange-600 mt-1">Missing clock-out</p>
                )}
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
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
          <div className="col-span-full">
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Sessions</h3>
                  <p className="text-gray-500 mb-4">
                    No employees are currently clocked in
                  </p>
                  {process.env.NODE_ENV !== 'production' && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">
                        Development Mode: You can create test data to see the dashboard in action
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCreateTestData}
                        disabled={loading}
                      >
                        🧪 Create Test Attendance Data
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          liveData.map((employee) => {
            const overtimeMinutes = getOvertimeMinutes(employee);
            const inOvertime = isInOvertime(employee);
            
            return (
              <Card key={employee.employeeId} className={`hover:shadow-md transition-shadow ${employee.isLate ? 'border-yellow-300 bg-yellow-50' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{employee.fullName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {employee.department} • {employee.position}
                      </p>
                      {employee.shift && (
                        <p className="text-xs text-gray-500 mt-1">
                          Shift: {employee.shift.shiftName} ({employee.shift.shiftStartTime} - {employee.shift.shiftEndTime})
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          employee.currentSession?.status === 'on_break'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {employee.currentSession?.status === 'on_break'
                          ? '☕ Break'
                          : '🟢 Active'}
                      </span>
                      {/* Enhanced: More prominent late badge */}
                      {employee.isLate && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-300">
                          ⚠️ LATE ({employee.lateMinutes}m)
                        </span>
                      )}
                      {inOvertime && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          ⏱️ OT ({formatDuration(overtimeMinutes)})
                        </span>
                      )}
                      {/* NEW: Incomplete status badge */}
                      {employee.status === 'incomplete' && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-300">
                          🔄 INCOMPLETE
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4" />
                    <span>Office</span>
                  </div>

                  {/* Time Info */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Clock In</div>
                      <div className="font-medium">
                        {formatTimeDisplay(employee.currentSession?.checkInTime)}
                        {/* Show late indicator next to time */}
                        {employee.isLate && (
                          <span className="ml-1 text-red-500 text-xs">
                            (+{employee.lateMinutes}m late)
                          </span>
                        )}
                      </div>
                      {employee.shift && (
                        <div className="text-xs text-gray-500">
                          Expected: {employee.shift.shiftStartTime}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Worked</div>
                      <div className="font-medium">
                        {formatDurationDisplay(employee.currentSession?.totalWorkedMinutes || 0)}
                      </div>
                      {employee.shift && (
                        <div className="text-xs text-gray-500">
                          Expected: {(() => {
                            const start = employee.shift.shiftStartTime;
                            const end = employee.shift.shiftEndTime;
                            if (start && end) {
                              const startTime = new Date(`2000-01-01 ${start}`);
                              const endTime = new Date(`2000-01-01 ${end}`);
                              const diffHours = (endTime - startTime) / (1000 * 60 * 60);
                              return `${diffHours}h`;
                            }
                            return '8h';
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Break Info */}
                  {employee.currentSession?.breakCount > 0 && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>
                        {employee.currentSession.breakCount} break(s)
                      </span>
                      <span>
                        {formatDurationDisplay(employee.currentSession?.totalBreakMinutes || 0)}
                      </span>
                    </div>
                  )}

                  {/* Current Break */}
                  {employee.currentSession?.currentBreak && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-orange-700">On break since</span>
                        <span className="font-medium">
                          {formatTimeDisplay(employee.currentSession.currentBreak.startTime)}
                        </span>
                      </div>
                      <div className="text-orange-600 mt-1">
                        Duration: {formatDuration(employee.currentSession.currentBreak.durationMinutes)}
                      </div>
                    </div>
                  )}

                  {/* Overtime Warning */}
                  {inOvertime && (
                    <div className="bg-purple-50 border border-purple-200 rounded p-2 text-xs">
                      <div className="flex items-center gap-1 text-purple-700">
                        <Timer className="h-3 w-3" />
                        <span>In overtime: {formatDuration(overtimeMinutes)}</span>
                      </div>
                    </div>
                  )}

                  {/* Performance Indicators */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t">
                    <div className="flex items-center gap-2">
                      {!employee.isLate && (
                        <span className="text-green-600 flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          On Time
                        </span>
                      )}
                      {employee.currentSession?.status !== 'on_break' && (
                        <span className="text-blue-600">
                          🟢 Productive
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

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
