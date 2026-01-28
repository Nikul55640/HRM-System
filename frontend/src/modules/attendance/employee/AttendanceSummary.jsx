import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Clock, Calendar, AlertCircle, Coffee, Timer, AlertTriangle, Gift, CalendarDays, Briefcase } from 'lucide-react';
import { formatIndianTime } from '../../../utils/indianFormatters';
import smartCalendarService from '../../../services/smartCalendarService';

const AttendanceSummary = ({ summary, period }) => {
  const [calendarSummary, setCalendarSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch smart calendar data for working days, holidays, weekends
  useEffect(() => {
    const fetchCalendarSummary = async () => {
      try {
        setLoading(true); 
        // Get current month/year or use period if provided
        const now = new Date();
        const year = period?.year || now.getFullYear();
        const month = period?.month || (now.getMonth() + 1);
        
        console.log(`📅 [ATTENDANCE SUMMARY] Fetching calendar summary for ${year}-${month}`);
        
        const response = await smartCalendarService.getSmartMonthlyCalendar({ year, month });
        
        if (response.success) {
          console.log('📅 [ATTENDANCE SUMMARY] Calendar summary loaded:', response.data.summary);
          setCalendarSummary(response.data);
        } else {
          console.warn('📅 [ATTENDANCE SUMMARY] Failed to load calendar summary:', response.message);
        }
      } catch (error) {
        console.error('📅 [ATTENDANCE SUMMARY] Error fetching calendar summary:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendarSummary();
  }, [period]);

  // Default values if summary is not provided or incomplete
  const defaultSummary = {
    presentDays: 0,
    leaveDays: 0, // ✅ Backend uses leaveDays
    absentDays: 0, // ✅ NEW: Actual absent days
    holidayDays: 0, // ✅ NEW: Holiday days
    lateDays: 0,
    earlyDepartures: 0,
    totalWorkedMinutes: 0,
    averageWorkHours: 0,
    totalDays: 0,
    totalBreakMinutes: 0,
    overtimeHours: 0,
    incompleteDays: 0,
    totalLateMinutes: 0,
    totalEarlyExitMinutes: 0,
    
  };
  // Safely merge summary with defaults, ensuring all numeric values are valid
  const data = {
    ...defaultSummary,
    ...summary,
    presentDays: Number(summary?.presentDays) || 0,
    leaveDays: Number(summary?.leaveDays) || 0, // ✅ Backend uses leaveDays
    absentDays: Number(summary?.absentDays) || 0, // ✅ NEW: Actual absent days
    holidayDays: Number(summary?.holidayDays) || 0, // ✅ NEW: Holiday days
    lateDays: Number(summary?.lateDays) || 0,
    earlyDepartures: Number(summary?.earlyDepartures) || 0,
    totalWorkedMinutes: Number(summary?.totalWorkedMinutes) || 0,
    averageWorkHours: Number(summary?.averageWorkHours) || 0,
    totalDays: Number(summary?.totalDays) || 0,
    totalBreakMinutes: Number(summary?.totalBreakMinutes) || 0,
    overtimeHours: Number(summary?.overtimeHours) || Number(summary?.totalOvertimeHours) || 0, // Handle both field names
    incompleteDays: Number(summary?.incompleteDays) || 0,
    totalLateMinutes: Number(summary?.totalLateMinutes) || 0,
    totalEarlyExitMinutes: Number(summary?.totalEarlyExitMinutes) || 0,
    halfDays: Number(summary?.halfDays) || 0,
    // Additional backend fields
    totalWorkHours: Number(summary?.totalWorkHours) || 0
  };

  // Calculate working days = Total days in month - Holidays - Weekends
  // This gives us the actual expected working days
  const getMonthDaysFromPeriod = () => {
    let year, month;
    
    if (period) {
      // Try to extract month/year from period string like "January 2024"
      const periodMatch = period.match(/(\w+)\s+(\d{4})/);
      if (periodMatch) {
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthIndex = monthNames.indexOf(periodMatch[1]);
        year = parseInt(periodMatch[2]);
        month = monthIndex;
        if (monthIndex !== -1) {
          return { year, month, totalDays: new Date(year, monthIndex + 1, 0).getDate() };
        }
      }
    }
    // Fallback to current month
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
    return { year, month, totalDays: new Date(year, month + 1, 0).getDate() };
  };

  const { year, month, totalDays: totalMonthDays } = getMonthDaysFromPeriod();
  
  // Calculate weekends in the month
  const getWeekendsInMonth = (year, month) => {
    let weekends = 0;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday = 0, Saturday = 6
        weekends++;
      }
    }
    return weekends;
  };

  // Get calendar summary data from smart calendar service
  const getCalendarMetrics = () => {
    if (calendarSummary?.summary) {
      return {
        totalDays: calendarSummary.summary.totalDays || totalMonthDays,
        workingDays: calendarSummary.summary.workingDays || 0,
        weekends: calendarSummary.summary.weekends || 0,
        holidays: calendarSummary.summary.holidays || 0,
        leaves: calendarSummary.summary.leaves || 0,
        activeWorkingRule: calendarSummary.activeWorkingRule?.ruleName || 'Default'
      };
    }
    
    // Fallback to calculated values if smart calendar not available
    const weekendsInMonth = getWeekendsInMonth(year, month);
    const workingDays = Math.max(0, totalMonthDays - data.holidayDays - weekendsInMonth);
    
    return {
      totalDays: totalMonthDays,
      workingDays: workingDays,
      weekends: weekendsInMonth,
      holidays: data.holidayDays,
      leaves: data.leaveDays,
      activeWorkingRule: 'Calculated'
    };
  };

  const calendarMetrics = getCalendarMetrics();

  // Calculate attendance percentage based on working days (excluding holidays)
  // const attendancePercentage = workingDays > 0 
  //   ? Math.round((data.presentDays / workingDays) * 100) 
  //   : 0;

  // Data validation warnings
  const dataWarnings = [];
  if (data.lateDays > data.presentDays) {
    dataWarnings.push(`⚠️ Data inconsistency: ${data.lateDays} late days but only ${data.presentDays} present days`);
  }
  if (data.presentDays + data.absentDays + data.leaveDays + data.halfDays > calendarMetrics.workingDays) {
    dataWarnings.push(`⚠️ Data inconsistency: Total attendance records exceed working days`);
  }
  
  // Log warnings for debugging
  if (dataWarnings.length > 0) {
    console.warn('Attendance Data Issues:', dataWarnings);
  }

  // Calculate punctuality percentage with safety checks
  // const punctualityPercentage = data.presentDays > 0
  //   ? Math.round(((Math.max(0, data.presentDays - data.lateDays)) / data.presentDays) * 100)
  //   : 0;

  // Convert minutes to hours and minutes using Indian formatting
  // const formatWorkTime = (minutes) => {
  //   return formatIndianTime(minutes);
  // };

  // Safe number formatting
  // const safeToFixed = (value, decimals = 1) => {
  //   const num = Number(value) || 0;
  //   return num.toFixed(decimals);
  // };

  // Calculate monthly metrics
  const calculateMonthlyMetrics = () => {
    const totalMinutes = data.totalWorkedMinutes || 0;
    const totalHoursWorked = totalMinutes / 60;
    const workingDaysInMonth = data.totalDays || 1; // Avoid division by zero
    const actualWorkDays = data.presentDays || 0;
    
    // 🔒 VALIDATION: Cap unrealistic values (max 24 hours per day)
    const maxPossibleHours = actualWorkDays * 24;
    const validatedTotalHours = Math.min(totalHoursWorked, maxPossibleHours);
    
    // Show warning if data seems incorrect
    if (totalHoursWorked > maxPossibleHours) {
      console.warn(`⚠️ Attendance data error: ${totalHoursWorked.toFixed(1)}h worked in ${actualWorkDays} days is impossible (max: ${maxPossibleHours}h)`);
      console.warn('This suggests bad data in the database. Please check attendance records.');
    }
    
    // Average hours per working day (based on days actually worked)
    const avgHoursPerDay = actualWorkDays > 0 ? validatedTotalHours / actualWorkDays : 0;
    
    // Cap average to 24 hours per day
    const validatedAvgHours = Math.min(avgHoursPerDay, 24);
    
    // Expected hours for the month (assuming 8 hours per working day)
    const expectedHours = workingDaysInMonth * 8;
    
    // Actual vs Expected percentage
    const workHoursPercentage = expectedHours > 0 ? (validatedTotalHours / expectedHours) * 100 : 0;
    
    // Projected hours for full month (if not all days are completed)
    const projectedHours = validatedAvgHours * workingDaysInMonth;
    
    return {
      totalHoursWorked: validatedTotalHours,
      avgHoursPerDay: validatedAvgHours,
      expectedHours,
      workHoursPercentage,
      projectedHours,
      workingDaysInMonth,
      actualWorkDays,
      hasDataError: totalHoursWorked > maxPossibleHours
    };
  };

  // Calculate monthly metrics for potential future use
  calculateMonthlyMetrics();

  // const summaryCards = [
  //   {
  //     title: 'Present Days',
  //     value: data.presentDays,
  //     icon: Calendar,
  //     color: 'text-green-600',
  //     bgColor: 'bg-green-50',
  //     description: `Out of ${workingDays} working days`
  //   },
  //   {
  //     title: 'Leave Days',
  //     value: data.leaveDays, // ✅ Backend uses leaveDays
  //     icon: AlertCircle,
  //     color: 'text-red-600',
  //     bgColor: 'bg-red-50',
  //     description: 'Days on leave'
  //   },
  //   {
  //     title: 'Holiday Days',
  //     value: data.holidayDays, // ✅ NEW: Holiday days
  //     icon: Gift,
  //     color: 'text-blue-600',
  //     bgColor: 'bg-blue-50',
  //     description: 'Public holidays'
  //   },
  //   {
  //     title: 'Late Arrivals',
  //     value: data.lateDays,
  //     icon: AlertTriangle,
  //     color: 'text-yellow-600',
  //     bgColor: 'bg-yellow-50',
  //     description: data.totalLateMinutes > 0 ? `Total: ${formatWorkTime(data.totalLateMinutes)}` : 'No late arrivals'
  //   }
  // ];

  //const additionalMetrics = [
  //   {
  //     title: 'Attendance Rate',
  //     value: `${attendancePercentage}%`,
  //     icon: TrendingUp,
  //     color: attendancePercentage >= 90 ? 'text-green-600' : attendancePercentage >= 75 ? 'text-yellow-600' : 'text-red-600',
  //     bgColor: attendancePercentage >= 90 ? 'bg-green-50' : attendancePercentage >= 75 ? 'bg-yellow-50' : 'bg-red-50',
  //     description: 'Overall attendance'
  //   },
  //   {
  //     title: 'Punctuality Rate',
  //     value: `${punctualityPercentage}%`,
  //     icon: Clock,
  //     color: punctualityPercentage >= 90 ? 'text-green-600' : punctualityPercentage >= 75 ? 'text-yellow-600' : 'text-red-600',
  //     bgColor: punctualityPercentage >= 90 ? 'bg-green-50' : punctualityPercentage >= 75 ? 'bg-yellow-50' : 'bg-red-50',
  //     description: 'On-time arrivals'
  //   },
  //   {
  //     title: 'Break Time',
  //     value: formatWorkTime(data.totalBreakMinutes),
  //     icon: Coffee,
  //     color: 'text-blue-600',
  //     bgColor: 'bg-blue-50',
  //     description: 'Total break duration'
  //   },
  //   {
  //     title: 'Overtime Hours',
  //     value: `${safeToFixed(data.overtimeHours, 1)}h`,
  //     icon: Timer,
  //     color: 'text-purple-600',
  //     bgColor: 'bg-purple-50',
  //     description: 'Extra hours worked'
  //   }
  // ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Attendance Summary</h2>
          {period && (
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Period: {period}</p>
          )}
        </div>
      </div>

      {/* Enhanced Calendar Summary - Smart Calendar Data */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Total Days */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center hover:shadow-md transition-shadow">
          <div className="flex flex-col items-center">
            <div className="p-1.5 sm:p-2 rounded-full bg-gray-50 mb-2">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </div>
            <div className="text-xs text-gray-500 mb-1 font-medium">Total Days</div>
            <div className="text-lg sm:text-2xl font-bold text-gray-600">{calendarMetrics.totalDays}</div>
            <div className="text-xs text-gray-400 mt-1">in month</div>
          </div>
        </div>

        {/* Working Days - From Smart Calendar */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center hover:shadow-md transition-shadow">
          <div className="flex flex-col items-center">
            <div className="p-1.5 sm:p-2 rounded-full bg-blue-50 mb-2">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="text-xs text-gray-500 mb-1 font-medium">Working Days</div>
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{calendarMetrics.workingDays}</div>
            <div className="text-xs text-gray-400 mt-1 truncate max-w-full">{calendarMetrics.activeWorkingRule}</div>
          </div>
        </div>

        {/* Weekends - From Smart Calendar */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center hover:shadow-md transition-shadow">
          <div className="flex flex-col items-center">
            <div className="p-1.5 sm:p-2 rounded-full bg-indigo-50 mb-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            </div>
            <div className="text-xs text-gray-500 mb-1 font-medium">Weekends</div>
            <div className="text-lg sm:text-2xl font-bold text-indigo-600">{calendarMetrics.weekends}</div>
            <div className="text-xs text-gray-400 mt-1">rest days</div>
          </div>
        </div>

        {/* Holidays - From Smart Calendar */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center hover:shadow-md transition-shadow">
          <div className="flex flex-col items-center">
            <div className="p-1.5 sm:p-2 rounded-full bg-purple-50 mb-2">
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div className="text-xs text-gray-500 mb-1 font-medium">Holidays</div>
            <div className="text-lg sm:text-2xl font-bold text-purple-600">{calendarMetrics.holidays}</div>
            <div className="text-xs text-gray-400 mt-1">public holidays</div>
          </div>
        </div>

        {/* Company Leaves - From Smart Calendar */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center hover:shadow-md transition-shadow">
          <div className="flex flex-col items-center">
            <div className="p-1.5 sm:p-2 rounded-full bg-amber-50 mb-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
            <div className="text-xs text-gray-500 mb-1 font-medium">Leave</div>
            <div className="text-lg sm:text-2xl font-bold text-amber-600">{calendarMetrics.leaves}</div>
            <div className="text-xs text-gray-400 mt-1">On leaves</div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600 mb-2"></div>
              <div className="text-xs text-gray-500">Loading...</div>
            </div>
          </div>
        )}
      </div>

      {/* Attendance Summary Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center hover:shadow-md transition-shadow">
          <div className="flex flex-col items-center">
            <div className="p-1.5 sm:p-2 rounded-full bg-green-50 mb-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div className="text-xs text-gray-500 mb-1 font-medium">Days Present</div>
            <div className="text-lg sm:text-2xl font-bold text-green-600">{data.presentDays}</div>
            <div className="text-xs text-gray-400 mt-1">out of {calendarMetrics.workingDays} working</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center hover:shadow-md transition-shadow">
          <div className="flex flex-col items-center">
            <div className="p-1.5 sm:p-2 rounded-full bg-yellow-50 mb-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
            </div>
            <div className="text-xs text-gray-500 mb-1 font-medium">Late</div>
            <div className="text-lg sm:text-2xl font-bold text-yellow-600">{data.lateDays}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center hover:shadow-md transition-shadow">
          <div className="flex flex-col items-center">
            <div className="p-1.5 sm:p-2 rounded-full bg-orange-50 mb-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <div className="text-xs text-gray-500 mb-1 font-medium">Half Day</div>
            <div className="text-lg sm:text-2xl font-bold text-orange-600">{data.halfDays}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 text-center hover:shadow-md transition-shadow">
          <div className="flex flex-col items-center">
            <div className="p-1.5 sm:p-2 rounded-full bg-red-50 mb-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <div className="text-xs text-gray-500 mb-1 font-medium">Absent</div>
            <div className="text-lg sm:text-2xl font-bold text-red-600">{data.absentDays}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

AttendanceSummary.propTypes = {
  summary: PropTypes.shape({
    presentDays: PropTypes.number,
    leaveDays: PropTypes.number, // ✅ Backend uses leaveDays
    absentDays: PropTypes.number, // ✅ NEW: Actual absent days
    holidayDays: PropTypes.number, // ✅ NEW: Holiday days
    lateDays: PropTypes.number,
    earlyDepartures: PropTypes.number,
    totalWorkedMinutes: PropTypes.number,
    averageWorkHours: PropTypes.number,
    totalDays: PropTypes.number,
    totalBreakMinutes: PropTypes.number,
    overtimeHours: PropTypes.number,
    incompleteDays: PropTypes.number,
    totalLateMinutes: PropTypes.number,
    totalEarlyExitMinutes: PropTypes.number,
    halfDays: PropTypes.number
  }),
  period: PropTypes.string
};


AttendanceSummary.defaultProps = {
  summary: null,
  period: null
};

export default AttendanceSummary;