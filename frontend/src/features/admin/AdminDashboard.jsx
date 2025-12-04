import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, DollarSign, Calendar, TrendingUp, Clock, FileText, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useAuth from '../../hooks/useAuth';
import { usePermissions } from '../../hooks';
import { MODULES } from '../../utils/rolePermissions';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { can } = usePermissions();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  const fetchAdminDashboard = async () => {
    console.log('🔄 [ADMIN DASHBOARD] Fetching admin dashboard data...');
    try {
      setLoading(true);
      setError(null);
      
      // Mock admin dashboard data
      console.warn('⚠️ [ADMIN DASHBOARD] Using mock data - API endpoint not fully implemented');
      const mockData = {
        stats: {
          totalEmployees: 150,
          activeEmployees: 142,
          onLeaveToday: 8,
          pendingApprovals: 12,
          totalPayroll: 2500000,
          departmentCount: 8,
          newHiresThisMonth: 5,
          pendingDocuments: 15
        },
        recentActivities: [
          { id: 1, action: 'New employee onboarded', user: 'John Doe', time: '2 hours ago' },
          { id: 2, action: 'Leave request approved', user: 'Jane Smith', time: '3 hours ago' },
          { id: 3, action: 'Payroll processed', user: 'System', time: '5 hours ago' },
        ],
        pendingTasks: [
          { id: 1, task: 'Review leave requests', count: 5, priority: 'high' },
          { id: 2, task: 'Approve timesheets', count: 12, priority: 'medium' },
          { id: 3, task: 'Process payroll', count: 1, priority: 'high' },
        ]
      };
      
      setDashboardData(mockData);
      console.log('✅ [ADMIN DASHBOARD] Data loaded successfully');
    } catch (err) {
      console.error('❌ [ADMIN DASHBOARD] Failed to fetch data:', err);
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
      change: '+5 this month',
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
      value: `₹${(stats.totalPayroll || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'purple',
      change: 'This month',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {user?.fullName || 'Admin'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-800 mt-2">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800">
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-800">
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
            <div className="text-3xl font-semibold text-gray-800">
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
            <div className="text-3xl font-semibold text-gray-800">
              {stats.pendingDocuments || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    if (task.task.includes('leave')) navigate('/admin/leave-requests');
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
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-600" />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/users')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <span className="text-sm text-gray-700">Manage Users</span>
            </button>
            <button
              onClick={() => navigate('/admin/leave-requests')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <span className="text-sm text-gray-700">Leave Requests</span>
            </button>
            <button
              onClick={() => navigate('/payroll')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm text-gray-700">Payroll</span>
            </button>
            <button
              onClick={() => navigate('/admin/logs')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
            >
              <FileText className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <span className="text-sm text-gray-700">Audit Logs</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
