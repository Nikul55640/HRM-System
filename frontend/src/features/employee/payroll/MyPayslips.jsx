import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Download, Eye, DollarSign, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { payrollService } from '../../../services';
import { formatDate } from '../../../utils/essHelpers';
import useAuth from '../../../hooks/useAuth';

const MyPayslips = () => {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user is an employee
  if (!user?.employeeId) {
    return (
      <div className="p-6">
        <Card className="border-gray-200">
          <CardContent className="py-12 text-center">
            <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Employee Access Only</p>
            <p className="text-sm text-gray-500 mt-2">
              This feature is only available for employees with an employee profile.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Please contact HR if you need access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    console.log('🔄 [PAYSLIPS] Fetching payslips...');
    try {
      setLoading(true);
      const response = await payrollService.getMyPayslips();
      console.log('✅ [PAYSLIPS] Response received:', response);
      
      if (response.success) {
        setPayslips(response.data || []);
        console.log('✅ [PAYSLIPS] Loaded:', response.data?.length || 0, 'payslips');
      }
    } catch (error) {
      console.error('❌ [PAYSLIPS] Failed to fetch payslips:', error);
      toast.error('Failed to load payslips');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (payslipId) => {
    try {
      const blob = await payrollService.downloadPayslip(payslipId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${payslipId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Payslip downloaded');
    } catch (error) {
      toast.error('Failed to download payslip');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading payslips...</p>
      </div>
    );
  }

  const latestPayslip = payslips[0];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">My Payslips</h1>
        <p className="text-gray-500 text-sm mt-1">View and download your salary slips</p>
      </div>

      {/* Latest Payslip Summary */}
      {latestPayslip && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800">
              Latest Payslip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {latestPayslip.month} {latestPayslip.year}
                  </p>
                  <p className="text-2xl font-semibold text-gray-800">
                    ₹{latestPayslip.netSalary?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Net Salary</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button size="sm" onClick={() => handleDownload(latestPayslip._id)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payslip History */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-800">
            Payslip History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payslips.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No payslips found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Period</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Gross Salary</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Deductions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Net Salary</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Generated</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payslips.map((payslip) => (
                    <tr key={payslip._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {payslip.month} {payslip.year}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        ₹{payslip.grossSalary?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">
                        ₹{payslip.totalDeductions?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">
                        ₹{payslip.netSalary?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(payslip.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDownload(payslip._id)}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyPayslips;
