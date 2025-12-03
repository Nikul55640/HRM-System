import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DollarSign, Users, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchPayrollDashboard } from '../../store/thunks/payrollThunks';

const PayrollDashboard = () => {
  const dispatch = useDispatch();
  const { statistics, recentPayslips, currentPeriod, loading, error } = useSelector(
    (state) => state.payroll.dashboard
  );

  useEffect(() => {
    dispatch(fetchPayrollDashboard());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Payroll Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Net Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{statistics?.payrollSummary?.totalNetPay?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {currentPeriod ? `${currentPeriod.month}/${currentPeriod.year}` : 'This month'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Processed Payslips</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.processedPayslips || 0}</div>
            <p className="text-xs text-muted-foreground">Out of {statistics?.totalEmployees || 0} employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Payslips</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.pendingPayslips || 0}</div>
            <p className="text-xs text-muted-foreground">To be processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Salary Structures</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.salaryStructures || 0}</div>
            <p className="text-xs text-muted-foreground">Active structures</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Payslips</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayslips?.length > 0 ? (
              <div className="space-y-2">
                {recentPayslips.map((payslip) => (
                  <div key={payslip._id} className="flex justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{payslip.employeeId?.fullName || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">
                        {payslip.month}/{payslip.year}
                      </div>
                    </div>
                    <span className="font-semibold">₹{payslip.netPay?.toLocaleString() || 0}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent payslips</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payroll Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Gross Pay</span>
                <span className="font-semibold">₹{statistics?.payrollSummary?.totalGrossPay?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Deductions</span>
                <span className="font-semibold text-red-600">₹{statistics?.payrollSummary?.totalDeductions?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Net Pay</span>
                <span className="font-semibold text-green-600">₹{statistics?.payrollSummary?.totalNetPay?.toLocaleString() || 0}</span>
              </div>
              <div className="text-xs text-muted-foreground text-center pt-2">
                {statistics?.payrollSummary?.count || 0} payslips processed
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PayrollDashboard;
