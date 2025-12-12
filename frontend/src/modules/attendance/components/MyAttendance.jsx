import React, { useEffect, useState } from 'react';
import { format, parseISO, isToday } from 'date-fns';
import { Button } from '../../../shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/ui/table';
import { Badge } from '../../../shared/ui/badge';
import { Clock, ClockIn, ClockOut, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import useAttendanceStore from '../../../stores/useAttendanceStore';
import { Calendar } from '../../../shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../shared/ui/popover';
import { cn } from '../../../lib/utils';

const statusVariant = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-yellow-100 text-yellow-800',
  'on-leave': 'bg-blue-100 text-blue-800',
  holiday: 'bg-purple-100 text-purple-800',
};

const MyAttendance = () => {
  const { 
    todayStatus, 
    myAttendance, 
    loading, 
    fetchMyAttendance, 
    clockIn, 
    clockOut, 
    fetchTodayStatus 
  } = useAttendanceStore();
  const [date, setDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    // Fetch attendance for the selected month
    fetchMyAttendance({
      month: selectedMonth.getMonth() + 1,
      year: selectedMonth.getFullYear(),
    });
  }, [fetchMyAttendance, selectedMonth]);

  const handleClockIn = async () => {
    try {
      // Get user's current location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      await clockIn({
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: 'Office', // You can use a geocoding service to get the actual address
        },
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      });

      // Refresh today's status
      fetchTodayStatus();
    } catch (error) {
      console.error('Failed to clock in:', error);
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut({
        notes: 'End of workday',
      });

      // Refresh today's status
      fetchTodayStatus();
    } catch (error) {
      console.error('Failed to clock out:', error);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return format(parseISO(timeString), 'hh:mm a');
  };

  const getStatusBadge = (status) => (
    <Badge className={cn('capitalize', statusVariant[status] || 'bg-gray-100 text-gray-800')}>
      {status.replace('-', ' ')}
    </Badge>
  );

  return (
    <div className="space-y-6">
      {/* Clock In/Out Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Today's Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="text-lg font-semibold">
                {todayStatus?.status ? getStatusBadge(todayStatus.status) : '--'}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Clock In</p>
              <div className="text-lg font-mono">
                {todayStatus?.clockIn ? formatTime(todayStatus.clockIn) : '--:--'}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Clock Out</p>
              <div className="text-lg font-mono">
                {todayStatus?.clockOut ? formatTime(todayStatus.clockOut) : '--:--'}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <Button 
              onClick={handleClockIn} 
              disabled={!!todayStatus?.clockIn || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ClockIn className="mr-2 h-4 w-4" />
                  Clock In
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClockOut} 
              disabled={!todayStatus?.clockIn || !!todayStatus?.clockOut || loading}
              className="flex-1"
            >
              <ClockOut className="mr-2 h-4 w-4" />
              Clock Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            Attendance Calendar
          </CardTitle>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedMonth, 'MMMM yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedMonth}
                onSelect={(date) => {
                  setSelectedMonth(date);
                  setCalendarOpen(false);
                }}
                initialFocus
                defaultMonth={new Date()}
                toMonth={new Date()}
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Working Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading attendance records...</p>
                  </TableCell>
                </TableRow>
              ) : myAttendance.length > 0 ? (
                myAttendance.map((record) => (
                  <TableRow key={record.id} className={isToday(parseISO(record.date)) ? 'bg-muted/50' : ''}>
                    <TableCell className="font-medium">
                      {format(parseISO(record.date), 'EEEE, MMMM d, yyyy')}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>{formatTime(record.clockIn)}</TableCell>
                    <TableCell>{formatTime(record.clockOut)}</TableCell>
                    <TableCell>
                      {record.workingHours || '--:--'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No attendance records found for this month.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyAttendance;
