import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const LeaveBalanceCards = ({ balances = null }) => {
  console.log('🎴 [LEAVE BALANCE CARDS] Received balances:', balances);
  console.log('🎴 [LEAVE BALANCE CARDS] Balances type:', typeof balances);
  console.log('🎴 [LEAVE BALANCE CARDS] Balances keys:', balances ? Object.keys(balances) : 'null');
  
  if (balances?.leaveTypes) {
    console.log('🎴 [LEAVE BALANCE CARDS] Found leaveTypes:', balances.leaveTypes.length, 'types');
    console.log('🎴 [LEAVE BALANCE CARDS] Leave types:', balances.leaveTypes);
  }
  
  if (!balances) {
    console.log('[LEAVE BALANCE CARDS] No balances provided');
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
    console.log('✅ [LEAVE BALANCE CARDS] Rendering leave type cards');
    // Filter out any leave types with null type values
    const validLeaveTypes = balances.leaveTypes.filter(lt => lt && lt.type);
    
    console.log('🎴 [LEAVE BALANCE CARDS] Valid leave types:', validLeaveTypes.length);
    
    if (validLeaveTypes.length === 0) {
      console.log('[LEAVE BALANCE CARDS] No valid leave types found');
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
        {validLeaveTypes.map((leaveType, index) => (
          <Card key={`${leaveType.type}-${index}`} className="border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 capitalize">
                {leaveType.type || 'Unknown'} Leave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {leaveType.remaining || leaveType.available || 0}
                  </span>
                  <span className="text-sm text-gray-500">
                    / {leaveType.allocated || 0}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Used: {leaveType.used || 0} | Pending: {leaveType.pending || 0}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        leaveType.allocated > 0
                          ? Math.min(100, ((leaveType.used || 0) / leaveType.allocated) * 100)
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Check if balances has direct leave type properties (alternative format)
  const directLeaveTypes = ['casual', 'sick', 'annual', 'paid', 'maternity', 'paternity'];
  const availableDirectTypes = directLeaveTypes.filter(type => balances[type]);
  
  if (availableDirectTypes.length > 0) {
    console.log('✅ [LEAVE BALANCE CARDS] Found direct leave type properties:', availableDirectTypes);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {availableDirectTypes.map((type) => {
          const leaveData = balances[type];
          return (
            <Card key={type} className="border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 capitalize">
                  {type} Leave
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {leaveData.remaining || leaveData.available || leaveData || 0}
                    </span>
                    <span className="text-sm text-gray-500">
                      / {leaveData.allocated || leaveData || 0}
                    </span>
                  </div>
                  {typeof leaveData === 'object' && (
                    <>
                      <div className="text-xs text-gray-500">
                        Used: {leaveData.used || 0} | Pending: {leaveData.pending || 0}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              leaveData.allocated > 0
                                ? Math.min(100, ((leaveData.used || 0) / leaveData.allocated) * 100)
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  console.log('[LEAVE BALANCE CARDS] No recognized data format, showing fallback');

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

export default LeaveBalanceCards;
