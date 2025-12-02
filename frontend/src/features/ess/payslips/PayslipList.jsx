import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from  '../../../components/ui/table';  
import { Download, Eye } from 'lucide-react';
import { formatDate, formatCurrency } from '../../../utils/essHelpers';
const PayslipList = ({ payslips, onView, onDownload }) => {
  if (!payslips || payslips.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No payslips available.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payslips</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Generated On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payslips.map((payslip) => (
                <TableRow key={payslip.id || payslip._id}>
                  <TableCell className="font-medium">{payslip.month}</TableCell>
                  <TableCell>{payslip.year}</TableCell>
                  <TableCell>{formatCurrency(payslip.netSalary)}</TableCell>
                  <TableCell>{formatDate(payslip.generatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onView(payslip)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDownload(payslip)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayslipList;
