import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PageHeader,
  StatsCard,
  DataCard,
  StatusBadge,
  ActionButton,
  FilterBar,
  EmptyState
} from '../../../shared/ui';
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
  Award,
  Pause,
  Play,
  CheckCircle,
  XCircle,
  Activity,
  FlaskConical,
  RotateCcw,
  TrendingUp,
  Zap,
  Target
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
  const [filters, setFilters] = useState({
    department: 'all',
    workLocation: 'all',
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [serverTime, setServerTime] = useState(null);

  // ✅ IMPROVEMENT 1: Derive summary from liveData (single source of truth)
  const summary = useMemo(() => {
    return computeSummaryFromLiveData(liveData, serverTime || new Date());
  }, [liveData, serverTime]);

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
  }, [filters]);

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

  // ✅ IMPROVEMENT 4: Use utility functions for consistent formatting
  const formatTimeDisplay = (dateString) => {
    return formatTime(dateString);
  };

  const formatDurationDisplay = (minutes) => {
    return formatDuration(minutes);
  };

  const getLocationIcon = (location) => {
    const locationInfo = getLocationInfo(location);
    const IconComponent = {
      Building2,
      Home,
      Users,
      MapPin
    }[locationInfo.icon] || MapPin;
    
    return <IconComponent className="h-4 w-4" />;
  };

  const getLocationLabel = (location) => {
    return getLocationInfo(location).label;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Attendance Dashboard"
        subtitle="Real-time view of employee attendance with shift tracking"
        actions={[
          <ActionButton
            key="auto-refresh"
            variant="outline"
            size="sm"
            icon={autoRefresh ? Pause : Play}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="hidden sm:flex"
          >
            {autoRefresh ? 'Pause' : 'Resume'} Auto-Refresh
          </ActionButton>,
          <ActionButton
            key="auto-refresh-mobile"
            variant="outline"
            size="sm"
            icon={autoRefresh ? Pause : Play}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="sm:hidden"
          />,
          <ActionButton
            key="refresh"
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={handleRefresh}
            loading={loading}
            className="hidden sm:flex"
          >
            Refresh
          </ActionButton>,
          <ActionButton
            key="refresh-mobile"
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={handleRefresh}
            loading={loading}
            className="sm:hidden"
          />
        ]}
      />

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatsCard
          title="Total Active"
          value={summary.totalActive || 0}
          icon={Users}
          color="blue"
          className="min-w-0"
        />
        <StatsCard
          title="Working"
          value={summary.working || 0}
          icon={Clock}
          color="green"
          className="min-w-0"
        />
        <StatsCard
          title="On Break"
          value={summary.onBreak || 0}
          icon={Coffee}
          color="yellow"
          className="min-w-0"
        />
        <StatsCard
          title="Late Today"
          value={summary.late || 0}
          subtitle={summary.late > 0 ? "Requires attention" : ""}
          icon={AlertTriangle}
          color="red"
          className="min-w-0"
        />
        <StatsCard
          title="In Overtime"
          value={summary.overtime || 0}
          icon={Timer}
          color="purple"
          className="min-w-0"
        />
        <StatsCard
          title="Incomplete"
          value={summary.incomplete || 0}
          subtitle={summary.incomplete > 0 ? "Missing clock-out" : ""}
          icon={XCircle}
          color="orange"
          className="min-w-0"
        />
      </div>

      {/* Filters */}
      <FilterBar
        filters={[
          {
            key: 'department',
            label: 'Department',
            options: [
              { value: 'Engineering', label: 'Engineering' },
              { value: 'HR', label: 'HR' },
              { value: 'Sales', label: 'Sales' },
              { value: 'Marketing', label: 'Marketing' },
              { value: 'Finance', label: 'Finance' }
            ]
          },
          {
            key: 'workLocation',
            label: 'Location',
            options: [
              { value: 'office', label: 'Office' },
              { value: 'wfh', label: 'Work From Home' },
              { value: 'hybrid', label: 'Hybrid' },
              { value: 'field', label: 'Field Work' }
            ]
          }
        ]}
        activeFilters={filters}
        onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
      />

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {loading && liveData.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Loader2}
              title="Loading live attendance..."
              description="Please wait while we fetch the latest data"
            />
          </div>
        ) : liveData.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Users}
              title="No Active Sessions"
              description="No employees are currently clocked in"
              action={
                process.env.NODE_ENV !== 'production' && (
                  <div className="space-y-2 text-center">
                    <p className="text-sm text-gray-400">
                      Development Mode: You can create test data to see the dashboard in action
                    </p>
                    <ActionButton
                      variant="outline"
                      size="sm"
                      icon={FlaskConical}
                      onClick={handleCreateTestData}
                      loading={loading}
                    >
                      Create Test Attendance Data
                    </ActionButton>
                  </div>
                )
              }
            />
          </div>
        ) : (
          liveData.map((employee) => {
            // ✅ IMPROVEMENT 4: Use utility functions for calculations
            const currentTime = serverTime || new Date();
            const overtimeMinutes = getOvertimeMinutes(employee, currentTime);
            const inOvertime = isInOvertime(employee, currentTime);
            const performanceIndicators = getPerformanceIndicators(employee);
            
            return (
              <DataCard
                key={employee.employeeId}
                title={employee.fullName}
                subtitle={`${employee.department} • ${employee.position}`}
                className={employee.isLate ? 'border-yellow-300 bg-yellow-50' : ''}
                actions={[
                  <div key="status-badges" className="flex flex-col gap-1">
                    <StatusBadge
                      status={employee.currentSession?.status === 'on_break' ? 'warning' : 'success'}
                      size="sm"
                    >
                      {employee.currentSession?.status === 'on_break' ? (
                        <div className="flex items-center gap-1">
                          <Coffee className="w-3 h-3" />
                          <span className="hidden sm:inline">Break</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          <span className="hidden sm:inline">Active</span>
                        </div>
                      )}
                    </StatusBadge>
                    {employee.isLate && (
                      <StatusBadge status="error" size="sm">
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>LATE ({employee.lateMinutes}m)</span>
                        </div>
                      </StatusBadge>
                    )}
                    {inOvertime && (
                      <StatusBadge status="info" size="sm">
                        <div className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          <span>OT ({formatDuration(overtimeMinutes)})</span>
                        </div>
                      </StatusBadge>
                    )}
                    {employee.status === 'incomplete' && (
                      <StatusBadge status="warning" size="sm">
                        <div className="flex items-center gap-1">
                          <RotateCcw className="w-3 h-3" />
                          <span>INCOMPLETE</span>
                        </div>
                      </StatusBadge>
                    )}
                  </div>
                ]}
              >
                <div className="space-y-3">
                  {/* Shift Info */}
                  {employee.shift && (
                    <div className="text-sm text-gray-600 break-words">
                      <strong>Shift:</strong> {employee.shift.shiftName} 
                      <span className="block sm:inline sm:ml-1">
                        ({employee.shift.shiftStartTime} - {employee.shift.shiftEndTime})
                      </span>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm min-w-0">
                    {getLocationIcon(employee.currentSession?.workLocation)}
                    <span className="truncate">{getLocationLabel(employee.currentSession?.workLocation)}</span>
                    {employee.currentSession?.locationDetails && (
                      <span className="text-gray-500 truncate hidden sm:inline">
                        • {employee.currentSession.locationDetails}
                      </span>
                    )}
                  </div>

                  {/* Time Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div className="min-w-0">
                      <div className="text-gray-500 text-xs">Clock In</div>
                      <div className="font-medium">
                        {formatTimeDisplay(employee.currentSession?.checkInTime)}
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
                    <div className="min-w-0">
                      <div className="text-gray-500 text-xs">Worked</div>
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
                    <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
                      <span>{employee.currentSession.breakCount} break(s)</span>
                      <span>{formatDurationDisplay(employee.currentSession?.totalBreakMinutes || 0)}</span>
                    </div>
                  )}

                  {/* Current Break */}
                  {employee.currentSession?.currentBreak && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-orange-700">
                          <Coffee className="h-4 w-4" />
                          <span>On break since</span>
                        </div>
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
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm">
                      <div className="flex items-center gap-2 text-purple-700">
                        <Timer className="h-4 w-4" />
                        <span>In overtime: {formatDuration(overtimeMinutes)}</span>
                      </div>
                    </div>
                  )}

                  {/* Performance Indicators */}
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      {performanceIndicators.onTime && (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span className="hidden sm:inline">On Time</span>
                        </span>
                      )}
                      {performanceIndicators.productive && (
                        <span className="text-blue-600 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span className="hidden sm:inline">Productive</span>
                        </span>
                      )}
                      {performanceIndicators.overtime && (
                        <span className="text-purple-600 flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          <span className="hidden sm:inline">Overtime</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </DataCard>
            );
          })
        )}
      </div>

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

export default LiveAttendanceDashboard;
