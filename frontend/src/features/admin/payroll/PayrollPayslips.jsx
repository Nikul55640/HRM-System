import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Download, Eye, Search } from "lucide-react";
import { payrollService } from "../../../services";
import { toast } from "react-toastify";
import { formatDate } from "../../../utils/essHelpers";

const PayrollPayslips = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    console.log("🔄 [PAYROLL PAYSLIPS] Fetching all payslips...");
    try {
      setLoading(true);
      const response = await payrollService.getPayslips();
      console.log("✅ [PAYROLL PAYSLIPS] Response received:", response);

      if (response.success) {
        setPayslips(response.data);
        console.log(
          "✅ [PAYROLL PAYSLIPS] Loaded:",
          response.data?.length || 0,
          "payslips"
        );
      }
    } catch (error) {
      console.error("❌ [PAYROLL PAYSLIPS] Failed to fetch payslips:", error);
      toast.error("Failed to load payslips");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (payslip) => {
    try {
      const blob = await payrollService.downloadPayslip(payslip._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslip-${payslip.employeeId?.employeeId}-${payslip.month}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Payslip downloaded");
    } catch (error) {
      toast.error("Failed to download payslip");
    }
  };

  const filteredPayslips = payslips.filter(
    (payslip) =>
      payslip.employeeId?.personalInfo?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payslip.employeeId?.personalInfo?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payslip.employeeId?.employeeId
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Generated":
        return "text-green-600 bg-green-50 border-green-200";
      case "Pending":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading payslips...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Payslips</h1>
        <p className="text-gray-500 text-sm mt-1">
          View and manage employee payslips
        </p>
      </div>

      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search payslips..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Employee ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Employee Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Month
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayslips.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-gray-400 text-sm"
                    >
                      No payslips found
                    </td>
                  </tr>
                ) : (
                  filteredPayslips.map((payslip) => (
                    <tr key={payslip._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {payslip.employeeId?.employeeId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {payslip.employeeId?.personalInfo?.firstName}{" "}
                        {payslip.employeeId?.personalInfo?.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {payslip.month || formatDate(payslip.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        ₹
                        {payslip.netSalary?.toLocaleString() ||
                          payslip.amount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                            payslip.status || "Generated"
                          )}`}
                        >
                          {payslip.status || "Generated"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(payslip)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollPayslips;
