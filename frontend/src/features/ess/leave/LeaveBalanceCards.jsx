import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { calculateLeaveBalance } from '../../../utils/essHelpers';
const LeaveBalanceCards = ({ balances }) => {
  if (!balances || balances.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No leave balance information available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {balances.map((balance) => {
        const available = calculateLeaveBalance(
          balance.allocated,
          balance.used,
          balance.pending
        );
        
        return (
          <Card key={balance.type}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {balance.type}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{available}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {balance.used} used · {balance.pending} pending
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default LeaveBalanceCards;
