import React, { useState, useEffect } from 'react';
import { Clock, Coffee, Play, Pause, Square, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../core/services/api';

const SimpleAttendancePage = () => {
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSession, setCurrentSession] = useState(null);
  const [currentBreak, setCurrentBreak] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('Office');
  const [breakType, setBreakType] = useState('personal');

  const workLocations = ['Office', 'Home', 'Client Site', 'Field Work'];
  const breakTypes = [
    { value: 'lunch', label: 'Lunch Break', icon: '🍽️' },
    { value: 'tea', label: 'Tea Break', icon: '☕' },
    { value: 'personal', label: 'Personal Break', icon: '🚶' },
    { value: 'meeting', label: 'Meeting Break', icon: '📋' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    fetchCurrentSession();
    fetchCurrentBreak();

    return () => clearInterval(timer);
  }, []);

  const fetchCurrentSession = async () => {
    try {
      const response = await api.get('/employee/attendance/current-session');
      if (response.data.success && response.data.data) {
        setCurrentSession(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching current session:', error);
    }
  };

  const fetchCurrentBreak = async () => {
    try {
      const response = await api.get('/employee/attendance/current-break');
      if (response.data.success && response.data.data) {
        setCurrentBreak(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching current break:', error);
    }
  };

  const handleClockIn = async () => {
    try {
      setLoading(true);
      const response = await api.post('/employee/attendance/clock-in', {
        workLocation: selectedLocation,
        timestamp: new Date().toISOString()
      });

      if (response.data.success) {
        toast.success('Clocked in successfully!');
        setCurrentSession(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to clock in');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setLoading(true);
      const response = await api.post('/employee/attendance/clock-out', {
        timestamp: new Date().toISOString()
      });

      if (response.data.success) {
        toast.success('Clocked out successfully!');
        setCurrentSession(null);
        setCurrentBreak(null);
      } else {
        toast.error(response.data.message || 'Failed to clock out');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clock out');
    } finally {
      setLoading(false);
    }
  };

  const handleStartBreak = async () => {
    try {
      setLoading(true);
      const response = await api.post('/employee/attendance/break/start', {
        breakType,
        timestamp: new Date().toISOString()
      });

      if (response.data.success) {
        toast.success('Break started successfully!');
        setCurrentBreak(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to start break');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start break');
    } finally {
      setLoading(false);
    }
  };

  const handleEndBreak = async () => {
    try {
      setLoading(true);
      const response = await api.post('/employee/attendance/break/end', {
        timestamp: new Date().toISOString()
      });

      if (response.data.success) {
        toast.success('Break ended successfully!');
        setCurrentBreak(null);
      } else {
        toast.error(response.data.message || 'Failed to end break');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to end break');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getWorkedHours = () => {
    if (!currentSession?.clockIn) return '0h 0m';
    
    const start = new Date(currentSession.clockIn);
    const now = new Date();
    const diff = now - start;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const getBreakDuration = () => {
    if (!currentBreak?.startTime) return '0m';
    
    const start = new Date(currentBreak.startTime);
    const now = new Date();
    const diff = now - start;
    
    const minutes = Math.floor(diff / (1000 * 60));
    
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Current Time Display */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center">
            <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <div className="text-4xl font-bold text-gray-800 mb-2">
              {formatTime(currentTime)}
            </div>
            <div className="text-gray-500 mb-6">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>

            {/* Session Status */}
            {currentSession ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-green-800 font-medium">Currently Active</span>
                </div>
                <div className="text-sm text-green-600 space-y-1">
                  <div className="flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Started: {new Date(currentSession.clockIn).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="flex items-center justify-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {currentSession.workLocation}
                  </div>
                  <div className="font-medium">
                    Worked: {getWorkedHours()}
                  </div>
                  {currentBreak && (
                    <div className="text-orange-600 font-medium">
                      On Break: {getBreakDuration()}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-gray-600">Not clocked in today</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {!currentSession ? (
                // Clock In Section
                <div className="space-y-3">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {workLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleClockIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-lg"
                  >
                    <Play className="w-5 h-5" />
                    {loading ? 'Clocking In...' : 'Clock In'}
                  </button>
                </div>
              ) : (
                // Active Session Controls
                <div className="space-y-3">
                  {/* Break Controls */}
                  {currentBreak ? (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-3">
                      <div className="text-orange-800 font-medium mb-2">
                        {breakTypes.find(bt => bt.value === currentBreak.breakType)?.icon} On Break
                      </div>
                      <div className="text-orange-600 text-sm mb-3">
                        {breakTypes.find(bt => bt.value === currentBreak.breakType)?.label} - {getBreakDuration()}
                      </div>
                      <button
                        onClick={handleEndBreak}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                      >
                        <Play className="w-4 h-4" />
                        {loading ? 'Ending Break...' : 'End Break'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <select
                        value={breakType}
                        onChange={(e) => setBreakType(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        {breakTypes.map(bt => (
                          <option key={bt.value} value={bt.value}>
                            {bt.icon} {bt.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleStartBreak}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
                      >
                        <Coffee className="w-4 h-4" />
                        {loading ? 'Starting Break...' : 'Start Break'}
                      </button>
                    </div>
                  )}

                  {/* Clock Out Button */}
                  <button
                    onClick={handleClockOut}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium text-lg"
                  >
                    <Square className="w-5 h-5" />
                    {loading ? 'Clocking Out...' : 'Clock Out'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Link */}
        <div className="text-center">
          <a 
            href="/employee/attendance" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View Full Attendance History →
          </a>
        </div>
      </div>
    </div>
  );
};

export default SimpleAttendancePage;