import { useEffect } from "react";
import { DollarSign, Users, TrendingUp, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import usePayrollStore from "../../../stores/usePayrollStore";
import { PermissionGate } from "../../../shared/components";
import { usePermissions } from "../../../core/hooks";
import { MODULES } from "../../../core/utils/rolePermissions";

const PayrollDashboard = () => {
  const { can } = usePermissions();
  const { 
    dashboard: { statistics, recentPayslips, currentPeriod, loading, error },
    fetchDashboard,
    clearDashboardError
  } = usePayrollStore();

  // Check if user has payroll access
  if (!can.do(MODULES.PAYROLL.VIEW_ALL)) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Access Denied
          </h3>
          <p className="text-red-700">
            You do not have permission to view payroll data.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearDashboardError();
    }
  }, [error, clearDashboardError]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-600">Loading payroll data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payroll Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Manage employee payroll and salary structures
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600">Total Net Pay</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹
                {statistics?.payrollSummary?.totalNetPay?.toLocaleString() || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {currentPeriod
              ? `${currentPeriod.month}/${currentPeriod.year}`
              : "This month"}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600">Processed Payslips</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statistics?.processedPayslips || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Out of {statistics?.totalEmployees || 0} employees
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600">Pending Payslips</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statistics?.pendingPayslips || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">To be processed</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600">Salary Structures</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statistics?.salaryStructures || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Active structures</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Payslips */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Recent Payslips</h2>
          </div>
          <div className="p-6">
            {recentPayslips?.length > 0 ? (
              <div className="space-y-3">
                {recentPayslips.map((payslip) => (
                  <div
                    key={payslip._id}
                    className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {payslip.employeeId?.fullName || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {payslip.month}/{payslip.year}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      ₹{payslip.netPay?.toLocaleString() || 0}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                No recent payslips
              </p>
            )}
          </div>
        </div>

        {/* Payroll Summary */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Payroll Summary</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Gross Pay</span>
                <span className="text-lg font-bold text-gray-900">
                  ₹
                  {statistics?.payrollSummary?.totalGrossPay?.toLocaleString() ||
                    0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Deductions</span>
                <span className="text-lg font-bold text-red-600">
                  ₹
                  {statistics?.payrollSummary?.totalDeductions?.toLocaleString() ||
                    0}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">Net Pay</span>
                  <span className="text-xl font-bold text-green-600">
                    ₹
                    {statistics?.payrollSummary?.totalNetPay?.toLocaleString() ||
                      0}
                  </span>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  {statistics?.payrollSummary?.count || 0} payslips processed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollDashboard;
