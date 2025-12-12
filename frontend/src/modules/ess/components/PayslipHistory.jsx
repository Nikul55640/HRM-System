import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../../shared/ui/table';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import Pagination from '../../../shared/components/Pagination';
import payrollService from '../../../core/services/payrollService';

const PayslipHistory = ({ employeeId }) => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchPayslips();
  }, [employeeId, pagination.page]);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const response = await payrollService.getEmployeePayslips(employeeId, {
        page: pagination.page,
        limit: pagination.limit
      });
      setPayslips(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages
      }));
    } catch (error) {
      toast.error('Failed to load payslip history');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (payslipId) => {
    try {
      const response = await payrollService.downloadPayslip(payslipId);
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip-${payslipId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download payslip');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      paid: 'success',
      pending: 'warning',
      processing: 'info',
      failed: 'destructive'
    };
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payslip History</CardTitle>
      </CardHeader>
      <CardContent>
        {payslips.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No payslips found</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {formatDate(payslip.periodStart)} - {formatDate(payslip.periodEnd)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payslip.payPeriodType}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(payslip.payDate)}</TableCell>
                    <TableCell>{formatCurrency(payslip.grossPay)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payslip.netPay)}
                    </TableCell>
                    <TableCell>{getStatusBadge(payslip.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(payslip.id)}
                        >
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(`/payslips/${payslip.id}`, '_blank')}
                        >
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {pagination.totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PayslipHistory;