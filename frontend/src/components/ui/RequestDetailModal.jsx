import React from "react";
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
 } from '../ui/dialog';
import { Badge } from  '../ui/badge';
import {
  formatDate,
  getStatusBadgeVariant,
  formatCurrency,
} from "../../utils/essHelpers";
const RequestDetailModal = ({ request, open, onClose }) => {
  if (!request) return null;

  const renderRequestSpecificDetails = () => {
    switch (request.requestType) {
      case "reimbursement":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Expense Type
                </p>
                <p className="capitalize">
                  {request.reimbursement?.expenseType}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Amount
                </p>
                <p>{formatCurrency(request.reimbursement?.amount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Expense Date
                </p>
                <p>{formatDate(request.reimbursement?.expenseDate)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Description
              </p>
              <p className="text-sm mt-1">
                {request.reimbursement?.description}
              </p>
            </div>
            {request.reimbursement?.receipts?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Receipts
                </p>
                <div className="flex gap-2 mt-2">
                  {request.reimbursement.receipts.map((receipt, index) => (
                    <a
                      key={index}
                      href={receipt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      Receipt {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "advance":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Amount
                </p>
                <p>{formatCurrency(request.advance?.amount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Repayment Period
                </p>
                <p>{request.advance?.repaymentMonths} Months</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Reason
              </p>
              <p className="text-sm mt-1">{request.advance?.reason}</p>
            </div>
          </div>
        );

      case "transfer":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Requested Department
                </p>
                <p>{request.transfer?.requestedDepartment}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Requested Location
                </p>
                <p>{request.transfer?.requestedLocation}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Preferred Date
                </p>
                <p>{formatDate(request.transfer?.preferredDate)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Reason
              </p>
              <p className="text-sm mt-1">{request.transfer?.reason}</p>
            </div>
          </div>
        );

      case "shift_change":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Requested Shift
                </p>
                <p className="capitalize">
                  {request.shiftChange?.requestedShift}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Effective Date
                </p>
                <p>{formatDate(request.shiftChange?.effectiveDate)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Reason
              </p>
              <p className="text-sm mt-1">{request.shiftChange?.reason}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-center mr-8">
            <DialogTitle className="capitalize flex items-center gap-2">
              {request.requestType?.replace("_", " ")} Request
            </DialogTitle>
            <Badge variant={getStatusBadgeVariant(request.status)}>
              {request.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Submitted on {formatDate(request.submittedAt)}
          </p>
        </DialogHeader>

        <div className="py-4">{renderRequestSpecificDetails()}</div>

        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium mb-3">Approval Workflow</h4>
          <div className="space-y-4">
            {request.approvalWorkflow?.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-0.5">
                  {step.status === "approved" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : step.status === "rejected" ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium capitalize">{step.role}</p>
                    <span className="text-xs text-muted-foreground capitalize">
                      {step.status}
                    </span>
                  </div>
                  {step.approver && (
                    <p className="text-sm text-muted-foreground">
                      {step.approver.firstName} {step.approver.lastName}
                    </p>
                  )}
                  {step.comments && (
                    <p className="text-sm bg-muted p-2 rounded mt-1">
                      {step.comments}
                    </p>
                  )}
                  {step.actionDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(step.actionDate)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestDetailModal;
