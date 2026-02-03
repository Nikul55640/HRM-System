import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../shared/ui/dialog';
import { Badge } from '../../../shared/ui/badge';
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
  Loader2,
  Pause,
  Play,
  CheckCircle,
  XCircle,
  Activity,
  FlaskConical,
  RotateCcw,
  TrendingUp,
  Zap,
  Target,
  MoreHorizontal,
  Eye,
  ChevronUp,
  ChevronDown,
  Filter
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import { 
  computeSummaryFromLiveData,
  isInOvertime,
  getOvertimeMinutes,
  formatDuration,
  formatTime,
  getLocationInfo,
  getPerformanceIndicators
} from '../../../utils/attendanceCalculations';

const LiveAttendanceDashboard = () => {
  const [liveData, setLiveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [filters, setFilters] = useState({
    department: 'all',
    workLocation: 'all',
    search: ''
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [serverTime, setServerTime] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // ✅ IMPROVEMENT 1: Derive summary from liveData (single source of truth)
  const summary = useMemo(() => {
    return computeSummaryFromLiveData(liveData, serverTime || new Date());
  }, [liveData, serverTime]);

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    if (!sortConfig.key || !data) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle nested data
      if (sortConfig.key === 'fullName') {
        aValue = a.fullName || '';
        bValue = b.fullName || '';
      }

      if (sortConfig.key === 'clockIn') {
        aValue = new Date(a.currentSession?.checkInTime || 0);
        bValue = new Date(b.currentSession?.checkInTime || 0);
      }

      if (sortConfig.key === 'workedTime') {
        aValue = a.currentSession?.totalWorkedMinutes || 0;
        bValue = b.currentSession?.totalWorkedMinutes || 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const SortableHeader = ({ children, sortKey, className = "" }) => (
    <TableHead 
      className={`cursor-pointer hover:bg-gray-50 ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortConfig.key === sortKey && (
          sortConfig.direction === 'asc' ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </TableHead>
  );

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let filtered = liveData;

    if (filters.search) {
      filtered = filtered.filter(employee => 
        employee.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        employee.employeeId?.toLowerCase().includes(filters.search.toLowerCase()) ||
        employee.department?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.department && filters.department !== 'all') {
      filtered = filtered.filter(employee => employee.department === filters.department);
    }

    if (filters.workLocation && filters.workLocation !== 'all') {
      filtered = filtered.filter(employee => 
        employee.currentSession?.workLocation === filters.workLocation
      );
    }

    return getSortedData(filtered);
  }, [liveData, filters, sortConfig]);

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
        
        // ✅ IMPROVEMENT 2: Use server time for accurate calculations
        const serverTime = response.data.serverTime ? new Date(response.data.serverTime) : new Date();
        setServerTime(serverTime);
        
        // Process live data with business logic moved to utils
        const processedLiveData = liveData.map(employee => ({
          ...employee,
          // Ensure consistent data structure
          isLate: employee.isLate || employee.currentSession?.isLate || false,
          lateMinutes: employee.lateMinutes || employee.currentSession?.lateMinutes || 0,
        }));
        
        setLiveData(processedLiveData);
        setLastUpdated(new Date());
        
        // Don't show toast messages for mock data in production
        if (response.data.meta?.usingMockData && !silent) {
          // Only show mock data message in development
          if (process.env.NODE_ENV === 'development') {
            toast.info('Showing demo data - no active attendance sessions found');
          }
        } else if (response.data.meta?.realRecordsFound === 0 && !silent) {
          // Always show this message when no real records are found
          toast.info('No employees currently clocked in');
        }
        
        console.log('✅ [LIVE ATTENDANCE] Data loaded:', {
          liveData: processedLiveData.length,
          serverTime: serverTime.toISOString(),
          usingMockData: response.data.meta?.usingMockData,
          realRecordsFound: response.data.meta?.realRecordsFound
        });
      } else {
        // Handle case where success is false
        console.warn('[LIVE ATTENDANCE] API returned success: false');
        setLiveData([]);
        
        if (!silent) {
          toast.error(response?.data?.message || 'Failed to load live attendance');
        }
      }
    } catch (error) {
      console.error('Failed to fetch live attendance:', error);
      setLiveData([]);
      
      if (!silent) {
        toast.error('Failed to load live attendance');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filters.department, filters.workLocation]); // Remove filters from dependency to avoid infinite loops

  useEffect(() => {
    fetchLiveAttendance();
  }, [fetchLiveAttendance]);

  // ✅ IMPROVEMENT 3: Pause auto-refresh when tab is hidden
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        setAutoRefresh(false);
      } else {
        setAutoRefresh(true);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

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

  // Status badge component
  const StatusBadge = ({ status, children, className = "" }) => {
    const statusColors = {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <Badge className={`${statusColors[status] || statusColors.info} ${className}`}>
        {children}
      </Badge>
    );
  };

  // Get location icon
  const getLocationIcon = (location) => {
    const locationMap = {
      office: Building2,
      wfh: Home,
      hybrid: Users,
      field: MapPin
    };
    const IconComponent = locationMap[location] || MapPin;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">Live Attendance Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Real-time view of employee attendance with shift tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-2"
          >
            {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="hidden sm:inline">{autoRefresh ? 'Pause' : 'Resume'}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-lg sm:text-xl font-bold text-blue-600">{summary.totalActive || 0}</div>
                <div className="text-xs text-gray-600">Total Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-lg sm:text-xl font-bold text-green-600">{summary.working || 0}</div>
                <div className="text-xs text-gray-600">Working</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-yellow-600" />
              <div>
                <div className="text-lg sm:text-xl font-bold text-yellow-600">{summary.onBreak || 0}</div>
                <div className="text-xs text-gray-600">On Break</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <div>
                <div className="text-lg sm:text-xl font-bold text-red-600">{summary.late || 0}</div>
                <div className="text-xs text-gray-600">Late Today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-purple-600" />
              <div>
                <div className="text-lg sm:text-xl font-bold text-purple-600">{summary.overtime || 0}</div>
                <div className="text-xs text-gray-600">In Overtime</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-orange-600" />
              <div>
                <div className="text-lg sm:text-xl font-bold text-orange-600">{summary.incomplete || 0}</div>
                <div className="text-xs text-gray-600">Incomplete</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTERS */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              placeholder="Search employees..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="text-sm"
            />
            
            <Select
              value={filters.department}
              onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}
            >
              <SelectTrigger className="text-sm">
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
              onValueChange={(value) => setFilters(prev => ({ ...prev, workLocation: value }))}
            >
              <SelectTrigger className="text-sm">
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

            <Button
              onClick={() => fetchLiveAttendance()}
              className="w-full"
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* LIVE ATTENDANCE TABLE */}
      <LiveAttendanceTable
        loading={loading}
        data={filteredData}
        onView={(employee) => setViewEmployee(employee)}
        StatusBadge={StatusBadge}
        formatTime={formatTime}
        formatDuration={formatDuration}
        getLocationIcon={getLocationIcon}
        SortableHeader={SortableHeader}
        serverTime={serverTime}
        onCreateTestData={handleCreateTestData}
      />

      {/* VIEW EMPLOYEE MODAL */}
      {viewEmployee && (
        <Dialog open onOpenChange={() => setViewEmployee(null)}>
          <DialogContent className="max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Attendance Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Employee Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Employee Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <div className="font-medium">{viewEmployee.fullName}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Employee ID:</span>
                      <div className="font-medium">{viewEmployee.employeeId}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Department:</span>
                      <div className="font-medium">{viewEmployee.department}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Position:</span>
                      <div className="font-medium">{viewEmployee.position}</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Shift Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    {viewEmployee.shift ? (
                      <>
                        <div>
                          <span className="text-gray-500">Shift:</span>
                          <div className="font-medium">{viewEmployee.shift.shiftName}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Schedule:</span>
                          <div className="font-medium">
                            {viewEmployee.shift.shiftStartTime} - {viewEmployee.shift.shiftEndTime}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Expected Hours:</span>
                          <div className="font-medium">
                            {(() => {
                              const start = viewEmployee.shift.shiftStartTime;
                              const end = viewEmployee.shift.shiftEndTime;
                              if (start && end) {
                                const startTime = new Date(`2000-01-01 ${start}`);
                                const endTime = new Date(`2000-01-01 ${end}`);
                                const diffHours = (endTime - startTime) / (1000 * 60 * 60);
                                return `${diffHours}h`;
                              }
                              return '8h';
                            })()}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-500">No shift assigned</div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Current Session */}
              {viewEmployee.currentSession && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Current Session
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600 font-medium">Clock In:</span>
                      <div className="text-blue-800 font-semibold">
                        {formatTime(viewEmployee.currentSession.checkInTime)}
                      </div>
                      {viewEmployee.isLate && (
                        <div className="text-red-600 text-xs">
                          Late by {viewEmployee.lateMinutes} minutes
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Worked Time:</span>
                      <div className="text-blue-800 font-semibold">
                        {formatDuration(viewEmployee.currentSession.totalWorkedMinutes || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Status:</span>
                      <div className="mt-1">
                        <StatusBadge 
                          status={viewEmployee.currentSession.status === 'on_break' ? 'warning' : 'success'}
                        >
                          {viewEmployee.currentSession.status === 'on_break' ? 'On Break' : 'Working'}
                        </StatusBadge>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="flex items-center gap-2 text-sm">
                      {getLocationIcon(viewEmployee.currentSession.workLocation)}
                      <span className="text-blue-700 font-medium">Location:</span>
                      <span className="text-blue-800">
                        {viewEmployee.currentSession.workLocation || 'Not specified'}
                      </span>
                      {viewEmployee.currentSession.locationDetails && (
                        <span className="text-blue-600">
                          • {viewEmployee.currentSession.locationDetails}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Break Information */}
              {viewEmployee.currentSession?.breakCount > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Coffee className="w-4 h-4" />
                    Break Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Breaks:</span>
                      <div className="font-medium">{viewEmployee.currentSession.breakCount}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Break Time:</span>
                      <div className="font-medium">
                        {formatDuration(viewEmployee.currentSession.totalBreakMinutes || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Current Break */}
                  {viewEmployee.currentSession.currentBreak && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-orange-700">
                          <Coffee className="h-4 w-4" />
                          <span>Currently on break since</span>
                        </div>
                        <span className="font-medium">
                          {formatTime(viewEmployee.currentSession.currentBreak.startTime)}
                        </span>
                      </div>
                      <div className="text-orange-600 mt-1 text-sm">
                        Duration: {formatDuration(viewEmployee.currentSession.currentBreak.durationMinutes)}
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Performance Indicators */}
              {(() => {
                const currentTime = serverTime || new Date();
                const overtimeMinutes = getOvertimeMinutes(viewEmployee, currentTime);
                const inOvertime = isInOvertime(viewEmployee, currentTime);
                const performanceIndicators = getPerformanceIndicators(viewEmployee);

                return (
                  <Card className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Performance Indicators
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {!viewEmployee.isLate && (
                        <StatusBadge status="success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          On Time
                        </StatusBadge>
                      )}
                      {viewEmployee.isLate && (
                        <StatusBadge status="error">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Late ({viewEmployee.lateMinutes}m)
                        </StatusBadge>
                      )}
                      {inOvertime && (
                        <StatusBadge status="purple">
                          <Timer className="w-3 h-3 mr-1" />
                          Overtime ({formatDuration(overtimeMinutes)})
                        </StatusBadge>
                      )}
                      {viewEmployee.currentSession?.status === 'on_break' && (
                        <StatusBadge status="warning">
                          <Coffee className="w-3 h-3 mr-1" />
                          On Break
                        </StatusBadge>
                      )}
                      {viewEmployee.status === 'incomplete' && (
                        <StatusBadge status="warning">
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Incomplete Session
                        </StatusBadge>
                      )}
                    </div>
                  </Card>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Last Updated */}
      {!loading && liveData.length > 0 && (
        <div className="text-center text-xs sm:text-sm text-muted-foreground px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            <span>Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}</span>
            {serverTime && (
              <span className="hidden sm:inline">• Server time: {serverTime.toLocaleTimeString()}</span>
            )}
          </div>
          <div className="mt-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            {autoRefresh ? (
              <div className="flex items-center gap-1 text-green-600">
                <Activity className="h-3 w-3" />
                <span>Auto-refreshing every 30 seconds</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-amber-600">
                <Pause className="h-3 w-3" />
                <span>Auto-refresh paused (tab was hidden)</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= TABLE COMPONENT ================= */

const LiveAttendanceTable = ({
  loading,
  data,
  onView,
  StatusBadge,
  formatTime,
  formatDuration,
  getLocationIcon,
  SortableHeader,
  serverTime,
  onCreateTestData,
}) => {
  if (loading && (!data || data.length === 0)) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-12">
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin w-6 h-6 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Loading live attendance...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <Users className="mx-auto w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Active Sessions
            </h3>
            <p className="text-sm mb-4">
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
                  onClick={onCreateTestData}
                  className="flex items-center gap-2"
                >
                  <FlaskConical className="w-4 h-4" />
                  Create Test Attendance Data
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Live Attendance
          </CardTitle>
          <div className="text-sm text-gray-500">
            {data.length} active session{data.length !== 1 ? 's' : ''}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <SortableHeader sortKey="fullName" className="min-w-[200px]">
                  Employee
                </SortableHeader>
                <TableHead className="min-w-[120px]">Department</TableHead>
                <SortableHeader sortKey="clockIn" className="min-w-[120px]">
                  Clock In
                </SortableHeader>
                <SortableHeader sortKey="workedTime" className="min-w-[120px]">
                  Worked Time
                </SortableHeader>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Location</TableHead>
                <TableHead className="min-w-[100px]">Break Time</TableHead>
                <TableHead className="min-w-[120px]">Performance</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((employee) => {
                const currentTime = serverTime || new Date();
                const overtimeMinutes = getOvertimeMinutes(employee, currentTime);
                const inOvertime = isInOvertime(employee, currentTime);

                return (
                  <TableRow key={employee.employeeId} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">
                            {employee.fullName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            ID: {employee.employeeId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {employee.department}
                      </div>
                      <div className="text-xs text-gray-500">
                        {employee.position}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {formatTime(employee.currentSession?.checkInTime)}
                      </div>
                      {employee.isLate && (
                        <div className="text-xs text-red-500">
                          +{employee.lateMinutes}m late
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {formatDuration(employee.currentSession?.totalWorkedMinutes || 0)}
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
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <StatusBadge 
                          status={employee.currentSession?.status === 'on_break' ? 'warning' : 'success'}
                        >
                          <div className="flex items-center gap-1">
                            {employee.currentSession?.status === 'on_break' ? (
                              <Coffee className="w-3 h-3" />
                            ) : (
                              <Activity className="w-3 h-3" />
                            )}
                            <span className="text-xs">
                              {employee.currentSession?.status === 'on_break' ? 'Break' : 'Active'}
                            </span>
                          </div>
                        </StatusBadge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        {getLocationIcon(employee.currentSession?.workLocation)}
                        <span className="truncate">
                          {employee.currentSession?.workLocation || 'Not specified'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {employee.currentSession?.breakCount > 0 ? (
                          <>
                            <div className="font-medium">
                              {formatDuration(employee.currentSession.totalBreakMinutes || 0)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {employee.currentSession.breakCount} break{employee.currentSession.breakCount !== 1 ? 's' : ''}
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-400">No breaks</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {employee.isLate && (
                          <StatusBadge status="error">
                            <AlertTriangle className="w-3 h-3" />
                          </StatusBadge>
                        )}
                        {inOvertime && (
                          <StatusBadge status="purple">
                            <Timer className="w-3 h-3" />
                          </StatusBadge>
                        )}
                        {employee.status === 'incomplete' && (
                          <StatusBadge status="warning">
                            <RotateCcw className="w-3 h-3" />
                          </StatusBadge>
                        )}
                        {!employee.isLate && !inOvertime && employee.status !== 'incomplete' && (
                          <StatusBadge status="success">
                            <CheckCircle className="w-3 h-3" />
                          </StatusBadge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => onView(employee)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveAttendanceDashboard;
