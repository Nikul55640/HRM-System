import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, FileText, DollarSign, Clock, User, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Megaphone, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/essHelpers';
import { Button } from '../../components/ui/button';
import LeaveBalanceWidget from '../ess/leave/LeaveBalanceWidget';
import AttendanceWidget from '../ess/attendance/AttendanceWidget';
import RequestsWidget from '../ess/requests/RequestsWidget';
import RecentActivityWidget from '../../components/employee-self-service/dashboard/RecentActivityWidget';
import QuickActionsWidget  from '../../components/employee-self-service/dashboard/QuickActionsWidget';
import { 
  fetchLeaveBalance, 
  fetchAttendanceSummary,
  fetchRequests,
  fetchNotifications 
} from '../../store/thunks/employeeSelfServiceThunks';
const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    leaveBalance, 
    attendanceSummary, 
    requests,
    notifications,
    dashboardLoading 
  } = useSelector((state) => state.employeeSelfService);

  useEffect(() => {
    // Fetch dashboard data
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    dispatch(fetchLeaveBalance());
    dispatch(fetchAttendanceSummary({ month: currentMonth, year: currentYear }));
    dispatch(fetchRequests({ limit: 10 }));
    dispatch(fetchNotifications({ limit: 5 }));
  }, [dispatch]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.email?.split('@')[0] || 'Employee'}!</h1>
          <p className="text-muted-foreground">Here is your overview for today</p>
        </div>
        <Button variant="outline" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LeaveBalanceWidget leaveBalance={leaveBalance} />
        <AttendanceWidget attendanceSummary={attendanceSummary} />
        <RequestsWidget requests={requests} />
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivityWidget notifications={notifications} />
        </div>
        <div>
          <QuickActionsWidget />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
