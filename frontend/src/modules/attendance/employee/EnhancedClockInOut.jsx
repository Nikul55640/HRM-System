import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Clock, LogIn, LogOut, Coffee, MapPin, Building2, Home, Users, RefreshCw, Bug } from 'lucide-react';
import { toast } from 'react-toastify';
import LocationSelectionModal from './LocationSelectionModal';
import useAttendanceSessionStore from '../../../stores/useAttendanceSessionStore';
import { attendanceDebugger } from '../../../utils/attendanceDebugger';

const EnhancedClockInOut = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // Use shared attendance context
  const {
    todayRecord,
    isLoading,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    getAttendanceStatus,
    fetchTodayRecord,
  } = useAttendanceSessionStore();

  // Initialize attendance data on mount
  useEffect(() => {
    fetchTodayRecord(true);
  }, [fetchTodayRecord]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClockInClick = () => {
    setShowLocationModal(true);
  };

  const handleRefresh = async () => {
    try {
      await fetchTodayRecord();
      toast.success('Attendance status refreshed');
    } catch (error) {
      toast.error('Failed to refresh status');
    }
  };

  const handleLocationConfirm = async (locationData) => {
    try {
      // Check current status first
      const { isClockedIn } = getAttendanceStatus();
      
      if (isClockedIn) {
        toast.info("You are already clocked in for today");
        setShowLocationModal(false);
        return;
      }

      const result = await clockIn(locationData);
      
      if (result.success) {
        // ✅ ENHANCED: Show detailed clock-in feedback with late status
        const clockInSummary = result.data?.clockInSummary;
        
        if (clockInSummary) {
          if (clockInSummary.isLate) {
            toast.warning(
              `⏰ Clocked in at ${clockInSummary.clockInTime} - Late by ${clockInSummary.lateMinutes} minutes\n` +
              `Shift started at ${clockInSummary.shiftStartTime}`,
              { autoClose: 5000 }
            );
          } else {
            toast.success(
              `✅ Clocked in at ${clockInSummary.clockInTime} - On time!\n` +
              `Shift started at ${clockInSummary.shiftStartTime}`,
              { autoClose: 3000 }
            );
          }
        } else {
          // Fallback message
          toast.success('Clocked in successfully!');
        }
        
        setShowLocationModal(false);
      } else {
        // If already clocked in, just close modal and show info
        if (result.error?.includes('already clocked in')) {
          toast.info(result.message || "You are already clocked in for today");
          setShowLocationModal(false);
          // Force refresh the attendance status
          await fetchTodayRecord(true);
        } else {
          toast.error(result.error || 'Failed to clock in');
        }
      }
    } catch (error) {
      toast.error('Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      const result = await clockOut();
      
      if (result.success) {
        toast.success('Clocked out successfully!');
      } else {
        toast.error(result.error || 'Failed to clock out');
      }
    } catch (error) {
      toast.error('Failed to clock out');
    }
  };

  const handleStartBreak = async () => {
    try {
      console.log('🔍 [DEBUG] Starting break...');
      console.log('🔍 [DEBUG] Current attendance status:', getAttendanceStatus());
      console.log('🔍 [DEBUG] Today record before break:', todayRecord);
      
      const result = await startBreak();
      
      console.log('🔍 [DEBUG] Break start result:', result);
      
      if (result.success) {
        toast.success('Break started');
        // Force refresh after a short delay
        setTimeout(async () => {
          await fetchTodayRecord(true);
          const updatedStatus = getAttendanceStatus();
          console.log('🔍 [DEBUG] Updated status after break start:', {
            isOnBreak: updatedStatus.isOnBreak,
            breakSessions: useAttendanceSessionStore.getState().todayRecord?.breakSessions?.length || 0
          });
        }, 1000);
      } else {
        console.error('🔍 [DEBUG] Break start failed:', result.error);
        toast.error(result.error || 'Failed to start break');
      }
    } catch (error) {
      console.error('🔍 [DEBUG] Break start exception:', error);
      toast.error('Failed to start break');
    }
  };

  const handleEndBreak = async () => {
    try {
      console.log('🔍 [DEBUG] Ending break...');
      console.log('🔍 [DEBUG] Current attendance status:', getAttendanceStatus());
      console.log('🔍 [DEBUG] Today record before end break:', todayRecord);
      
      const result = await endBreak();
      
      console.log('🔍 [DEBUG] Break end result:', result);
      
      if (result.success) {
        toast.success('Break ended');
        // Force refresh after a short delay
        setTimeout(async () => {
          await fetchTodayRecord(true);
          console.log('🔍 [DEBUG] Today record after end break refresh:', useAttendanceSessionStore.getState().todayRecord);
        }, 1000);
      } else {
        console.error('🔍 [DEBUG] Break end failed:', result.error);
        toast.error(result.error || 'Failed to end break');
      }
    } catch (error) {
      console.error('🔍 [DEBUG] Break end exception:', error);
      toast.error('Failed to end break');
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const calculateWorkedMinutes = (checkInTime) => {
    if (!checkInTime) return 0;
    const now = new Date();
    const checkIn = new Date(checkInTime);
    const diffMs = now.getTime() - checkIn.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
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

  // Get attendance status from context
  const {
    isClockedIn: isActive,
    isOnBreak,
    hasLegacyClockIn,
    activeSession,
    hasCompletedSessions
  } = getAttendanceStatus();

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Clock In/Out
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => attendanceDebugger.testBreakFlow()}
                className="text-blue-600 hover:text-blue-700"
                title="Test Break Flow"
              >
                <Bug className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Time Display */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-muted-foreground">{formatDate(currentTime)}</div>
            </div>

            {/* Active Session Info */}
            {(todayRecord?.clockIn && !todayRecord?.clockOut) && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">Office</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isOnBreak
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {isOnBreak ? '☕ On Break' : '🟢 Active'}
                    </span>
                    {/* Late Status */}
                    {todayRecord?.isLate && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        ⏰ Late ({todayRecord.lateMinutes}m)
                      </span>
                    )}
                  </div>
                </div>

                {/* Shift Information */}
                {todayRecord?.shift && (
                  <div className="bg-white border rounded p-2 text-sm">
                    <div className="font-medium text-gray-700 mb-1">Shift: {todayRecord.shift.shiftName}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Expected:</span> {todayRecord.shift.shiftStartTime} - {todayRecord.shift.shiftEndTime}
                      </div>
                      <div>
                        <span className="font-medium">Grace Period:</span> {todayRecord.shift.gracePeriodMinutes || 0} minutes
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Clock In</div>
                    <div className="font-semibold">
                      {new Date(todayRecord?.clockIn).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {/* Show expected vs actual */}
                    {todayRecord?.shift && (
                      <div className="text-xs text-muted-foreground">
                        Expected: {todayRecord.shift.shiftStartTime}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-muted-foreground">Worked Time</div>
                    <div className="font-semibold">
                      {todayRecord?.totalWorkedMinutes ? 
                        formatDuration(todayRecord.totalWorkedMinutes) :
                        formatDuration(calculateWorkedMinutes(todayRecord?.clockIn))
                      }
                    </div>
                    {/* Show expected work hours */}
                    {todayRecord?.shift && (
                      <div className="text-xs text-muted-foreground">
                        Expected: {(() => {
                          const start = todayRecord.shift.shiftStartTime;
                          const end = todayRecord.shift.shiftEndTime;
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

                {/* Break Sessions Display */}
                {(todayRecord?.breakSessions?.length > 0) && (
                  <div className="text-sm space-y-2">
                    <div className="text-muted-foreground">
                      Breaks: {todayRecord.breakSessions.length} 
                      {todayRecord?.totalBreakMinutes > 0 && ` (${formatDuration(todayRecord.totalBreakMinutes)})`}
                    </div>
                    
                    {/* Current Break Info */}
                    {isOnBreak && (
                      <div className="bg-orange-50 border border-orange-200 rounded p-2">
                        <div className="text-orange-600 font-medium flex items-center gap-2">
                          <Coffee className="h-4 w-4" />
                          Currently on break
                        </div>
                        {(() => {
                          // Find active break session
                          const currentBreak = todayRecord.breakSessions.find(s => s.breakIn && !s.breakOut);
                          
                          if (currentBreak) {
                            const breakStartTime = new Date(currentBreak.breakIn);
                            const breakDuration = Math.floor((new Date() - breakStartTime) / (1000 * 60));
                            return (
                              <div className="text-xs text-orange-600 mt-1">
                                Started: {breakStartTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} 
                                ({formatDuration(breakDuration)} ago)
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}

                    {/* Break History */}
                    {todayRecord.breakSessions.length > 0 && (
                      <div className="bg-gray-50 border rounded p-2">
                        <div className="text-xs font-medium text-gray-600 mb-1">Today's Breaks:</div>
                        <div className="space-y-1">
                          {todayRecord.breakSessions.map((breakSession, index) => (
                            <div key={index} className="text-xs text-gray-600 flex justify-between">
                              <span>
                                Break {index + 1}: {new Date(breakSession.breakIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                {breakSession.breakOut && ` - ${new Date(breakSession.breakOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                              </span>
                              <span>
                                {breakSession.breakOut ? 
                                  formatDuration(breakSession.duration || 0) : 
                                  '🟠 Active'
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Completed Sessions Today */}
            {todayRecord?.status === 'present' && todayRecord?.clockOut && (
              <div className="text-sm text-muted-foreground text-center">
                ✓ Work session completed for today
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {!isActive && (
                <Button
                  onClick={handleClockInClick}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  {isLoading ? 'Processing...' : 'Clock In'}
                </Button>
              )}

              {isActive && !isOnBreak && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleStartBreak}
                      disabled={isLoading}
                      variant="outline"
                      size="lg"
                    >
                      <Coffee className="mr-2 h-4 w-4" />
                      Start Break
                    </Button>
                    <Button
                      onClick={handleClockOut}
                      disabled={isLoading}
                      variant="destructive"
                      size="lg"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Clock Out
                    </Button>
                  </div>
                </>
              )}

              {isOnBreak && (
                <Button
                  onClick={handleEndBreak}
                  disabled={isLoading}
                  variant="default"
                  className="w-full"
                  size="lg"
                >
                  <Coffee className="mr-2 h-5 w-5" />
                  {isLoading ? 'Ending Break...' : 'End Break'}
                </Button>
              )}
            </div>

            {/* Status Messages */}
            <div className="space-y-2">
              {todayRecord?.isLate && (
                <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded p-2 text-center">
                  ⚠️ Late arrival recorded ({todayRecord.lateMinutes} minutes late)
                </div>
              )}

              {todayRecord?.isEarlyDeparture && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center">
                  ⚠️ Early departure recorded ({todayRecord.earlyExitMinutes} minutes early)
                </div>
              )}

              {/* Shift-based warnings */}
              {todayRecord?.shift && !isActive && !todayRecord?.clockOut && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center">
                  ⚠️ You haven't clocked in yet. Your shift started at {todayRecord.shift.shiftStartTime}
                </div>
              )}

              {/* Missing clock-out warning */}
              {isActive && todayRecord?.shift && (() => {
                const now = new Date();
                const today = now.toISOString().split('T')[0];
                const shiftEndTime = new Date(`${today} ${todayRecord.shift.shiftEndTime}`);
                const isAfterShiftEnd = now > shiftEndTime;
                
                return isAfterShiftEnd && (
                  <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-2 text-center">
                    ⏰ Your shift ended at {todayRecord.shift.shiftEndTime}. Don't forget to clock out!
                  </div>
                );
              })()}

              {/* Overtime indication */}
              {todayRecord?.overtimeHours > 0 && (
                <div className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded p-2 text-center">
                  💼 Overtime: {todayRecord.overtimeHours} hours
                </div>
              )}

              {/* Potential overtime warning */}
              {isActive && todayRecord?.shift && (() => {
                const now = new Date();
                const today = now.toISOString().split('T')[0];
                const shiftEndTime = new Date(`${today} ${todayRecord.shift.shiftEndTime}`);
                const isNearOvertimeThreshold = now > new Date(shiftEndTime.getTime() - (30 * 60 * 1000)); // 30 minutes before overtime
                const isInOvertime = now > shiftEndTime;
                
                if (isInOvertime) {
                  const overtimeMinutes = Math.floor((now - shiftEndTime) / (1000 * 60));
                  return (
                    <div className="text-sm text-purple-600 bg-purple-50 border border-purple-200 rounded p-2 text-center">
                      ⏰ Currently in overtime: {Math.floor(overtimeMinutes / 60)}h {overtimeMinutes % 60}m
                    </div>
                  );
                } else if (isNearOvertimeThreshold) {
                  const minutesToOvertime = Math.floor((shiftEndTime - now) / (1000 * 60));
                  return (
                    <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-2 text-center">
                      ⚡ Approaching overtime in {minutesToOvertime} minutes
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Enhanced Debug Info
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs bg-gray-100 p-3 rounded mt-2 space-y-2">
                <div className="font-bold text-gray-800">🔍 Debug Information:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="font-semibold">Status:</div>
                    <div>isClockedIn: {isActive ? 'true' : 'false'}</div>
                    <div>isOnBreak: {isOnBreak ? 'true' : 'false'}</div>
                    <div>hasLegacyClockIn: {hasLegacyClockIn ? 'true' : 'false'}</div>
                    <div>hasCompletedSessions: {hasCompletedSessions ? 'true' : 'false'}</div>
                  </div>
                  <div>
                    <div className="font-semibold">Times:</div>
                    <div>clockIn: {todayRecord?.clockIn ? new Date(todayRecord.clockIn).toLocaleTimeString() : 'null'}</div>
                    <div>clockOut: {todayRecord?.clockOut ? new Date(todayRecord.clockOut).toLocaleTimeString() : 'null'}</div>
                    <div>lastUpdated: {useAttendanceSessionStore.getState().lastUpdated?.toLocaleTimeString() || 'null'}</div>
                  </div>
                </div>
                <div>
                  <div className="font-semibold">Break Sessions ({todayRecord?.breakSessions?.length || 0}):</div>
                  <div className="max-h-20 overflow-y-auto bg-white p-1 rounded text-xs">
                    {todayRecord?.breakSessions?.length > 0 ? (
                      <div>
                        <div className="font-bold text-blue-600">BREAK SESSIONS:</div>
                        {todayRecord.breakSessions.map((session, index) => (
                          <div key={`break-${index}`} className="border-b pb-1 mb-1 bg-blue-50">
                            Break {index + 1}: 
                            In: {session.breakIn ? new Date(session.breakIn).toLocaleTimeString() : 'null'} | 
                            Out: {session.breakOut ? new Date(session.breakOut).toLocaleTimeString() : 'ACTIVE'} | 
                            Duration: {session.duration || 0}m
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>No break sessions</div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="font-semibold">Active Session:</div>
                  <div className="max-h-16 overflow-y-auto bg-white p-1 rounded text-xs">
                    {todayRecord ? JSON.stringify({
                      clockIn: todayRecord.clockIn,
                      clockOut: todayRecord.clockOut,
                      status: todayRecord.status,
                      totalWorkedMinutes: todayRecord.totalWorkedMinutes,
                      totalBreakMinutes: todayRecord.totalBreakMinutes,
                      breakSessions: todayRecord.breakSessions?.length || 0
                    }, null, 2) : 'null'}
                  </div>
                </div>
                <div>
                  <div className="font-semibold">Today Record Keys:</div>
                  <div className="text-xs">{todayRecord ? Object.keys(todayRecord).join(', ') : 'null'}</div>
                </div>
                <div>
                  <div className="font-semibold">Store State:</div>
                  <div className="text-xs">
                    Loading: {isLoading ? 'true' : 'false'} | 
                    Error: {useAttendanceSessionStore.getState().error || 'null'} | 
                    Initialized: {useAttendanceSessionStore.getState().initialized ? 'true' : 'false'}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => attendanceDebugger.testBreakFlow()}
                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Test Break Flow
                  </button>
                  <button
                    onClick={() => attendanceDebugger.testDataFetching()}
                    className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                  >
                    Test Data Fetch
                  </button>
                  <button
                    onClick={() => attendanceDebugger.analyzeStoreState(useAttendanceSessionStore)}
                    className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                  >
                    Analyze Store
                  </button>
                  <button
                    onClick={() => fetchTodayRecord(false)}
                    className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                  >
                    Force Refresh
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/employee/attendance/today', {
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json'
                          }
                        });
                        const data = await response.json();
                        console.log('🧪 [DIRECT API TEST] Raw response:', data);
                        console.log('🧪 [DIRECT API TEST] Break sessions:', data.data?.breakSessions);
                      } catch (error) {
                        console.error('🧪 [DIRECT API TEST] Error:', error);
                      }
                    }}
                    className="px-2 py-1 bg-pink-500 text-white text-xs rounded hover:bg-pink-600"
                  >
                    Direct API Test
                  </button>
                </div>
              </div>
            )} */}
          </div>
        </CardContent>
      </Card>

      {/* Location Selection Modal */}
      <LocationSelectionModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onConfirm={handleLocationConfirm}
        loading={isLoading}
      />
    </>
  );
};

export default EnhancedClockInOut;