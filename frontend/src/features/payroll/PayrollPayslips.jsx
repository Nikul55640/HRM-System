import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Download, Eye, Search } from 'lucide-react';
import { payrollService } from '../../services';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/essHelpers';

const PayrollPayslips = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const response = await payrollService.getAllPayslips();
      
      if (response.success) {
        setPayslips(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch payslips:', error);
      toast.error('Failed to load payslips');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (payslip) => {
    try {
      const blob = await payrollService.downloadPayslip(payslip._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${payslip.employeeId?.employeeId}-${payslip.month}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Payslip downloaded');
    } catch (error) {
      toast.error('Failed to download payslip');
    }
  };

  const filteredPayslips = payslips.filter(payslip =>
    payslip.employeeId?.personalInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payslip.employeeId?.personalInfo?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payslip.employeeId?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <h1 className="text-3xl font-bold mb-6">Payslips</h1>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search payslips..."
              className="w-full pl-10 pr-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Employee Name</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayslips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No payslips found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayslips.map(payslip => (
                  <TableRow key={payslip._id}>
                    <TableCell className="font-medium">{payslip.employeeId?.employeeId}</TableCell>
                    <TableCell>
                      {payslip.employeeId?.personalInfo?.firstName} {payslip.employeeId?.personalInfo?.lastName}
                    </TableCell>
                    <TableCell>{payslip.month || formatDate(payslip.createdAt)}</TableCell>
                    <TableCell>₹{payslip.netSalary?.toLocaleString() || payslip.amount?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={payslip.status === 'Generated' ? 'default' : 'secondary'}>
                        {payslip.status || 'Generated'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(payslip)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollPayslips;
