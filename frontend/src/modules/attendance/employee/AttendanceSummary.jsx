import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Clock, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const AttendanceSummary = ({ summary, period }) => {
  // Default values if summary is not provided or incomplete
  const defaultSummary = {
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    earlyDepartures: 0,
    totalWorkedMinutes: 0,
    averageWorkHours: 0,
    totalDays: 0
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
    totalDays: Number(summary?.totalDays) || 0
  };

  // Calculate attendance percentage
  const attendancePercentage = data.totalDays > 0 
    ? Math.round((data.presentDays / data.totalDays) * 100) 
    : 0;

  // Convert minutes to hours and minutes
  const formatWorkTime = (minutes) => {
    const totalMinutes = Number(minutes) || 0;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
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
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Days arrived late'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Summary</h2>
          {period && (
            <p className="text-gray-600 mt-1">Period: {period}</p>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {card.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {card.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Work Hours Summary</CardTitle>
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
                <span className="text-gray-600">Early Departures:</span>
                <span className="font-semibold">
                  {data.earlyDepartures}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Punctuality Rate:</span>
                <span className="font-semibold">
                  {data.totalDays > 0 
                    ? Math.round(((data.presentDays - data.lateDays) / data.totalDays) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Consistency Score:</span>
                <span className="font-semibold">
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
    totalDays: PropTypes.number
  }),
  period: PropTypes.string
};

AttendanceSummary.defaultProps = {
  summary: null,
  period: null
};

export default AttendanceSummary;