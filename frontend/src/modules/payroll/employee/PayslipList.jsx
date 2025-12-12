import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Download, Eye } from 'lucide-react';
import { formatDate } from '../../../core/utils/essHelpers';

const PayslipList = ({ payslips, onDownload, onView }) => {
  if (!payslips || payslips.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardContent className="py-12 text-center">
          <p className="text-gray-400 text-sm">No payslips found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-800">Payslip History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Period</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Gross Salary</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Deductions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Net Salary</th>
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
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {onView && (
                        <Button variant="ghost" size="sm" onClick={() => onView(payslip)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {onDownload && (
                        <Button variant="ghost" size="sm" onClick={() => onDownload(payslip)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayslipList;
