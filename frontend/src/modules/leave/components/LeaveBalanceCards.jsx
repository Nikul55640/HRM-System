import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const LeaveBalanceCards = ({ balances }) => {
  if (!balances) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-yellow-800 font-medium">No leave balance assigned</p>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          Please contact HR to assign your leave balance.
        </p>
      </div>
    );
  }

  // If leaveTypes array exists, show individual leave type cards
  if (balances.leaveTypes && balances.leaveTypes.length > 0) {
    // Filter out any leave types with null type values
    const validLeaveTypes = balances.leaveTypes.filter(lt => lt && lt.type);
    
    if (validLeaveTypes.length === 0) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800 font-medium">No valid leave types found</p>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Please contact HR to configure your leave balance.
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {validLeaveTypes.map((leaveType) => (
          <Card key={leaveType.type} className="border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 capitalize">
                {leaveType.type || 'Unknown'} Leave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Allocated:</span>
                  <span className="text-sm font-semibold text-gray-800">{leaveType.allocated || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Used:</span>
                  <span className="text-sm font-semibold text-blue-600">{leaveType.used || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Pending:</span>
                  <span className="text-sm font-semibold text-orange-600">{leaveType.pending || 0}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-xs font-medium text-gray-600">Available:</span>
                  <span className="text-lg font-bold text-green-600">{leaveType.available || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Fallback to old format if leaveTypes doesn't exist
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Total Leave
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-gray-800">{balances.total || 0}</div>
          <p className="text-xs text-gray-500 mt-1">days per year</p>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-green-600">{balances.available || 0}</div>
          <p className="text-xs text-gray-500 mt-1">days remaining</p>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Used
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-blue-600">{balances.used || 0}</div>
          <p className="text-xs text-gray-500 mt-1">days taken</p>
        </CardContent>
      </Card>
    </div>
  );
};

LeaveBalanceCards.propTypes = {
  balances: PropTypes.shape({
    leaveTypes: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string.isRequired,
      allocated: PropTypes.number.isRequired,
      used: PropTypes.number.isRequired,
      pending: PropTypes.number.isRequired,
      available: PropTypes.number.isRequired,
    })),
    total: PropTypes.number,
    available: PropTypes.number,
    used: PropTypes.number,
  }),
};

LeaveBalanceCards.defaultProps = {
  balances: null,
};

export default LeaveBalanceCards;
