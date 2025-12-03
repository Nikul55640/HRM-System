import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  XCircle, 
  User, 
  Briefcase, 
  Building2, 
  CheckCircle2, 
  Users, 
  FileText, 
  Clock 
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useAuth from '../../hooks/useAuth';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardData({
        attendanceLimit: 5,
        activityLimit: 10,
      });
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const profile = dashboardData?.profile;
  const leave = dashboardData?.leave;
  const recentActivity = dashboardData?.recentActivity || [];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Profile Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">Welcome back</dt>
              <dd className="text-lg font-semibold text-gray-900">{profile?.fullName || user?.email}</dd>
            </div>
          </div>
        </div>

        {/* Job Title Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">Job Title</dt>
              <dd className="text-lg font-semibold text-gray-900">{profile?.jobTitle || 'N/A'}</dd>
            </div>
          </div>
        </div>

        {/* Department Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">Department</dt>
              <dd className="text-lg font-semibold text-gray-900">{profile?.department?.name || 'N/A'}</dd>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">Status</dt>
              <dd className="text-lg font-semibold text-gray-900">{profile?.status || 'Active'}</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Balance Section */}
      {leave && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Leave Balance</h2>
          {leave.message ? (
            <p className="text-sm text-gray-500 italic">{leave.message}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Annual Leave</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{leave.annual?.remaining || 0}</p>
                <p className="text-xs text-gray-500 mt-1">of {leave.annual?.total || 0} days</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Sick Leave</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{leave.sick?.remaining || 0}</p>
                <p className="text-xs text-gray-500 mt-1">of {leave.sick?.total || 0} days</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">Personal Leave</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{leave.personal?.remaining || 0}</p>
                <p className="text-xs text-gray-500 mt-1">of {leave.personal?.total || 0} days</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <User className="h-5 w-5 mr-2 text-gray-400" />
              View Profile
            </button>

            <button
              onClick={() => navigate('/directory')}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Users className="h-5 w-5 mr-2 text-gray-400" />
              Directory
            </button>

            <button
              onClick={() => navigate('/documents')}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FileText className="h-5 w-5 mr-2 text-gray-400" />
              Documents
            </button>

            {(user?.role === 'HR Administrator' || user?.role === 'HR Manager') && (
              <button
                onClick={() => navigate('/employees')}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Users className="h-5 w-5 mr-2 text-gray-400" />
                Manage Employees
              </button>
            )}

            {user?.role === 'SuperAdmin' && (
              <button
                onClick={() => navigate('/users')}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Users className="h-5 w-5 mr-2 text-gray-400" />
                Manage Users
              </button>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No recent activity</p>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.slice(0, 5).map((activity, idx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {idx !== recentActivity.slice(0, 5).length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white">
                            <Clock className="h-5 w-5 text-white" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-900">{activity.description}</p>
                            {activity.performedBy && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                by {activity.performedBy.email}
                              </p>
                            )}
                          </div>
                          <div className="whitespace-nowrap text-right text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
