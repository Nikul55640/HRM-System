import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from '../../../shared/ui/card';
import { Clock, CalendarCheck, AlertCircle, LogOut } from 'lucide-react';

const AttendanceSummary = ({ summary }) => {
  if (!summary) return null;

  // Handle both direct summary object and nested data structure
  const summaryData = summary.data || summary;
  
  // Use the averageWorkHours from backend if available, otherwise calculate
  const avgWorkHours = summaryData.averageWorkHours || 
    (summaryData.totalWorkedMinutes && summaryData.presentDays > 0
      ? Math.round((summaryData.totalWorkedMinutes / summaryData.presentDays / 60) * 100) / 100 
      : 0);

  const stats = [
    {
      title: 'Average Work Hours',
      value: `${avgWorkHours} hrs`,
      icon: Clock,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Present Days',
      value: summaryData.presentDays || 0,
      icon: CalendarCheck,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Late Arrivals',
      value: summaryData.lateDays || 0,
      icon: AlertCircle,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Early Departures',
      value: summaryData.earlyDepartures || 0,
      icon: LogOut,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

AttendanceSummary.propTypes = {
  summary: PropTypes.oneOfType([
    PropTypes.shape({
      data: PropTypes.shape({
        totalWorkedMinutes: PropTypes.number,
        presentDays: PropTypes.number,
        lateDays: PropTypes.number,
        earlyDepartures: PropTypes.number,
        averageWorkHours: PropTypes.number,
      }),
    }),
    PropTypes.shape({
      totalWorkedMinutes: PropTypes.number,
      presentDays: PropTypes.number,
      lateDays: PropTypes.number,
      earlyDepartures: PropTypes.number,
      averageWorkHours: PropTypes.number,
    }),
  ]),
};

AttendanceSummary.defaultProps = {
  summary: null,
};

export default AttendanceSummary;
