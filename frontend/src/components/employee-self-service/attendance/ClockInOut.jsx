import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
    ;
import { Button } from '../../ui/button'
    ;
import { Clock, LogIn, LogOut, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../services/api'
    ;

const ClockInOut = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  // Fetch today's attendance record
  useEffect(() => {
    fetchTodayRecord();
  }, []);

  const fetchTodayRecord = async () => {
    try {
      const today = new Date();
      const response = await api.get('/employee/attendance', {
        params: {
          year: today.getFullYear(),
          month: today.getMonth() + 1,
          limit: 1,
        },
      });

      if (response.data.success && response.data.data.length > 0) {
        const record = response.data.data[0];
        const recordDate = new Date(record.date);
        const isToday = recordDate.toDateString() === today.toDateString();
        
        if (isToday) {
          setTodayRecord(record);
        }
      }
    } catch (error) {
      // Silently handle errors - component will show check-in button if no record
      if (error.response?.status !== 400) {
        console.error('Error fetching today record:', error);
      }
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const response = await api.post('/employee/attendance/check-in', {
        location,
      });

      if (response.data.success) {
        toast.success('Checked in successfully!');
        setTodayRecord(response.data.data);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to check in';
      toast.error(message);
      // If already checked in, refresh the record
      if (message.includes('Already checked in')) {
        fetchTodayRecord();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      const response = await api.post('/employee/attendance/check-out', {
        location,
      });

      if (response.data.success) {
        toast.success('Checked out successfully!');
        setTodayRecord(response.data.data);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to check out';
      toast.error(message);
      // If already checked out, refresh the record
      if (message.includes('Already checked out')) {
        fetchTodayRecord();
      }
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

  const isCheckedIn = todayRecord && todayRecord.checkIn && !todayRecord.checkOut;
  const isCheckedOut = todayRecord && todayRecord.checkOut;

  return (
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
            <div className="text-sm text-muted-foreground">
              {formatDate(currentTime)}
            </div>
          </div>

          {/* Location Status */}
          {location && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Location tracking enabled</span>
            </div>
          )}

          {/* Today's Record */}
          {todayRecord && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Check In</div>
                <div className="font-semibold">
                  {todayRecord.checkIn
                    ? new Date(todayRecord.checkIn).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Check Out</div>
                <div className="font-semibold">
                  {todayRecord.checkOut
                    ? new Date(todayRecord.checkOut).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'}
                </div>
              </div>
              {todayRecord.workHours > 0 && (
                <div className="col-span-2">
                  <div className="text-sm text-muted-foreground mb-1">Work Hours</div>
                  <div className="font-semibold">{todayRecord.workHours.toFixed(2)} hours</div>
                </div>
              )}
            </div>
          )}

          {/* Status Badge */}
          {isCheckedIn && !isCheckedOut && (
            <div className="text-center p-3 bg-blue-50 text-blue-700 rounded-lg font-medium">
              🟢 Currently Checked In
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!isCheckedIn && !isCheckedOut && (
              <Button
                onClick={handleCheckIn}
                disabled={loading}
                className="flex-1"
                size="lg"
              >
                <LogIn className="mr-2 h-5 w-5" />
                {loading ? 'Checking In...' : 'Check In'}
              </Button>
            )}

            {isCheckedIn && !isCheckedOut && (
              <Button
                onClick={handleCheckOut}
                disabled={loading}
                variant="destructive"
                className="flex-1"
                size="lg"
              >
                <LogOut className="mr-2 h-5 w-5" />
                {loading ? 'Checking Out...' : 'Check Out'}
              </Button>
            )}

            {isCheckedOut && (
              <div className="flex-1 text-center p-4 bg-green-50 text-green-700 rounded-lg font-semibold">
                ✓ Completed for today
              </div>
            )}
          </div>

          {/* Status Messages */}
          {todayRecord?.isLate && (
            <div className="text-sm text-orange-600 text-center">
              ⚠️ Late arrival recorded
            </div>
          )}
          {todayRecord?.isEarlyDeparture && (
            <div className="text-sm text-orange-600 text-center">
              ⚠️ Early departure recorded
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClockInOut;
