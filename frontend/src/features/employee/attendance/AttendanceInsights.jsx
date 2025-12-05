import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

const AttendanceInsights = ({ summary }) => {
  if (!summary) return null;

  const insights = [];

  // Attendance rate insight
  const attendanceRate = summary.totalDays > 0 
    ? ((summary.presentDays / summary.totalDays) * 100).toFixed(1)
    : 0;

  if (attendanceRate >= 95) {
    insights.push({
      icon: CheckCircle,
      title: 'Excellent Attendance',
      description: `${attendanceRate}% attendance rate this month`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    });
  } else if (attendanceRate >= 80) {
    insights.push({
      icon: TrendingUp,
      title: 'Good Attendance',
      description: `${attendanceRate}% attendance rate`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    });
  } else {
    insights.push({
      icon: AlertCircle,
      title: 'Attendance Alert',
      description: `${attendanceRate}% attendance rate - below target`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    });
  }

  // Late arrivals insight
  if (summary.lateArrivals > 0) {
    insights.push({
      icon: AlertCircle,
      title: 'Late Arrivals',
      description: `${summary.lateArrivals} late arrival${summary.lateArrivals > 1 ? 's' : ''} this month`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    });
  }

  // Early departures insight
  if (summary.earlyDepartures > 0) {
    insights.push({
      icon: TrendingDown,
      title: 'Early Departures',
      description: `${summary.earlyDepartures} early departure${summary.earlyDepartures > 1 ? 's' : ''} this month`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    });
  }

  // Perfect attendance
  if (summary.lateArrivals === 0 && summary.earlyDepartures === 0 && attendanceRate >= 95) {
    insights.push({
      icon: CheckCircle,
      title: 'Perfect Record',
      description: 'No late arrivals or early departures!',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    });
  }

  // Average hours
  const avgHours = summary.presentDays > 0 
    ? (summary.totalHours / summary.presentDays).toFixed(1)
    : 0;

  if (avgHours >= 8) {
    insights.push({
      icon: TrendingUp,
      title: 'Great Work Hours',
      description: `Average ${avgHours} hours per day`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    });
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Insights & Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`${insight.bgColor} rounded-lg p-4 flex items-start gap-3`}
            >
              <insight.icon className={`h-5 w-5 ${insight.color} mt-0.5`} />
              <div>
                <div className={`font-semibold ${insight.color}`}>
                  {insight.title}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {insight.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceInsights;
