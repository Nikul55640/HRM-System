import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Clock, Calendar, TrendingUp, AlertCircle, Coffee, Timer, Award, AlertTriangle } from 'lucide-react';
import { formatIndianTime } from '../../../utils/indianFormatters';

const AttendanceSummary = ({ summary, period }) => {
  // Default values if summary is not provided or incomplete
  const defaultSummary = {
    presentDays: 0,
    leaveDays: 0, // ✅ Backend uses leaveDays
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
    halfDays: 0
  };

  // Safely merge summary with defaults, ensuring all numeric values are valid
  const data = {
    ...defaultSummary,
    ...summary,
    presentDays: Number(summary?.presentDays) || 0,
    leaveDays: Number(summary?.leaveDays) || 0, // ✅ Backend uses leaveDays
    lateDays: Number(summary?.lateDays) || 0,
    earlyDepartures: Number(summary?.earlyDepartures) || 0,
    totalWorkedMinutes: Number(summary?.totalWorkedMinutes) || 0,
    averageWorkHours: Number(summary?.averageWorkHours) || 0,
    totalDays: Number(summary?.totalDays) || 0,
    totalBreakMinutes: Number(summary?.totalBreakMinutes) || 0,
    overtimeHours: Number(summary?.overtimeHours) || 0,
    incompleteDays: Number(summary?.incompleteDays) || 0,
    totalLateMinutes: Number(summary?.totalLateMinutes) || 0,
    totalEarlyExitMinutes: Number(summary?.totalEarlyExitMinutes) || 0,
    halfDays: Number(summary?.halfDays) || 0
  };

  // Calculate attendance percentage
  const attendancePercentage = data.totalDays > 0 
    ? Math.round((data.presentDays / data.totalDays) * 100) 
    : 0;

  // Calculate punctuality percentage
  const punctualityPercentage = data.presentDays > 0
    ? Math.round(((data.presentDays - data.lateDays) / data.presentDays) * 100)
    : 0;

  // Convert minutes to hours and minutes using Indian formatting
  const formatWorkTime = (minutes) => {
    return formatIndianTime(minutes);
  };

  // Safe number formatting
  const safeToFixed = (value, decimals = 1) => {
    const num = Number(value) || 0;
    return num.toFixed(decimals);
  };

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

  const monthlyMetrics = calculateMonthlyMetrics();

  const summaryCards = [
    {
      title: 'Present Days',
      value: data.presentDays,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: `Out of ${data.totalDays} working days`
    },
    {
      title: 'Leave Days',
      value: data.leaveDays, // ✅ Backend uses leaveDays
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Days on leave'
    },
    {
      title: 'Late Arrivals',
      value: data.lateDays,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: `Total: ${formatWorkTime(data.totalLateMinutes)}`
    },
    {
      title: 'Attendance Rate',
      value: `${attendancePercentage}%`,
      icon: TrendingUp,
      color: attendancePercentage >= 90 ? 'text-green-600' : attendancePercentage >= 75 ? 'text-yellow-600' : 'text-red-600',
      bgColor: attendancePercentage >= 90 ? 'bg-green-50' : attendancePercentage >= 75 ? 'bg-yellow-50' : 'bg-red-50',
      description: 'Overall attendance'
    }
  ];

  const additionalMetrics = [
    {
      title: 'Punctuality Rate',
      value: `${punctualityPercentage}%`,
      icon: Clock,
      color: punctualityPercentage >= 90 ? 'text-green-600' : punctualityPercentage >= 75 ? 'text-yellow-600' : 'text-red-600',
      bgColor: punctualityPercentage >= 90 ? 'bg-green-50' : punctualityPercentage >= 75 ? 'bg-yellow-50' : 'bg-red-50',
      description: 'On-time arrivals'
    },
    {
      title: 'Break Time',
      value: formatWorkTime(data.totalBreakMinutes),
      icon: Coffee,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Total break duration'
    },
    {
      title: 'Overtime Hours',
      value: `${safeToFixed(data.overtimeHours, 1)}h`,
      icon: Timer,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Extra hours worked'
    },
    {
      title: 'Incomplete Days',
      value: data.incompleteDays,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Missing clock-out'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Attendance Summary</h2>
          {period && (
            <p className="text-gray-600 mt-1">Period: {period}</p>
          )}
        </div>
      </div>

      {/* Data Error Warning */}
      {monthlyMetrics.hasDataError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Data Error Detected</h3>
            <p className="text-sm text-red-700 mt-1">
              The attendance data shows impossible work hours (more than 24 hours per day). 
              This indicates corrupted data in the database. Please contact your administrator 
              to review and correct the attendance records.
            </p>
            <p className="text-xs text-red-600 mt-2">
              Note: Values have been capped to realistic limits for display purposes.
            </p>
          </div>
        </div>
      )}

      {/* Primary Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {card.title}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {card.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {card.description}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${card.bgColor}`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {additionalMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {metric.title}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {metric.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {metric.description}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${metric.bgColor}`}>
                    <Icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Analysis */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Work Hours Analysis - {period || 'This Month'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Hours Worked:</span>
                <span className="font-semibold">
                  {safeToFixed(monthlyMetrics.totalHoursWorked, 1)}h
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Expected Hours (Month):</span>
                <span className="font-semibold text-gray-500">
                  {safeToFixed(monthlyMetrics.expectedHours, 1)}h
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Work Completion:</span>
                <span className={`font-semibold ${monthlyMetrics.workHoursPercentage >= 100 ? 'text-green-600' : monthlyMetrics.workHoursPercentage >= 90 ? 'text-blue-600' : 'text-yellow-600'}`}>
                  {safeToFixed(monthlyMetrics.workHoursPercentage, 1)}%
                </span>
              </div>
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Hours/Day:</span>
                <span className="font-semibold text-blue-600">
                  {safeToFixed(monthlyMetrics.avgHoursPerDay, 1)}h
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Working Days:</span>
                <span className="font-semibold">
                  {monthlyMetrics.actualWorkDays} / {monthlyMetrics.workingDaysInMonth}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Overtime Hours:</span>
                <span className="font-semibold text-purple-600">
                  {safeToFixed(data.overtimeHours, 1)}h
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Break Time:</span>
                <span className="font-semibold text-orange-600">
                  {formatWorkTime(data.totalBreakMinutes)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5" />
              Performance Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Punctuality Rate:</span>
                <span className={`font-semibold ${punctualityPercentage >= 90 ? 'text-green-600' : punctualityPercentage >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {punctualityPercentage}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Early Departures:</span>
                <span className="font-semibold text-yellow-600">
                  {data.earlyDepartures} ({formatWorkTime(data.totalEarlyExitMinutes)})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Incomplete Days:</span>
                <span className="font-semibold text-orange-600">
                  {data.incompleteDays}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Consistency Score:</span>
                <span className={`font-semibold ${attendancePercentage >= 95 ? 'text-green-600' : attendancePercentage >= 85 ? 'text-blue-600' : attendancePercentage >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {attendancePercentage >= 95 ? 'Excellent' : 
                   attendancePercentage >= 85 ? 'Good' : 
                   attendancePercentage >= 75 ? 'Average' : 'Needs Improvement'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
};

AttendanceSummary.propTypes = {
  summary: PropTypes.shape({
    presentDays: PropTypes.number,
    leaveDays: PropTypes.number, // ✅ Backend uses leaveDays
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