import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Clock, Coffee, MapPin, TrendingUp } from 'lucide-react';

const AttendanceStatsWidget = ({ todayRecord }) => {
  if (!todayRecord) {
    return null;
  }

  // Calculate stats from the attendance record
  const totalBreaks = todayRecord.breakSessions?.length || 0;
  const totalBreakMinutes = todayRecord.totalBreakMinutes || 0;
  const totalWorkedMinutes = todayRecord.totalWorkedMinutes || 0;
  const workHours = todayRecord.workHours || 0;

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const stats = [
    {
      icon: Clock,
      label: 'Total Worked',
      value: formatDuration(totalWorkedMinutes),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: TrendingUp,
      label: 'Work Hours',
      value: `${workHours}h`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Coffee,
      label: 'Break Time',
      value: formatDuration(totalBreakMinutes),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: MapPin,
      label: 'Breaks Taken',
      value: totalBreaks,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Today's Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceStatsWidget;
