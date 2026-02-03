import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  ChevronRight, 
  RefreshCw,
  AlertTriangle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import useLeaveBalance from '../hooks/useLeaveBalance';

/**
 * Leave Balance Widget for Employee Dashboard
 * Shows a summary of leave balance with quick actions
 */
const LeaveBalanceWidget = ({ showActions = true, compact = false }) => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    leaveBalance, 
    summary, 
    loading, 
    error,
    refreshBalance,
    lastFetched 
  } = useLeaveBalance();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    setIsRefreshing(false);
  };

  const handleViewDetails = () => {
    navigate('/leave');
  };

  const handleApplyLeave = () => {
    navigate('/leave?action=apply');
  };

  if (loading && !leaveBalance) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading leave balance...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-medium">Failed to load leave balance</p>
              <p className="text-sm text-red-500">{error}</p>
            </div>
          </div>
          {showActions && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="mt-3 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!leaveBalance || !leaveBalance.leaveTypes || leaveBalance.leaveTypes.length === 0) {
    return (
      <Card className="border-yellow-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-600" />
            Leave Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">No leave balance assigned</p>
            <p className="text-sm text-gray-500 mt-1">
              Please contact HR to set up your leave balance.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the most important leave types to display
  const primaryLeaveTypes = leaveBalance.leaveTypes
    .filter(lt => ['casual', 'sick', 'paid'].includes(lt.type))
    .slice(0, compact ? 2 : 3);

  return (
    <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Leave Balance
          </CardTitle>
          {showActions && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title={lastFetched ? `Last updated: ${lastFetched.toLocaleTimeString()}` : 'Refresh'}
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
        {summary && (
          <div className="text-sm text-gray-600">
            {summary.totalAvailable} of {summary.totalAllocated} days available
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Leave Type Breakdown */}
        <div className="space-y-3">
          {primaryLeaveTypes.map((leaveType) => (
            <div key={leaveType.type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getLeaveTypeColor(leaveType.type)}`} />
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {leaveType.type}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">{leaveType.used}/{leaveType.allocated}</span>
                <span className="font-semibold text-gray-900">
                  {leaveType.available} left
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        {!compact && summary && (
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-blue-500" />
              </div>
              <div className="text-lg font-bold text-blue-600">{summary.totalAvailable}</div>
              <div className="text-xs text-gray-500">Available</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-orange-500" />
              </div>
              <div className="text-lg font-bold text-orange-600">{summary.totalPending}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-green-500" />
              </div>
              <div className="text-lg font-bold text-green-600">{summary.totalUsed}</div>
              <div className="text-xs text-gray-500">Used</div>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={handleApplyLeave}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
            >
              Apply Leave
            </button>
            <button
              onClick={handleViewDetails}
              className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to get color for leave types
const getLeaveTypeColor = (type) => {
  const colors = {
    casual: 'bg-blue-500',
    sick: 'bg-green-500',
    paid: 'bg-purple-500',
  };
  return colors[type] || 'bg-gray-400';
};

LeaveBalanceWidget.propTypes = {
  showActions: PropTypes.bool,
  compact: PropTypes.bool,
};

LeaveBalanceWidget.defaultProps = {
  showActions: true,
  compact: false,
};

export default LeaveBalanceWidget;