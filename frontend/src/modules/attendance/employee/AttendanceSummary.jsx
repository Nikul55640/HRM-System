import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Clock, Calendar, TrendingUp, AlertCircle, Coffee, Timer, Award, AlertTriangle } from 'lucide-react';
import { formatIndianTime } from '../../../utils/indianFormatters';

const AttendanceSummary = ({ summary, period }) => {
  // Default values if summary is not provided or incomplete
  const defaultSummary = {
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    earlyDepartures: 0,
    totalWorkedMinutes: 0,
    averageWorkHours: 0,
    totalDays: 0,
    totalBreakMinutes: 0,
    overtimeHours: 0,
    incompleteDays: 0,
    totalLateMinutes: 0,
    totalEarlyExitMinutes: 0
  };

  // Safely merge summary with defaults, ensuring all numeric values are valid
  const data = {
    ...defaultSummary,
    ...summary,
    presentDays: Number(summary?.presentDays) || 0,
    absentDays: Number(summary?.absentDays) || 0,
    lateDays: Number(summary?.lateDays) || 0,
    earlyDepartures: Number(summary?.earlyDepartures) || 0,
    totalWorkedMinutes: Number(summary?.totalWorkedMinutes) || 0,
    averageWorkHours: Number(summary?.averageWorkHours) || 0,
    totalDays: Number(summary?.totalDays) || 0,
    totalBreakMinutes: Number(summary?.totalBreakMinutes) || 0,
    overtimeHours: Number(summary?.overtimeHours) || 0,
    incompleteDays: Number(summary?.incompleteDays) || 0,
    totalLateMinutes: Number(summary?.totalLateMinutes) || 0,
    totalEarlyExitMinutes: Number(summary?.totalEarlyExitMinutes) || 0
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
      title: 'Absent Days',
      value: data.absentDays,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Days not present'
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Work Hours Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Hours Worked:</span>
                <span className="font-semibold">
                  {formatWorkTime(data.totalWorkedMinutes)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Daily Hours:</span>
                <span className="font-semibold">
                  {safeToFixed(data.averageWorkHours, 1)}h
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
                <span className="font-semibold text-blue-600">
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
      </div>
    </div>
  );
};

AttendanceSummary.propTypes = {
  summary: PropTypes.shape({
    presentDays: PropTypes.number,
    absentDays: PropTypes.number,
    lateDays: PropTypes.number,
    earlyDepartures: PropTypes.number,
    totalWorkedMinutes: PropTypes.number,
    averageWorkHours: PropTypes.number,
    totalDays: PropTypes.number,
    totalBreakMinutes: PropTypes.number,
    overtimeHours: PropTypes.number,
    incompleteDays: PropTypes.number,
    totalLateMinutes: PropTypes.number,
    totalEarlyExitMinutes: PropTypes.number
  }),
  period: PropTypes.string
};

AttendanceSummary.defaultProps = {
  summary: null,
  period: null
};

export default AttendanceSummary;