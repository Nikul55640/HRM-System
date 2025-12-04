import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

const LeaveBalanceCards = ({ balances }) => {
  if (!balances) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Total Leave
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-gray-800">{balances.total || 0}</div>
          <p className="text-xs text-gray-500 mt-1">days per year</p>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-green-600">{balances.available || 0}</div>
          <p className="text-xs text-gray-500 mt-1">days remaining</p>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Used
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-blue-600">{balances.used || 0}</div>
          <p className="text-xs text-gray-500 mt-1">days taken</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveBalanceCards;
