import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../shared/ui/dialog';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Coffee,
  ChevronLeft,
  ChevronRight,
  Star,
  Info,
  Building,
  Zap,
  PlaneTakeoff,
} from 'lucide-react';

// 🔧 FIX: Pure presentational component - receives all data as props
const MonthlyAttendanceCalendar = ({ 
  attendanceRecords = [], 
  calendarData = {}, 
  selectedMonth, 
  selectedYear, 
  loading = false,
  error = null, // 🔧 FIX: Add error prop
  onMonthChange 
}) => {
  // 🔧 FIX: Pure presentational component - no API calls, no internal state for data
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔧 FIX: Use props directly - backend now returns clean array format
  const currentMonth = selectedMonth;
  const currentYear = selectedYear;
  const monthlyAttendanceData = Array.isArray(attendanceRecords) ? attendanceRecords : [];

  // 🔧 FIX: No more useEffect hooks for data fetching - parent handles all data
  // Component is now purely presentational

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get days in month
  const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);

  // Get attendance record for a specific date - improved logic similar to SessionHistoryView
  const getAttendanceForDate = (day) => {
    if (!day || !Array.isArray(monthlyAttendanceData)) return null;
    
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Try exact date match first from attendance records
    let record = monthlyAttendanceData.find(record => record.date === dateStr);
    
    // If no exact match, try parsing the date field in case of different formats
    if (!record) {
      record = monthlyAttendanceData.find(record => {
        if (!record.date) return false;
        const recordDate = new Date(record.date).toISOString().split('T')[0];
        return recordDate === dateStr;
      });
    }
    
    // 🔧 NEW: If no record found in attendance data, check calendar data
    if (!record) {
      const calendarDay = getCalendarDataForDate(day);
      if (calendarDay?.attendance && calendarDay.attendance.id) {
        record = calendarDay.attendance;
      }
    }
    
    // Debug logging for first few days
    if (day <= 3 && process.env.NODE_ENV === 'development') {
      console.log(`🔍 [DEBUG] Day ${day} (${dateStr}):`, {
        found: !!record,
        recordDate: record?.date,
        status: record?.status,
        hasClockIn: !!record?.clockIn,
        hasClockOut: !!record?.clockOut,
        fromCalendar: !monthlyAttendanceData.find(r => r.date === dateStr) && !!record
      });
    }
    
    return record;
  };

  // Get calendar data for a specific date (holidays, events, etc.)
  const getCalendarDataForDate = (day) => {
    if (!day || !calendarData) return null;
    
    // ✅ FIX: calendarData uses day numbers as keys, not date strings
    // calendarData = { "1": {...}, "2": {...}, "3": {...} }
    return calendarData[day] || null;
  };

  // 🔧 CRITICAL FIX B: Normalize calendar day data
  const normalizeCalendarDay = (calendarDay) => {
    if (!calendarDay) return {};
    
    return {
      ...calendarDay,
      // Handle both old format (dayType) and new format (status field)
      isWeekend: calendarDay.status === 'WEEKEND' || calendarDay.status === 'weekend' || calendarDay.dayType === 'WEEKEND' || calendarDay.dayType === 'weekend',
      holidays: (calendarDay.status === 'HOLIDAY' || calendarDay.status === 'holiday' || calendarDay.dayType === 'HOLIDAY' || calendarDay.dayType === 'holiday')
        ? [{ name: calendarDay.holidayName || 'Holiday' }]
        : (calendarDay.holidays && calendarDay.holidays.length > 0)
          ? calendarDay.holidays
          : []
    };
  };

  // Get status symbol and color for a day based on your design system
  const getStatusSymbol = (record, calendarDay, day) => {
    // 🔧 FIX: Normalize calendar day data before using
    const normalizedCalendarDay = normalizeCalendarDay(calendarDay);
    
    // Debug logging for first few days
    if (day <= 3 && process.env.NODE_ENV === 'development') {
      console.log(`🎨 [DEBUG] Day ${day} - Record:`, record, 'Calendar:', normalizedCalendarDay);
      console.log(`🎨 [DEBUG] Day ${day} - Calendar status:`, calendarDay?.status);
      console.log(`🎨 [DEBUG] Day ${day} - Calendar attendance:`, calendarDay?.attendance);
    }
    
    // 🔧 CRITICAL FIX: Use 'status' field instead of 'dayType'
    if (calendarDay?.status === 'HOLIDAY' || calendarDay?.status === 'holiday') {
      return { 
        icon: Star, 
        color: 'text-yellow-600', 
        tooltip: calendarDay.holidayName || 'Holiday'
      };
    }

    if (calendarDay?.status === 'WEEKEND' || calendarDay?.status === 'weekend') {
      return { 
        icon: Calendar, 
        color: 'text-gray-500', 
        tooltip: 'Weekend'
      };
    }

    // 🔧 NEW: Handle LEAVE from smart calendar
    if (calendarDay?.status === 'LEAVE' || calendarDay?.status === 'leave') {
      return { 
        icon: PlaneTakeoff, 
        color: 'text-purple-600', 
        tooltip: 'On Leave'
      };
    }

    // 🔧 CRITICAL FIX: Check if there's attendance data in the calendar response
    if (calendarDay?.attendance && calendarDay.attendance.id) {
      const attendanceRecord = calendarDay.attendance;
      
      // Use the attendance data from calendar response
      switch (attendanceRecord.status) {
        case 'present':
          if (attendanceRecord.isLate) {
            return { 
              icon: Info, 
              color: 'text-blue-600', 
              tooltip: `Present (Late by ${attendanceRecord.lateMinutes || 0}m)`
            };
          }
          return { 
            icon: CheckCircle, 
            color: 'text-green-600', 
            tooltip: 'Present'
          };
        case 'absent':
          return { 
            icon: XCircle, 
            color: 'text-red-600', 
            tooltip: 'Absent'
          };
        case 'half_day':
          return { 
            icon: Zap, 
            color: 'text-orange-600', 
            tooltip: 'Half Day'
          };
        case 'incomplete':
          return { 
            icon: AlertTriangle, 
            color: 'text-amber-600', 
            tooltip: 'Incomplete (Missing clock out)'
          };
        default:
          return { 
            icon: CheckCircle, 
            color: 'text-green-600', 
            tooltip: attendanceRecord.status || 'Present'
          };
      }
    }

    // Fallback to normalized format for backward compatibility
    if (normalizedCalendarDay?.holidays && normalizedCalendarDay.holidays.length > 0) {
      return { 
        icon: Star, 
        color: 'text-yellow-600', 
        tooltip: normalizedCalendarDay.holidays[0].name
      };
    }

    if (normalizedCalendarDay?.isWeekend) {
      return { 
        icon: Calendar, 
        color: 'text-gray-500', 
        tooltip: 'Weekend'
      };
    }

    // 🔥 KEY FIX: If no attendance record exists AND it's a working day → ABSENT
    if (!record) {
      const today = new Date();
      const dayDate = new Date(currentYear, currentMonth - 1, day);
      
      // Future dates
      if (dayDate > today) {
        return { 
          icon: null, 
          color: 'text-gray-300', 
          bgColor: 'bg-gray-50',
          tooltip: 'Future date'
        };
      }
      
      // 🔥 CRITICAL FIX: Check if it's a working day using 'status' field
      const isWorkingDay = calendarDay?.status === 'WORKING_DAY' || calendarDay?.status === 'working_day';
      
      if (isWorkingDay && !calendarDay?.attendance) {
        return { 
          icon: XCircle, 
          color: 'text-red-600', 
          tooltip: 'Absent (No attendance record)'
        };
      }
      
      // Default for other cases (weekends, holidays, leaves without records)
      return { 
        icon: null, 
        color: 'text-gray-400', 
        tooltip: 'No data'
      };
    }

    // Handle attendance record status
    switch (record.status) {
      case 'present':
        if (record.isLate) {
          return { 
            icon: Info, 
            color: 'text-blue-600', 
            bgColor: 'bg-blue-50 border-blue-200',
            tooltip: `Present (Late by ${record.lateMinutes || 0}m)`
          };
        }
        return { 
          icon: CheckCircle, 
          color: 'text-green-600', 
          bgColor: 'bg-green-50 border-green-200',
          tooltip: 'Present'
        };
      case 'absent':
        return { 
          icon: XCircle, 
          color: 'text-red-600',
          tooltip: 'Absent'
        };
      case 'half_day':
        return { 
          icon: Zap, 
          color: 'text-orange-600',
          tooltip: 'Half Day'
        };
      case 'on_leave':
        return { 
          icon: PlaneTakeoff, 
          color: 'text-purple-600',
          tooltip: 'On Leave'
        };
      case 'leave':
        return { 
          icon: PlaneTakeoff, 
          color: 'text-purple-600', 
          tooltip: 'On Leave'
        };
      case 'pending_correction':
        return { 
          icon: AlertTriangle, 
          color: 'text-orange-600', 
          tooltip: 'Pending correction'
        };
      case 'incomplete':
        return { 
          icon: AlertTriangle, 
          color: 'text-amber-600', 
          tooltip: 'Incomplete (Missing clock out)'
        };
      default:
        return { 
          icon: null, 
          color: 'text-gray-400',
          tooltip: record.status || 'Unknown status'
        };
    }
  };

  const handleDateClick = (day) => {
    const record = getAttendanceForDate(day);
    const calendarDay = normalizeCalendarDay(getCalendarDataForDate(day));
    setSelectedDate({ day, record, calendarDay });
    setIsModalOpen(true);
  };

  const handleMonthNavigation = (direction) => {
    let newMonth = currentMonth;
    let newYear = currentYear;

    if (direction === 'prev') {
      newMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      newYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    } else {
      newMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      newYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    }

    // 🔧 FIX: Don't set internal state, just call parent callback
    if (onMonthChange) {
      onMonthChange(newMonth, newYear);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    // Handle different time formats from backend
    let dateObj;
    if (timeString instanceof Date) {
      dateObj = timeString;
    } else if (typeof timeString === 'string') {
      // Handle ISO string or time-only string
      if (timeString.includes('T') || timeString.includes('Z')) {
        dateObj = new Date(timeString);
      } else {
        dateObj = new Date(`2000-01-01T${timeString}`);
      }
    } else {
      return 'N/A';
    }
    
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Get day of week for a specific date
  const getDayOfWeek = (day) => {
    const date = new Date(currentYear, currentMonth - 1, day);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames[date.getDay()];
  };

  //This is view of the details
  const renderModalContent = () => {
    if (!selectedDate) return null;

    const { day, record, calendarDay } = selectedDate;
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const formattedDate = new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <Calendar className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{formattedDate}</h3>
            <p className="text-sm text-gray-500">Attendance Details</p>
          </div>
        </div>

        {/* Calendar Events (Holidays, etc.) */}
        {calendarDay && (
          <div className="space-y-3">
            {/* Handle smart calendar HOLIDAY */}
            {(calendarDay.status === 'HOLIDAY' || calendarDay.status === 'holiday') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Holiday</span>
                </div>
                <div className="text-sm text-yellow-700">
                  {calendarDay.holidayName || 'Holiday'}
                </div>
              </div>
            )}

            {/* Handle smart calendar WEEKEND */}
            {(calendarDay.status === 'WEEKEND' || calendarDay.status === 'weekend') && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-700">Weekend</span>
                </div>
              </div>
            )}

            {/* Handle smart calendar LEAVE */}
            {(calendarDay.status === 'LEAVE' || calendarDay.status === 'leave') && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <PlaneTakeoff className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800">On Leave</span>
                </div>
              </div>
            )}

            {/* Fallback for legacy format */}
            {calendarDay.holidays && calendarDay.holidays.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Holiday</span>
                </div>
                {calendarDay.holidays.map((holiday, index) => (
                  <div key={index} className="text-sm text-yellow-700">
                    {holiday.name}
                  </div>
                ))}
              </div>
            )}

            {calendarDay.leaves && calendarDay.leaves.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <PlaneTakeoff className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800">Team Leaves</span>
                </div>
                {calendarDay.leaves.map((leave, index) => (
                  <div key={index} className="text-sm text-purple-700">
                    {leave.employeeName} - {leave.leaveType}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Attendance Record */}
        {record ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Clock In</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatTime(record.clockIn)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Clock Out</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatTime(record.clockOut) || 'Still working'}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-sm text-blue-600 mb-1">Total Worked</div>
                <div className="text-base sm:text-lg font-bold text-blue-900">
                  {formatDuration(record.totalWorkedMinutes)}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-sm text-green-600 mb-1">Break Time</div>
                <div className="text-base sm:text-lg font-bold text-green-900">
                  {formatDuration(record.totalBreakMinutes)}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-sm text-purple-600 mb-1">Status</div>
                <div className="text-base sm:text-lg font-bold text-purple-900 capitalize">
                  {record.status?.replace('_', ' ')}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            {(record.isLate || record.isEarlyDeparture || record.workMode) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="text-sm font-medium text-amber-800 mb-2">Additional Details</div>
                <div className="space-y-1 text-sm text-amber-700">
                  {record.isLate && (
                    <div>• Late arrival: {record.lateMinutes || 0} minutes</div>
                  )}
                  {record.isEarlyDeparture && (
                    <div>• Early departure: {record.earlyExitMinutes || 0} minutes</div>
                  )}
                  {record.workMode && (
                    <div>• Work mode: {record.workMode}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            {(calendarDay?.status === 'HOLIDAY' || calendarDay?.status === 'holiday') ? (
              <>
                <Star className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">Holiday</p>
                <p className="text-gray-500 text-sm">{calendarDay.holidayName || 'No attendance required'}</p>
              </>
            ) : (calendarDay?.status === 'WEEKEND' || calendarDay?.status === 'weekend') ? (
              <>
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">Weekend</p>
                <p className="text-gray-500 text-sm">No attendance required</p>
              </>
            ) : (calendarDay?.status === 'LEAVE' || calendarDay?.status === 'leave') ? (
              <>
                <PlaneTakeoff className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">On Leave</p>
                <p className="text-gray-500 text-sm">No attendance required</p>
              </>
            ) : (() => {
              const today = new Date();
              const dayDate = new Date(dateStr);
              const isFuture = dayDate > today;
              
              if (isFuture) {
                return (
                  <>
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium">Future Date</p>
                    <p className="text-gray-500 text-sm">Attendance not yet recorded</p>
                  </>
                );
              } else {
                return (
                  <>
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                    <p className="text-red-700 font-medium">Absent</p>
                    <p className="text-gray-500 text-sm">No attendance record found for this working day</p>
                  </>
                );
              }
            })()}
          </div>
        )}
      </div>
    );
  };

  // Calculate summary stats
  const calculateStats = useMemo(() => {
    // Ensure monthlyAttendanceData is an array before using filter
    if (!Array.isArray(monthlyAttendanceData)) {
      return { present: 0, absent: 0, late: 0, halfDay: 0, totalHours: '0.0', total: '0/0' };
    }
    
    let presentDays = 0;
    let absentDays = 0;
    let lateDays = 0;
    let halfDays = 0;
    let totalHours = 0;
    let workingDays = 0;
    
    const today = new Date();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(currentYear, currentMonth - 1, day);
      
      // Skip future dates
      if (dayDate > today) continue;
      
      const record = getAttendanceForDate(day);
      const calendarDay = getCalendarDataForDate(day);
      
      // 🔧 FIX: Use 'status' field for accurate classification
      const isWeekend = calendarDay?.status === 'WEEKEND' || calendarDay?.status === 'weekend';
      const isHoliday = calendarDay?.status === 'HOLIDAY' || calendarDay?.status === 'holiday';
      const isLeave = calendarDay?.status === 'LEAVE' || calendarDay?.status === 'leave';
      const isWorkingDay = calendarDay?.status === 'WORKING_DAY' || calendarDay?.status === 'working_day';
      const workingDay = isWorkingDay;
      
      // 🔧 FIX: Count working days for accurate total calculation
      if (workingDay) {
        workingDays++;
      }
      
      // 🔧 FIX: Make absent counting mutually exclusive to avoid double counting
      if (record || calendarDay?.attendance) {
        // Use either the fetched record or the attendance data from calendar
        const attendanceData = record || calendarDay?.attendance;
        
        if (attendanceData.status === 'present') {
          presentDays++;
          if (attendanceData.isLate) lateDays++;
          if (attendanceData.isHalfDay) halfDays++;
          if (attendanceData.totalHours) totalHours += attendanceData.totalHours;
        } else if (attendanceData.status === 'absent') {
          absentDays++;
        }
      } else if (workingDay) {
        // Only count as absent if it's a working day and no record exists
        absentDays++;
      }
    }
    
    return { 
      present: presentDays, 
      absent: absentDays, 
      late: lateDays, 
      halfDay: halfDays,
      totalHours: totalHours.toFixed(1),
      total: `${presentDays}/${workingDays}` // 🔧 FIX: Use working days instead of total days
    };
  }, [monthlyAttendanceData, calendarData, currentMonth, currentYear, daysInMonth]);

  const stats = calculateStats;

  return (
    <>
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-base sm:text-lg text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <span className="truncate">
                {monthNames[currentMonth - 1]} {currentYear}
                <span className="hidden sm:inline"> - Monthly Attendance</span>
              </span>
            </CardTitle>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMonthNavigation('prev')}
                className="p-2 flex-shrink-0"
                disabled={loading}
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs sm:text-sm px-2 py-1">
                {loading ? 'Loading...' : stats.total}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMonthNavigation('next')}
                className="p-2 flex-shrink-0"
                disabled={loading}
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading attendance data...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Failed to load attendance data</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Debug Section - Show actual data structure (can be removed in production) */}
          {!loading && monthlyAttendanceData.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="text-xs font-medium text-blue-800 mb-2">
                📊 Debug Info: Loaded {monthlyAttendanceData.length} records
              </div>
              <div className="text-xs text-blue-700 space-y-1">
                <div className="break-all">• Sample record fields: {monthlyAttendanceData[0] ? Object.keys(monthlyAttendanceData[0]).join(', ') : 'None'}</div>
                <div>• Date range: {monthlyAttendanceData[0]?.date} to {monthlyAttendanceData[monthlyAttendanceData.length - 1]?.date}</div>
                <div>• Records with clockIn: {monthlyAttendanceData.filter(r => r.clockIn).length}</div>
                <div>• Records with status: {monthlyAttendanceData.filter(r => r.status).length}</div>
              </div>
            </div>
          )}

          {/* Calendar Content - Only show when not loading */}
          {!loading && (
            <>
              {/* Legend */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-xs font-medium text-gray-600 mb-2">Note:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4 text-xs text-gray-700">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                    <span className="truncate">Holiday</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span className="truncate">Weekend</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <span className="truncate">Present</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-orange-600 flex-shrink-0" />
                    <span className="truncate">Half Day</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Info className="h-3 w-3 text-blue-600 flex-shrink-0" />
                    <span className="truncate">Late</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
                    <span className="truncate">Absent</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <PlaneTakeoff className="h-3 w-3 text-purple-600 flex-shrink-0" />
                    <span className="truncate">On Leave</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-600 flex-shrink-0" />
                    <span className="truncate">Incomplete</span>
                  </span>
                </div>
              </div>

              {/* Calendar Header */}
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <div className="grid gap-3 mb-2 ml-3 text-xs" style={{ gridTemplateColumns: `repeat(${daysInMonth + 1}, minmax(24px, 1fr))` }}>
                    {/* Day numbers */}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                      <div key={day} className="text-center text-gray-700 font-medium p-1 min-w-6">
                        {day}
                      </div>
                    ))}
                    <div className="text-center text-gray-700 font-medium p-1 min-w-12">Total</div>
                  </div>

                  {/* Day abbreviations */}
                  <div className="grid gap-3 mb-2  ml-3 text-xs" style={{ gridTemplateColumns: `repeat(${daysInMonth + 1}, minmax(24px, 1fr))` }}>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                      <div key={day} className="text-center text-gray-500 p-1 min-w-6">
                        {getDayOfWeek(day)}
                      </div>
                    ))}
                    <div className="text-center text-gray-500 p-1 min-w-12"></div>
                  </div>

                  {/* Status symbols */}
                  <div className="grid gap-3 mb-2  ml-3" style={{ gridTemplateColumns: `repeat(${daysInMonth + 1}, minmax(24px, 1fr))` }}>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                      const record = getAttendanceForDate(day);
                      const calendarDay = normalizeCalendarDay(getCalendarDataForDate(day));
                      const statusInfo = getStatusSymbol(record, calendarDay, day);
                      const isToday = day === new Date().getDate() && 
                                     currentMonth === new Date().getMonth() + 1 && 
                                     currentYear === new Date().getFullYear();

                      return (
                        <div
                          key={day}
                          onClick={() => handleDateClick(day)}
                          className={`
                            h-6 sm:h-8 flex items-center justify-center rounded cursor-pointer min-w-6
                            ${statusInfo.bgColor} ${statusInfo.color}
                            hover:shadow-md hover:scale-105 transition-all duration-200
                            ${isToday ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                          `}
                          title={statusInfo.tooltip || `Day ${day} - ${record?.status || 'No data'}`}
                        >
                          {statusInfo.icon ? (
                            <statusInfo.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                          ) : (
                            <span className="text-xs font-medium text-gray-400">-</span>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Total column */}
                    <div className="h-6 sm:h-8 flex items-center justify-center bg-blue-50 border border-blue-200 rounded text-blue-700 text-xs sm:text-sm font-medium min-w-12">
                      {stats.total}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Activity section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Recent Activity
            </h4>
            
            {/* Real activity items from attendance data */}
            <div className="space-y-2">
              {loading ? (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                  <span className="text-gray-400">Loading activity...</span>
                </div>
              ) : (
                <>
                  {/* Show today's activity if available */}
                  {(() => {
                    const today = new Date().toISOString().split('T')[0];
                    
                    // 🔧 FIX: Only show today's activity if we're viewing the current month
                    const isCurrentMonth = 
                      currentMonth === new Date().getMonth() + 1 &&
                      currentYear === new Date().getFullYear();
                    
                    const todayRecord = isCurrentMonth 
                      ? getAttendanceForDate(new Date().getDate())
                      : null;
                    
                    if (todayRecord) {
                      return (
                        <>
                          {/* Clock In Activity */}
                          {todayRecord.clockIn && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1 sm:mt-0"></div>
                              <span className="text-gray-600 text-xs sm:text-sm">{today} {formatTime(todayRecord.clockIn)}</span>
                              <div className="flex items-center gap-1 text-gray-700">
                                <Clock className="h-3 w-3 text-green-600" />
                                <span className="text-xs sm:text-sm">Clock In</span>
                              </div>
                              {todayRecord.workMode && (
                                <div className="flex items-center gap-1 text-gray-700">
                                  <Building className="h-3 w-3 text-blue-600" />
                                  <span className="text-xs sm:text-sm">{todayRecord.workMode}</span>
                                </div>
                              )}
                              {todayRecord.isLate && (
                                <div className="flex items-center gap-1 text-orange-600">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span className="text-xs sm:text-sm">Late ({todayRecord.lateMinutes}m)</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Break Activities */}
                          {todayRecord.breakSessions && todayRecord.breakSessions.length > 0 && (
                            todayRecord.breakSessions.slice(-2).map((breakSession, index) => (
                              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-sm">
                                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1 sm:mt-0"></div>
                                <span className="text-gray-600 text-xs sm:text-sm">{today} {formatTime(breakSession.breakIn || breakSession.startTime)}</span>
                                <div className="flex items-center gap-1 text-gray-700">
                                  <Coffee className="h-3 w-3 text-orange-600" />
                                  <span className="text-xs sm:text-sm">Break Started</span>
                                </div>
                                {(breakSession.breakOut || breakSession.endTime) && (
                                  <span className="text-gray-500 text-xs sm:text-sm">
                                    (Duration: {formatDuration(breakSession.duration || 0)})
                                  </span>
                                )}
                              </div>
                            ))
                          )}
                          
                          {/* Clock Out Activity */}
                          {todayRecord.clockOut && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-sm">
                              <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1 sm:mt-0"></div>
                              <span className="text-gray-600 text-xs sm:text-sm">{today} {formatTime(todayRecord.clockOut)}</span>
                              <div className="flex items-center gap-1 text-gray-700">
                                <Clock className="h-3 w-3 text-red-600" />
                                <span className="text-xs sm:text-sm">Clock Out</span>
                              </div>
                              {todayRecord.totalWorkedMinutes && (
                                <span className="text-gray-500 text-xs sm:text-sm">
                                  (Total: {formatDuration(todayRecord.totalWorkedMinutes)})
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      );
                    }
                    
                    // Show recent activities from other days if no today's record
                    const recentRecords = Array.isArray(monthlyAttendanceData) 
                      ? monthlyAttendanceData.slice(-3).reverse()
                      : [];
                    
                    if (recentRecords.length > 0) {
                      return recentRecords.map((record, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-sm">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 sm:mt-0 ${
                            record.status === 'present' ? 'bg-green-500' :
                            record.status === 'absent' ? 'bg-red-500' :
                            record.status === 'holiday' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}></div>
                          <span className="text-gray-600 text-xs sm:text-sm">{record.date}</span>
                          <div className="flex items-center gap-1 text-gray-700">
                            {record.status === 'present' && <CheckCircle className="h-3 w-3 text-green-600" />}
                            {record.status === 'absent' && <XCircle className="h-3 w-3 text-red-600" />}
                            {record.status === 'holiday' && <Star className="h-3 w-3 text-yellow-600" />}
                            <span className="capitalize text-xs sm:text-sm">{record.status?.replace('_', ' ')}</span>
                          </div>
                          {record.clockIn && (
                            <span className="text-gray-500 text-xs sm:text-sm">
                              {formatTime(record.clockIn)} - {formatTime(record.clockOut) || 'Ongoing'}
                            </span>
                          )}
                        </div>
                      ));
                    }
                    
                    return (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <span className="text-gray-500 text-xs sm:text-sm">No recent activity found</span>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
            
            {/* Quick Stats Summary */}
            {(stats.present > 0 || stats.absent > 0) && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  <div>
                    <div className="text-base sm:text-lg font-bold text-green-600">{stats.present}</div>
                    <div className="text-xs text-gray-500">Present</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-bold text-red-600">{stats.absent}</div>
                    <div className="text-xs text-gray-500">Absent</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-bold text-orange-600">{stats.late}</div>
                    <div className="text-xs text-gray-500">Late</div>
                  </div>
                </div>
                
                {/* Additional stats from actual data */}
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 text-center text-xs">
                    <div>
                      <div className="font-medium text-gray-700">
                        {monthlyAttendanceData.filter(r => r.status === 'half_day').length}
                      </div>
                      <div className="text-gray-500">Half Days</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">
                        {monthlyAttendanceData.filter(r => r.status === 'incomplete').length}
                      </div>
                      <div className="text-gray-500">Incomplete</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Records View - Similar to SessionHistoryView */}
          {/* {!loading && monthlyAttendanceData.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Attendance Records ({monthlyAttendanceData.length} found)
              </h4>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {monthlyAttendanceData.slice(0, 10).map((record, index) => (
                  <div key={record.id || index} className="bg-white rounded p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{record.date}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'present' ? 'bg-green-100 text-green-700' :
                          record.status === 'absent' ? 'bg-red-100 text-red-700' :
                          record.status === 'half_day' ? 'bg-yellow-100 text-yellow-700' :
                          record.status === 'incomplete' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {record.status || 'unknown'}
                        </span>
                      </div>
                      {record.workHours && (
                        <span className="text-xs text-gray-500">
                          {parseFloat(record.workHours).toFixed(1)}h worked
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div>
                        <span className="text-gray-400">In:</span> {record.clockIn ? formatTime(record.clockIn) : '-'}
                      </div>
                      <div>
                        <span className="text-gray-400">Out:</span> {record.clockOut ? formatTime(record.clockOut) : '-'}
                      </div>
                      <div>
                        <span className="text-gray-400">Mode:</span> {record.workMode || 'office'}
                      </div>
                    </div>
                    
                    {record.isLate && (
                      <div className="mt-1 text-xs text-orange-600">
                        Late by {record.lateMinutes || 0} minutes
                      </div>
                    )}
                  </div>
                ))}
                
                {monthlyAttendanceData.length > 10 && (
                  <div className="text-center text-xs text-gray-500 py-2">
                    ... and {monthlyAttendanceData.length - 10} more records
                  </div>
                )}
              </div>
            </div>
          )} */}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Attendance Details</DialogTitle>
          </DialogHeader>
          {renderModalContent()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MonthlyAttendanceCalendar;