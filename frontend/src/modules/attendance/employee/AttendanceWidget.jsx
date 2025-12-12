import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Progress } from  '../../../shared/ui/progress';
const AttendanceWidget = ({ attendanceSummary }) => {
  if (!attendanceSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No attendance data available</p>
        </CardContent>
      </Card>
    );
  }

  const { present = 0, absent = 0, totalDays = 0, workHours = 0 } = attendanceSummary;
  const attendancePercentage = totalDays > 0 ? (present / totalDays) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{present}/{totalDays}</p>
            <p className="text-sm text-muted-foreground">Days Present</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{attendancePercentage.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">Attendance</p>
          </div>
        </div>
        
        <Progress value={attendancePercentage} className="h-2" />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">{present}</p>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-sm font-medium">{absent}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </div>
        </div>
        
        {workHours > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">Total Work Hours</p>
            <p className="text-lg font-semibold">{workHours} hrs</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceWidget;
