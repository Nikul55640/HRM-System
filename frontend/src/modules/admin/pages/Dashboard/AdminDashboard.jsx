import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../shared/ui/card';
import { Button } from '../../../../shared/ui/button';
import { HRMStatusBadge } from '../../../../shared/ui/HRMStatusBadge';
import { Badge } from '../../../../shared/ui/badge';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  Clock, 
  FileText, 
  AlertCircle,
  
} from 'lucide-react';
import { LoadingSpinner } from '../../../../shared/components';
import useAuth from '../../../../core/hooks/useAuth';
import { usePermissions } from '../../../../core/hooks';
import { MODULES } from '../../../../core/utils/rolePermissions';
import adminDashboardService from '../../../../services/adminDashboardService';
import { formatIndianCurrency, formatIndianNumber } from '../../../../utils/indianFormatters';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { can } = usePermissions();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  // Check if user has admin access
  if (!can.doAny([MODULES.EMPLOYEE.VIEW_ALL, MODULES.ATTENDANCE.VIEW_ALL, MODULES.LEAVE.VIEW_ALL])) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h3>
          <p className="text-red-700">You do not have permission to view the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const fetchAdminDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real admin dashboard data
      const data = await adminDashboardService.getAdminDashboard();
      
      setDashboardData(data);
    } catch (err) {
      setError(err.message || 'Failed to load admin dashboard');
      toast.error(err.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900">Error loading dashboard</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchAdminDashboard}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees || 0,
      icon: Users,
      color: 'blue',
      change: 'Employees ',
    },
    {
      title: 'Active Employees',
      value: stats.activeEmployees || 0,
      icon: Users,
      color: 'green',
      change: `${stats.onLeaveToday || 0} on leave`,
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals || 0,
      icon: Clock,
      color: 'orange',
      change: 'Requires attention',
    },
    {
      title: 'Total Payroll',
      value: formatIndianCurrency(stats.totalPayroll || 0),
      icon: DollarSign,
      color: 'purple',
      change: 'This month',
    },
  ];

  return (
    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {user?.fullName || 'Admin'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            orange: 'bg-orange-100 text-orange-600',
            purple: 'bg-purple-100 text-purple-600',
          };

          return (
            <Card key={index} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-lg font-semibold text-gray-800 mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800">
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-gray-800">
              {stats.departmentCount || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">Active departments</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800">
              New Hires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-gray-800">
              {stats.newHiresThisMonth || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800">
              Pending Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-gray-800">
              {stats.pendingDocuments || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Tasks */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800">
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.pendingTasks?.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    if (task.task.includes('leave')) navigate('/admin/leave');
                    if (task.task.includes('payroll')) navigate('/payroll');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500' : 'bg-orange-500'
                    }`}></div>
                    <span className="text-sm text-gray-700">{task.task}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {task.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.recentActivities?.map((activity) => (
                <div key={activity.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-3 h-3 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-800">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/admin/users')}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <Users className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <span className="text-sm text-gray-700">Manage Users</span>
            </button>
            <button
              onClick={() => navigate('/admin/leave')}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <Calendar className="w-5 h-5 text-green-600 mx-auto mb-2" />
              <span className="text-sm text-gray-700">Leave Requests</span>
            </button>
            <button
              onClick={() => navigate('/admin/attendance')}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <Clock className="w-5 h-5 text-purple-600 mx-auto mb-2" />
              <span className="text-sm text-gray-700">Attendance</span>
            </button>
            <button
              onClick={() => navigate('/admin/audit-logs')}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <FileText className="w-5 h-5 text-orange-600 mx-auto mb-2" />
              <span className="text-sm text-gray-700">Audit Logs</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;