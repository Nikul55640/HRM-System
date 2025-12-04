import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { attendanceService } from '../../../services';
import { formatDate } from '../../../utils/essHelpers';
import useAuth from '../../../hooks/useAuth';

const MyAttendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayRecord, setTodayRecord] = useState(null);

  // Check if user is an employee
  if (!user?.employeeId) {
    return (
      <div className="p-6">
        <Card className="border-gray-200">
          <CardContent className="py-12 text-center">
            <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Employee Access Only</p>
            <p className="text-sm text-gray-500 mt-2">
              This feature is only available for employees with an employee profile.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Please contact HR if you need access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    console.log('🔄 [ATTENDANCE] Fetching attendance records...');
    try {
      setLoading(true);
      const response = await attendanceService.getMyAttendance();
      console.log('✅ [ATTENDANCE] Response received:', response);
      
      if (response.success) {
        setAttendance(response.data || []);
        console.log('✅ [ATTENDANCE] Records loaded:', response.data?.length || 0);
        // Find today's record
        const today = new Date().toDateString();
        const todayRec = response.data?.find(
          rec => new Date(rec.date).toDateString() === today
        );
        setTodayRecord(todayRec);
        console.log('📅 [ATTENDANCE] Today\'s record:', todayRec);
      }
    } catch (error) {
      
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await attendanceService.checkIn();
      if (response.success) {
        toast.success('Checked in successfully');
        fetchAttendance();
      }
    } catch (error) {
      toast.error('Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await attendanceService.checkOut();
      if (response.success) {
        toast.success('Checked out successfully');
        fetchAttendance();
      }
    } catch (error) {
      toast.error('Failed to check out');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'absent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'late':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'half_day':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading attendance...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">My Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Track your attendance and work hours</p>
      </div>

      {/* Today's Status */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-800">
            Today's Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {todayRecord ? (
                    <>
                      Check In: {todayRecord.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      {todayRecord.checkOut && (
                        <> | Check Out: {new Date(todayRecord.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</>
                      )}
                    </>
                  ) : (
                    'Not checked in yet'
                  )}
                </p>
                {todayRecord && (
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium border mt-1 ${getStatusColor(todayRecord.status)}`}>
                    {todayRecord.status}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!todayRecord?.checkIn && (
                <Button onClick={handleCheckIn}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Check In
                </Button>
              )}
              {todayRecord?.checkIn && !todayRecord?.checkOut && (
                <Button variant="outline" onClick={handleCheckOut}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Check Out
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-800">
            Attendance History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No attendance records found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Check In</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Check Out</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Work Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendance.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {record.workHours ? `${record.workHours}h` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyAttendance;
