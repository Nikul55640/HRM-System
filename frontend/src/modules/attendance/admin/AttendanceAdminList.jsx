import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Download, Search } from 'lucide-react';
import useAttendanceStore from '../../../stores/useAttendanceStore';
import attendanceService from '../../../services/attendanceService';
import { formatDate } from '../../../core/utils/essHelpers';

const AttendanceAdminList = () => {
  const {
    attendanceRecords,
    loading,
    fetchAttendanceRecords,
    exportAttendanceReport,
    filters,
    setFilters,
    setAttendanceRecords
  } = useAttendanceStore();

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Set default filters to show today's records
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Update the store filters to show today's records by default
    setFilters({
      startDate: todayStr,
      endDate: todayStr,
      employee: 'all',
      department: 'all',
      status: 'all'
    });
  }, [setFilters]);

  // Separate effect to fetch data when filters change
  useEffect(() => {
    fetchAttendanceRecords();
  }, [filters, fetchAttendanceRecords]);

  const handleExport = async () => {
    try {
      await exportAttendanceReport(filters);
    } catch (error) {
      // Error already handled in store
    }
  };

  const filteredAttendance = (attendanceRecords || []).filter(record => {
    const employeeName = record.employeeName || 
                        (record.employee?.personalInfo ? 
                         `${record.employee.personalInfo.firstName || ''} ${record.employee.personalInfo.lastName || ''}`.trim() :
                         'Unknown Employee');
    
    return employeeName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-50 border-green-200';
      case 'absent': return 'text-red-600 bg-red-50 border-red-200';
      case 'late': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return <div className="p-6"><p className="text-gray-500">Loading attendance...</p></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Attendance Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View and manage employee attendance
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date Range Filters */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={async () => {
                  try {
                    const response = await attendanceService.getAllAttendance();
                    if (response.success && response.data) {
                      // Temporarily show test data
                      setAttendanceRecords(response.data);
                    }
                  } catch (error) {
                    console.error("Test API failed:", error);
                  }
                }}
                className={`px-3 py-1 rounded text-sm ${
                  filters.startDate === filters.endDate &&
                  filters.startDate === new Date().toISOString().split("T")[0]
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Attendance
              </button>
              {/* <button
                onClick={() => {
                  setFilters({ ...filters, startDate: "", endDate: "" });
                }}
                className="px-3 py-1 rounded text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Show All
              </button> */}
              {/* <button
                onClick={() => {
                  const today = new Date();
                  const weekStart = new Date(today);
                  weekStart.setDate(today.getDate() - today.getDay());
                  const weekEnd = new Date(today);
                  weekEnd.setDate(today.getDate() - today.getDay() + 6);
                  setFilters({
                    ...filters,
                    startDate: weekStart.toISOString().split("T")[0],
                    endDate: weekEnd.toISOString().split("T")[0],
                  });
                }}
                className="px-3 py-1 rounded text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                This Week
              </button> */}
              {/* <input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="px-3 py-1 border border-gray-300 rounded text-sm"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="px-3 py-1 border border-gray-300 rounded text-sm"
                placeholder="End Date"
              /> */}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Check In
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Check Out
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Work Hours
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-gray-400 text-sm"
                    >
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {record.employeeName ||
                          (record.employee?.personalInfo
                            ? `${
                                record.employee.personalInfo.firstName || ""
                              } ${
                                record.employee.personalInfo.lastName || ""
                              }`.trim()
                            : "Unknown Employee")}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {record.checkIn
                          ? new Date(record.checkIn).toLocaleTimeString(
                              "en-US",
                              { hour: "2-digit", minute: "2-digit" }
                            )
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {record.checkOut
                          ? new Date(record.checkOut).toLocaleTimeString(
                              "en-US",
                              { hour: "2-digit", minute: "2-digit" }
                            )
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {record.workHours ? `${record.workHours}h` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceAdminList;
