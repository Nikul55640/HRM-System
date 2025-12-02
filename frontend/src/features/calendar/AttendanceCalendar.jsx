import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { formatDate, calculateWorkHours, getStatusBadgeColor } from '../../utils/essHelpers';
import { Badge } from '../../components/ui/badge';
const AttendanceCalendar = ({ records }) => {
  if (!records || records.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No attendance records found for this period.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Work Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => {
                const workHours = calculateWorkHours(record.checkIn, record.checkOut);
                const statusColor = getStatusBadgeColor(record.status);
                
                return (
                  <TableRow key={record.id || record._id}>
                    <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                    <TableCell>{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}</TableCell>
                    <TableCell>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}</TableCell>
                    <TableCell>{workHours > 0 ? `${workHours} hrs` : '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border-0 ${statusColor}`}>
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceCalendar;
