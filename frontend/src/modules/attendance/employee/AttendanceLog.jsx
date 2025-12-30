import { formatDate, calculateWorkHours } from '../../ess/utils/essHelpers';
import PropTypes from 'prop-types';

const AttendanceLog = ({ records = [] }) => {
  // records should now always be an array from the hook
  const recordsArray = Array.isArray(records) ? records : [];
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'absent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'late':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'half_day':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!recordsArray || recordsArray.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-400 text-sm">No attendance records found for this period.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-base font-semibold text-gray-800">Attendance Log</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Check In</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Check Out</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Work Hours</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recordsArray.map((record) => {
              const workHours = calculateWorkHours(record.checkIn, record.checkOut);
              
              return (
                <tr key={record.id || record._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {workHours > 0 ? `${workHours} hrs` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(record.status)}`}>
                      {record.status}
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

export default AttendanceLog
