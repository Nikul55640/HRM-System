import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Clock, LogIn, LogOut, Coffee, MapPin, Building2, Home, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import LocationSelectionModal from './LocationSelectionModal';
import useAttendanceSessionStore from '../../../stores/useAttendanceSessionStore';



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
} = useAttendanceSessionStore();

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

  const handleLocationConfirm = async (locationData) => {
    try {
      const result = await clockIn(locationData);
      
      if (result.success) {
        toast.success('Clocked in successfully!');
        setShowLocationModal(false);
      } else {
        toast.error(result.error || 'Failed to clock in');
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
      const result = await startBreak();
      
      if (result.success) {
        toast.success('Break started');
      } else {
        toast.error(result.error || 'Failed to start break');
      }
    } catch (error) {
      toast.error('Failed to start break');
    }
  };

  const handleEndBreak = async () => {
    try {
      const result = await endBreak();
      
      if (result.success) {
        toast.success('Break ended');
      } else {
        toast.error(result.error || 'Failed to end break');
      }
    } catch (error) {
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
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Clock In/Out
          </CardTitle>
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
            {(activeSession || hasLegacyClockIn) && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {activeSession ? (
                      <>
                        {getLocationIcon(activeSession.workLocation)}
                        <span className="font-medium">
                          {getLocationLabel(activeSession.workLocation)}
                        </span>
                      </>
                    ) : (
                      <>
                        <Building2 className="h-4 w-4" />
                        <span className="font-medium">Office (Legacy)</span>
                      </>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isOnBreak
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {isOnBreak ? '☕ On Break' : '🟢 Active'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Clock In</div>
                    <div className="font-semibold">
                      {new Date(activeSession?.checkIn || todayRecord?.checkIn).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Worked Time</div>
                    <div className="font-semibold">
                      {activeSession ? 
                        formatDuration(activeSession.workedMinutes || 0) :
                        formatDuration(calculateWorkedMinutes(todayRecord?.checkIn))
                      }
                    </div>
                  </div>
                </div>

                {activeSession?.locationDetails && (
                  <div className="text-sm text-muted-foreground">
                    📍 {activeSession.locationDetails}
                  </div>
                )}

                {activeSession?.breaks && activeSession.breaks.length > 0 && (
                  <div className="text-sm">
                    <div className="text-muted-foreground">
                      Breaks: {activeSession.breaks.length} ({formatDuration(activeSession.totalBreakMinutes || 0)})
                    </div>
                  </div>
                )}

                {hasLegacyClockIn && (
                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    ⚠️ Legacy clock-in detected. Please clock out and use the new session system for better tracking.
                  </div>
                )}
              </div>
            )}

            {/* Completed Sessions Today */}
            {hasCompletedSessions && (
              <div className="text-sm text-muted-foreground text-center">
                ✓ {todayRecord.sessions.filter((s) => s.status === 'completed').length} session(s) completed today
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {!activeSession && (
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

              {isActive && (
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
            {todayRecord?.isLate && (
              <div className="text-sm text-orange-600 text-center">
                ⚠️ Late arrival recorded
              </div>
            )}
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
