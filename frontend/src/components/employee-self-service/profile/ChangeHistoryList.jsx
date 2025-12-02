import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import ApprovalStatusBadge from '../../../components/employee-self-service/profile/ApprovalStatusBadge';
import { formatDate } from '../../../utils/essHelpers';

const ChangeHistoryList = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No change history available.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change History</CardTitle>
        <CardDescription>Track status of your profile update requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Field(s) Changed</TableHead>
                <TableHead>Old Value</TableHead>
                <TableHead>New Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id || item._id}>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <TableCell className="font-medium">
                    {Array.isArray(item.changes) 
                      ? item.changes.map(c => c.field).join(', ')
                      : item.field}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate" title={item.oldValue}>
                    {item.oldValue || '-'}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={item.newValue}>
                    {item.newValue}
                  </TableCell>
                  <TableCell>
                    <ApprovalStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.comments || '-'}
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

export default ChangeHistoryList;
