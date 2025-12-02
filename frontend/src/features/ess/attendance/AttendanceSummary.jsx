import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Clock, CalendarCheck, AlertCircle, LogOut } from 'lucide-react';

const AttendanceSummary = ({ summary }) => {
  if (!summary) return null;

  const stats = [
    {
      title: 'Average Work Hours',
      value: `${summary.avgWorkHours || 0} hrs`,
      icon: Clock,
      color: 'text-blue-500',
    },
    {
      title: 'Present Days',
      value: summary.presentDays || 0,
      icon: CalendarCheck,
      color: 'text-green-500',
    },
    {
      title: 'Late Arrivals',
      value: summary.lateArrivals || 0,
      icon: AlertCircle,
      color: 'text-yellow-500',
    },
    {
      title: 'Early Departures',
      value: summary.earlyDepartures || 0,
      icon: LogOut,
      color: 'text-red-500',
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
            <div className={`p-3 rounded-full bg-opacity-10 ${stat.color.replace('text', 'bg')}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AttendanceSummary;
