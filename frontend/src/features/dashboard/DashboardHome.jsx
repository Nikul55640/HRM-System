import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { XCircle, Users, Calendar, Clock, TrendingUp } from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { usePermissions } from '../../hooks';
import { MODULES } from '../../utils/rolePermissions';

const DashboardHome = () => {
  const { can } = usePermissions();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    console.log('🔄 [DASHBOARD] Fetching dashboard data...');
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardData({
        attendanceLimit: 5,
        activityLimit: 10,
      });
      console.log('✅ [DASHBOARD] Data fetched successfully:', data);
      setDashboardData(data.data);
    } catch (err) {
      
      setError(err.message || 'Failed to load dashboard data');
      toast.error(err.message || 'Failed to load dashboard data');
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
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900">Error loading dashboard</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const recentActivity = dashboardData?.recentActivity || [];

  // Define stat cards with permission checks
  const allStatCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees || 0,
      icon: Users,
      color: 'text-blue-600',
      showIf: () => can.doAny([MODULES.EMPLOYEE.VIEW_ALL, MODULES.EMPLOYEE.VIEW_TEAM]),
    },
    {
      title: 'Present Today',
      value: stats.presentToday || 0,
      icon: Clock,
      color: 'text-green-600',
      showIf: () => can.doAny([MODULES.ATTENDANCE.VIEW_ALL, MODULES.ATTENDANCE.VIEW_TEAM]),
    },
    {
      title: 'On Leave',
      value: stats.onLeave || 0,
      icon: Calendar,
      color: 'text-orange-600',
      showIf: () => can.doAny([MODULES.LEAVE.VIEW_ALL, MODULES.LEAVE.VIEW_TEAM]),
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals || 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      showIf: () => can.doAny([MODULES.LEAVE.APPROVE_ANY, MODULES.LEAVE.APPROVE_TEAM, MODULES.ATTENDANCE.APPROVE_CORRECTION]),
    },
  ];

  // Filter stat cards based on permissions
  const statCards = allStatCards.filter(card => card.showIf());

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-gray-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-gray-800">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <div>
                      <p className="text-gray-700">{activity.description}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800">
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Attendance Rate</span>
                <span className="text-sm font-medium text-gray-800">
                  {stats.attendanceRate || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Leave Requests</span>
                <span className="text-sm font-medium text-gray-800">
                  {stats.leaveRequests || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Hires</span>
                <span className="text-sm font-medium text-gray-800">
                  {stats.newHires || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
