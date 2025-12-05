import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
    ;
import { Badge } from '../../../../components/ui/badge'
    ;
import { getStatusBadgeVariant } from '../../../../utils/essHelpers';

const RequestsWidget = ({ requests }) => {
  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No requests found</p>
        </CardContent>
      </Card>
    );
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  const recentRequests = requests.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          My Requests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 bg-yellow-50 rounded-lg">
            <Clock className="h-4 w-4 text-yellow-600 mb-1" />
            <p className="text-lg font-bold">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="flex flex-col items-center p-2 bg-green-50 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600 mb-1" />
            <p className="text-lg font-bold">{approvedCount}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </div>
          <div className="flex flex-col items-center p-2 bg-red-50 rounded-lg">
            <XCircle className="h-4 w-4 text-red-600 mb-1" />
            <p className="text-lg font-bold">{rejectedCount}</p>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Recent Requests</p>
          {recentRequests.map((request) => (
            <div key={request._id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate capitalize">
                  {request.requestType?.replace('_', ' ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(request.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={getStatusBadgeVariant(request.status)}>
                {request.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestsWidget;
