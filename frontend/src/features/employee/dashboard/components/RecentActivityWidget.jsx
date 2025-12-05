import { Activity, FileText, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
    ;
import { Badge } from '../../../../components/ui/badge'
import { formatDate } from '../../../../utils/essHelpers';
const RecentActivityWidget = ({ notifications }) => {
  const getActivityIcon = (type) => {
    const icons = {
      payslip: DollarSign,
      leave: Calendar,
      request: FileText,
      approval: CheckCircle,
      default: Activity,
    };
    
    const IconComponent = icons[type] || icons.default;
    return <IconComponent className="h-4 w-4" />;
  };

  const getActivityColor = (type) => {
    const colors = {
      payslip: 'text-green-600',
      leave: 'text-blue-600',
      request: 'text-yellow-600',
      approval: 'text-purple-600',
      default: 'text-gray-600',
    };
    
    return colors[type] || colors.default;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!notifications || notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification._id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <div className={`mt-1 ${getActivityColor(notification.type)}`}>
                  {getActivityIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{notification.title || notification.message}</p>
                  {notification.description && (
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(notification.createdAt, 'medium')}
                  </p>
                </div>
                {!notification.read && (
                  <Badge variant="secondary" className="text-xs">New</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityWidget;
