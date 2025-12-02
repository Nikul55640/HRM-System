import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card'
    ;
import { Button } from '../../ui/button'
    ;
import { maskAccountNumber } from '../../../utils/essHelpers';
import ApprovalStatusBadge from '../../employee-self-service/profile/ApprovalStatusBadge';

const BankDetailsView = ({ bankDetails, onEdit }) => {
  if (!bankDetails) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No bank details found.</p>
          <Button onClick={onEdit}>Add Bank Details</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Bank Details</CardTitle>
          <CardDescription>Your current salary account information</CardDescription>
        </div>
        <Button variant="outline" onClick={onEdit}>Edit</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Account Holder Name</p>
            <p className="text-lg">{bankDetails.accountHolderName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
            <p className="text-lg">{bankDetails.bankName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Account Number</p>
            <p className="text-lg font-mono">{maskAccountNumber(bankDetails.accountNumber)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">IFSC Code</p>
            <p className="text-lg font-mono">{bankDetails.ifscCode}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <div className="mt-1">
              <ApprovalStatusBadge status={bankDetails.status || 'Approved'} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BankDetailsView;
