import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../shared/ui/dialog';
import { formatCurrency } from '../../../core/utils/essHelpers';

const PayslipDetail = ({ payslip, open, onClose }) => {
  if (!payslip) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Payslip Details - {payslip.month} {payslip.year}</DialogTitle>
          <DialogDescription>
            Generated on {new Date(payslip.generatedAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Earnings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Earnings</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Basic Salary</span>
                <span>{formatCurrency(payslip.earnings?.basic || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>HRA</span>
                <span>{formatCurrency(payslip.earnings?.hra || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Allowances</span>
                <span>{formatCurrency(payslip.earnings?.allowances || 0)}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Total Earnings</span>
                <span>{formatCurrency(payslip.totalEarnings || 0)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Deductions</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>PF</span>
                <span>{formatCurrency(payslip.deductions?.pf || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(payslip.deductions?.tax || 0)}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Total Deductions</span>
                <span>{formatCurrency(payslip.totalDeductions || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
          <span className="font-bold text-lg">Net Salary</span>
          <span className="font-bold text-xl">{formatCurrency(payslip.netSalary)}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayslipDetail;
