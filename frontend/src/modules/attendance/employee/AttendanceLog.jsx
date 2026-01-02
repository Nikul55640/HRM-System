import { formatDate, calculateWorkHours } from '../../ess/utils/essHelpers';
import PropTypes from 'prop-types';
import { Clock, AlertTriangle, Coffee, Building2, Home, Users } from 'lucide-react';

const AttendanceLog = ({ records = [] }) => {
  // records should now always be an array from the hook
  const recordsArray = Array.isArray(records) ? records : [];
  
  const getStatusColor = (status, isLate, isEarlyDeparture) => {
    if (isLate) {
      return 'text-orange-600 bg-orange-50 border-orange-200';
    }
    if (isEarlyDeparture) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }

    
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'absent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'incomplete':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'half_day':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (record) => {
    const parts = [];
    
    if (record.status) {
      parts.push(record.status.replace('_', ' '));
    }
    
    if (record.isLate) {
      parts.push(`Late (${record.lateMinutes}m)`);
    }
    
    if (record.isEarlyDeparture) {
      parts.push(`Early Exit (${record.earlyExitMinutes}m)`);
    }
    
    if (record.overtimeHours > 0) {
      parts.push(`OT: ${record.overtimeHours}h`);
    }
    
    return parts.join(' • ');
  };

  const getLocationIcon = (location) => {
    switch (location) {
      case 'office':
        return <Building2 className="h-3 w-3" />;
      case 'wfh':
        return <Home className="h-3 w-3" />;
      case 'client_site':
        return <Users className="h-3 w-3" />;
      default:
        return <Building2 className="h-3 w-3" />;
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (!recordsArray || recordsArray.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-400 text-sm">No attendance records found for this period.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Attendance Log
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Shift</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Check In</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Check Out</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Work Hours</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Breaks</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recordsArray.map((record) => {
              const workHours = record.workHours || calculateWorkHours(record.clockIn || record.checkIn, record.clockOut || record.checkOut);
              
              return (
                <tr key={record.id || record._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {formatDate(record.date)}
                  </td>
                  
                  {/* Shift Information */}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {record.shift ? (
                      <div className="space-y-1">
                        <div className="font-medium">{record.shift.shiftName}</div>
                        <div className="text-xs text-gray-500">
                          {record.shift.shiftStartTime} - {record.shift.shiftEndTime}
                        </div>
                      </div>
                    ) : '-'}
                  </td>
                  
                  {/* Check In */}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {record.clockIn || record.checkIn ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          {record.location && getLocationIcon(record.location)}
                          {new Date(record.clockIn || record.checkIn).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {record.isLate && (
                          <div className="text-xs text-orange-600 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {record.lateMinutes}m late
                          </div>
                        )}
                      </div>
                    ) : '-'}
                  </td>
                  
                  {/* Check Out */}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {record.clockOut || record.checkOut ? (
                      <div className="space-y-1">
                        <div>
                          {new Date(record.clockOut || record.checkOut).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {record.isEarlyDeparture && (
                          <div className="text-xs text-yellow-600 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {record.earlyExitMinutes}m early
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-red-500 text-xs">Missing</span>
                    )}
                  </td>
                  
                  {/* Work Hours */}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="space-y-1">
                      <div>{workHours > 0 ? `${workHours}h` : '-'}</div>
                      {record.overtimeHours > 0 && (
                        <div className="text-xs text-blue-600">
                          +{record.overtimeHours}h OT
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Breaks */}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {record.breakSessions?.length > 0 || record.totalBreakMinutes > 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Coffee className="h-3 w-3" />
                          {record.breakSessions?.length || 0} breaks
                        </div>
                        {record.totalBreakMinutes > 0 && (
                          <div className="text-xs text-gray-500">
                            {formatDuration(record.totalBreakMinutes)}
                          </div>
                        )}
                      </div>
                    ) : '-'}
                  </td>
                  
                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(record.status, record.isLate, record.isEarlyDeparture)}`}>
                      {getStatusText(record)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

AttendanceLog.propTypes = {
  records: PropTypes.array,
};

export default AttendanceLog;
