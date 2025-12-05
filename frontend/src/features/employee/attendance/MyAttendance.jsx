import { Card, CardContent } from '../../../components/ui/card';
import { XCircle } from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import EnhancedClockInOut from './EnhancedClockInOut';
import SessionHistoryView from './SessionHistoryView';

const MyAttendance = () => {
  const { user } = useAuth();
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">My Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">
          Track your attendance with multiple sessions, breaks, and work locations
        </p>
      </div>

      {/* Enhanced Clock In/Out Component */}
      <EnhancedClockInOut />

      {/* Session History Component */}
      <SessionHistoryView />
    </div>
  );
};

export default MyAttendance;
