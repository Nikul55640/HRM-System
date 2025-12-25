import React, { useState, useEffect } from 'react';
import { Clock, Calendar, TrendingUp, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../core/services/api';

const AttendanceDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState({
    todayStatus: null,
    weeklyStats: {},
    monthlyStats: {},
    recentSessions: []
  });

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employee/attendance/dashboard');
      if (response.data.success) {
        setAttendanceData(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Attendance Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Track your attendance and work hours</p>
      </div>

      {/* Today's Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Today's Status</p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">
                {attendanceData.todayStatus?.status || 'Not Clocked In'}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
          {attendanceData.todayStatus?.clockIn && (
            <div className="mt-4 text-sm text-gray-600">
              <p>Clock In: {attendanceData.todayStatus.clockIn}</p>
              {attendanceData.todayStatus.clockOut && (
                <p>Clock Out: {attendanceData.todayStatus.clockOut}</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Hours This Week</p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">
                {attendanceData.weeklyStats?.totalHours || '0'}h
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
              <p className="text-2xl font-semibold text-gray-800 mt-1">
                {attendanceData.monthlyStats?.attendanceRate || '0'}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Recent Sessions</h2>
        </div>
        <div className="p-6">
          {attendanceData.recentSessions?.length > 0 ? (
            <div className="space-y-4">
              {attendanceData.recentSessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-800">{session.date}</p>
                      <p className="text-sm text-gray-500">{session.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">{session.totalHours}h</p>
                    <p className="text-sm text-gray-500">
                      {session.clockIn} - {session.clockOut || 'Active'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent sessions found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;