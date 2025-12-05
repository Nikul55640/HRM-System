import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Clock, LogIn, LogOut, Coffee, MapPin, Building2, Home, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import LocationSelectionModal from './LocationSelectionModal';

const EnhancedClockInOut = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch today's attendance record
  useEffect(() => {
    fetchTodayRecord();
  }, []);

  const fetchTodayRecord = async () => {
    try {
      console.log('📊 [FETCH] Fetching today\'s attendance record...');
      
      const today = new Date();
      const response = await api.get('/employee/attendance', {
        params: {
          year: today.getFullYear(),
          month: today.getMonth() + 1,
          limit: 1,
        },
      });

      console.log('📊 [FETCH] Response:', response.data);

      if (response.data.success && response.data.data.length > 0) {
        const record = response.data.data[0];
        const recordDate = new Date(record.date);
        const isToday = recordDate.toDateString() === today.toDateString();

        console.log('📊 [FETCH] Record date:', recordDate.toDateString());
        console.log('📊 [FETCH] Today:', today.toDateString());
        console.log('📊 [FETCH] Is today?', isToday);
        console.log('📊 [FETCH] Record sessions:', record.sessions);

        if (isToday) {
          setTodayRecord(record);
          console.log('✅ [FETCH] Today\'s record set:', record);
        } else {
          console.log('⚠️ [FETCH] Record is not for today');
        }
      } else {
        console.log('⚠️ [FETCH] No records found');
      }
    } catch (error) {
      if (error.status === 403 || error.status === 500) {
        toast.error(error.message || 'Failed to load attendance data');
      }
      console.error('❌ [FETCH] Error fetching today record:', error);
    }
  };

  const handleClockInClick = () => {
    setShowLocationModal(true);
  };

  const handleLocationConfirm = async (locationData) => {
    try {
      console.log('🔵 [CLOCK-IN] Starting clock-in process...');
      console.log('🔵 [CLOCK-IN] Location data:', locationData);
      
      setLoading(true);
      const response = await api.post('/employee/attendance/session/start', locationData);
      
      console.log('✅ [CLOCK-IN] Response received:', response.data);

      if (response.data.success) {
        toast.success('Clocked in successfully!');
        setShowLocationModal(false);
        fetchTodayRecord();
      }
    } catch (error) {
      console.error('❌ [CLOCK-IN] Error:', error);
      console.error('❌ [CLOCK-IN] Error response:', error.response?.data);
      const message = error.response?.data?.message || 'Failed to clock in';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      console.log('🔴 [CLOCK-OUT] Starting clock-out process...');
      
      setLoading(true);
      const response = await api.post('/employee/attendance/session/end');
      
      console.log('✅ [CLOCK-OUT] Response received:', response.data);

      if (response.data.success) {
        toast.success('Clocked out successfully!');
        fetchTodayRecord();
      }
    } catch (error) {
      console.error('❌ [CLOCK-OUT] Error:', error);
      console.error('❌ [CLOCK-OUT] Error response:', error.response?.data);
      const message = error.response?.data?.message || 'Failed to clock out';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartBreak = async () => {
    try {
      console.log('☕ [START-BREAK] Starting break...');
      
      setLoading(true);
      const response = await api.post('/employee/attendance/break/start');
      
      console.log('✅ [START-BREAK] Response received:', response.data);

      if (response.data.success) {
        toast.success('Break started');
        fetchTodayRecord();
      }
    } catch (error) {
      console.error('❌ [START-BREAK] Error:', error);
      console.error('❌ [START-BREAK] Error response:', error.response?.data);
      const message = error.response?.data?.message || 'Failed to start break';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEndBreak = async () => {
    try {
      console.log('☕ [END-BREAK] Ending break...');
      
      setLoading(true);
      const response = await api.post('/employee/attendance/break/end');
      
      console.log('✅ [END-BREAK] Response received:', response.data);

      if (response.data.success) {
        toast.success('Break ended');
        fetchTodayRecord();
      }
    } catch (error) {
      console.error('❌ [END-BREAK] Error:', error);
      console.error('❌ [END-BREAK] Error response:', error.response?.data);
      const message = error.response?.data?.message || 'Failed to end break';
      toast.error(message);
    } finally {
      setLoading(false);
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

  // Get active session
  const activeSession = todayRecord?.sessions?.find(
    (s) => s.status === 'active' || s.status === 'on_break'
  );

  const isActive = activeSession && activeSession.status === 'active';
  const isOnBreak = activeSession && activeSession.status === 'on_break';
  const hasCompletedSessions = todayRecord?.sessions?.some((s) => s.status === 'completed');

  // Debug logs
  console.log('🎯 [RENDER] Today Record:', todayRecord);
  console.log('🎯 [RENDER] Active Session:', activeSession);
  console.log('🎯 [RENDER] Is Active:', isActive);
  console.log('🎯 [RENDER] Is On Break:', isOnBreak);
  console.log('🎯 [RENDER] Has Completed Sessions:', hasCompletedSessions);

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
            {activeSession && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getLocationIcon(activeSession.workLocation)}
                    <span className="font-medium">
                      {getLocationLabel(activeSession.workLocation)}
                    </span>
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
                      {new Date(activeSession.checkIn).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Worked Time</div>
                    <div className="font-semibold">
                      {formatDuration(activeSession.workedMinutes || 0)}
                    </div>
                  </div>
                </div>

                {activeSession.locationDetails && (
                  <div className="text-sm text-muted-foreground">
                    📍 {activeSession.locationDetails}
                  </div>
                )}

                {activeSession.breaks && activeSession.breaks.length > 0 && (
                  <div className="text-sm">
                    <div className="text-muted-foreground">
                      Breaks: {activeSession.breaks.length} ({formatDuration(activeSession.totalBreakMinutes || 0)})
                    </div>
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
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  {loading ? 'Processing...' : 'Clock In'}
                </Button>
              )}

              {isActive && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleStartBreak}
                      disabled={loading}
                      variant="outline"
                      size="lg"
                    >
                      <Coffee className="mr-2 h-4 w-4" />
                      Start Break
                    </Button>
                    <Button
                      onClick={handleClockOut}
                      disabled={loading}
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
                  disabled={loading}
                  variant="default"
                  className="w-full"
                  size="lg"
                >
                  <Coffee className="mr-2 h-5 w-5" />
                  {loading ? 'Ending Break...' : 'End Break'}
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
        loading={loading}
      />
    </>
  );
};

export default EnhancedClockInOut;
