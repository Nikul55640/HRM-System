import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';

const LeaveBalanceWidget = ({ leaveBalance }) => {
  if (!leaveBalance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leave Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No leave data available</p>
        </CardContent>
      </Card>
    );
  }

  const totalAllocated = leaveBalance.leaveTypes?.reduce((sum, type) => sum + type.allocated, 0) || 0;
  const totalUsed = leaveBalance.leaveTypes?.reduce((sum, type) => sum + type.used, 0) || 0;
  const totalAvailable = leaveBalance.leaveTypes?.reduce((sum, type) => sum + type.available, 0) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Leave Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{totalAvailable}</p>
            <p className="text-sm text-muted-foreground">Days Available</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {totalUsed} / {totalAllocated} used
            </p>
          </div>
        </div>
        
        <Progress value={(totalUsed / totalAllocated) * 100} className="h-2" />
        
        <div className="space-y-2">
          {leaveBalance.leaveTypes?.slice(0, 3).map((type) => (
            <div key={type.type} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground capitalize">{type.type}</span>
              <span className="font-medium">{type.available} days</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveBalanceWidget;
