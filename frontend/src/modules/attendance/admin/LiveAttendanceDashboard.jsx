import React, { useState, useEffect, useCallback } from 'react';
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
      <PageHeader
        title="Live Attendance Dashboard"
        subtitle="Real-time view of employee attendance with shift tracking"
        actions={[
          <ActionButton
            key="auto-refresh"
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '⏸️ Pause' : '▶️ Resume'} Auto-Refresh
          </ActionButton>,
          <ActionButton
            key="refresh"
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </ActionButton>
        ]}
      />

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Total Active"
          value={summary.totalActive || 0}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Working"
          value={summary.working || 0}
          icon={Clock}
          color="green"
        />
        <StatsCard
          title="On Break"
          value={summary.onBreak || 0}
          icon={Coffee}
          color="yellow"
        />
        <StatsCard
          title="Late Today"
          value={summary.late || 0}
          subtitle={summary.late > 0 ? "Requires attention" : ""}
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title="In Overtime"
          value={summary.overtime || 0}
          icon={Timer}
          color="purple"
        />
        <StatsCard
          title="Incomplete"
          value={summary.incomplete || 0}
          subtitle={summary.incomplete > 0 ? "Missing clock-out" : ""}
          icon={AlertTriangle}
          color="orange"
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
              { value: 'client_site', label: 'Client Site' }
            ]
          }
        ]}
        activeFilters={filters}
        onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
      />

      {/* Employee Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">
                      Development Mode: You can create test data to see the dashboard in action
                    </p>
                    <ActionButton
                      variant="outline"
                      size="sm"
                      onClick={handleCreateTestData}
                      loading={loading}
                    >
                      🧪 Create Test Attendance Data
                    </ActionButton>
                  </div>
                )
              }
            />
          </div>
        ) : (
          liveData.map((employee) => {
            const overtimeMinutes = getOvertimeMinutes(employee);
            const inOvertime = isInOvertime(employee);
            
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
                      {employee.currentSession?.status === 'on_break' ? '☕ Break' : '🟢 Active'}
                    </StatusBadge>
                    {employee.isLate && (
                      <StatusBadge status="error" size="sm">
                        ⚠️ LATE ({employee.lateMinutes}m)
                      </StatusBadge>
                    )}
                    {inOvertime && (
                      <StatusBadge status="info" size="sm">
                        ⏱️ OT ({formatDuration(overtimeMinutes)})
                      </StatusBadge>
                    )}
                    {employee.status === 'incomplete' && (
                      <StatusBadge status="warning" size="sm">
                        🔄 INCOMPLETE
                      </StatusBadge>
                    )}
                  </div>
                ]}
              >
                <div className="space-y-3">
                  {/* Shift Info */}
                  {employee.shift && (
                    <div className="text-sm text-gray-600">
                      <strong>Shift:</strong> {employee.shift.shiftName} ({employee.shift.shiftStartTime} - {employee.shift.shiftEndTime})
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4" />
                    <span>Office</span>
                  </div>

                  {/* Time Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
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
                    <div>
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
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm">
                      <div className="flex items-center gap-2 text-purple-700">
                        <Timer className="h-4 w-4" />
                        <span>In overtime: {formatDuration(overtimeMinutes)}</span>
                      </div>
                    </div>
                  )}

                  {/* Performance Indicators */}
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <div className="flex items-center gap-2 flex-wrap">
                      {!employee.isLate && (
                        <span className="text-green-600 flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          On Time
                        </span>
                      )}
                      {employee.currentSession?.status !== 'on_break' && (
                        <span className="text-blue-600">🟢 Productive</span>
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
        <div className="text-center text-xs sm:text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
          {autoRefresh && (
            <>
              <span className="hidden sm:inline"> • Auto-refreshing every 30 seconds</span>
              <div className="sm:hidden mt-1">Auto-refreshing every 30s</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveAttendanceDashboard;
