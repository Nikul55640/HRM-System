import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useForm } from 'react-hook-form';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Label } from '../../../shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../../shared/ui/popover';
import { Calendar } from '../../../shared/ui/calendar';
import { CalendarIcon, Clock, Loader2, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { formatDate } from '../../../lib/date-utils.js';
import useAttendanceStore from '../../../stores/useAttendanceStore';
import useEmployeeStore from '../../../stores/useEmployeeStore';

const statusOptions = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'on-leave', label: 'On Leave' },
  { value: 'holiday', label: 'Holiday' },
];

const AttendanceForm = ({ record, onClose, onSubmit }) => {
  const { updateAttendanceRecord, loading: attendanceLoading } = useAttendanceStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  
  const [loading, setLoading] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeResults, setEmployeeResults] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      employeeId: record?.employeeId || '',
      date: record?.date ? parseISO(record.date) : new Date(),
      status: record?.status || 'present',
      clockIn: record?.clockIn ? format(parseISO(record.clockIn), 'HH:mm') : '09:00',
      clockOut: record?.clockOut ? format(parseISO(record.clockOut), 'HH:mm') : '18:00',
      notes: record?.notes || '',
    },
  });

  const status = watch('status');
  const date = watch('date');
  const clockIn = watch('clockIn');
  const clockOut = watch('clockOut');

  // Set selected employee if editing
  useEffect(() => {
    if (record?.employee) {
      setSelectedEmployee({
        id: record.employeeId,
        name: record.employee.name,
        employeeId: record.employee.employeeId,
      });
    }
  }, [record]);

  // Calculate working hours
  useEffect(() => {
    if (status === 'present' && clockIn && clockOut) {
      const [inHours, inMinutes] = clockIn.split(':').map(Number);
      const [outHours, outMinutes] = clockOut.split(':').map(Number);
      
      let hours = outHours - inHours;
      let minutes = outMinutes - inMinutes;
      
      if (minutes < 0) {
        hours -= 1;
        minutes += 60;
      }
      
      // Update working hours display (not part of form data)
      // This is just for display purposes
      const workingHours = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      document.getElementById('workingHours').textContent = workingHours;
    } else {
      document.getElementById('workingHours').textContent = '--:--';
    }
  }, [status, clockIn, clockOut]);

  const handleEmployeeSearch = async (query) => {
    setEmployeeSearch(query);
    if (query.length > 2) {
      // In a real app, you would fetch employees from your API
      // For now, we'll simulate a search
      setTimeout(() => {
        setEmployeeResults([
          { id: '1', name: 'John Doe', employeeId: 'EMP001' },
          { id: '2', name: 'Jane Smith', employeeId: 'EMP002' },
          { id: '3', name: 'Robert Johnson', employeeId: 'EMP003' },
        ].filter(emp => 
          emp.name.toLowerCase().includes(query.toLowerCase()) ||
          emp.employeeId.toLowerCase().includes(query.toLowerCase())
        ));
      }, 300);
    } else {
      setEmployeeResults([]);
    }
  };

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setValue('employeeId', employee.id);
    setEmployeeSearch('');
    setEmployeeResults([]);
  };

  const onFormSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Format the data before submitting
      const formattedData = {
        ...data,
        date: formatDate(data.date),
        clockIn: data.status === 'present' ? `${data.clockIn}:00` : null,
        clockOut: data.status === 'present' ? `${data.clockOut}:00` : null,
      };
      
      await onSubmit(formattedData);
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {record ? 'Edit Attendance Record' : 'Add New Attendance Record'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employee">Employee</Label>
            {selectedEmployee ? (
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-medium">{selectedEmployee.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmployee.employeeId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEmployee(null);
                    setValue('employeeId', '');
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  id="employee"
                  placeholder="Search employee by name or ID"
                  value={employeeSearch}
                  onChange={(e) => handleEmployeeSearch(e.target.value)}
                  autoComplete="off"
                />
                {employeeResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
                    {employeeResults.map((emp) => (
                      <div
                        key={emp.id}
                        className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                        onClick={() => handleSelectEmployee(emp)}
                      >
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-sm text-muted-foreground">{emp.employeeId}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {errors.employeeId && (
              <p className="text-sm text-red-500">Please select an employee</p>
            )}
            <input type="hidden" {...register('employeeId', { required: true })} />
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => setValue('date', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={status} 
              onValueChange={(value) => setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clock In/Out Times (only shown for present status) */}
          {status === 'present' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clockIn">Clock In</Label>
                <div className="relative">
                  <Input
                    id="clockIn"
                    type="time"
                    {...register('clockIn', { required: 'Clock in time is required' })}
                    className="pl-10"
                  />
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.clockIn && (
                  <p className="text-sm text-red-500">{errors.clockIn.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="clockOut">Clock Out</Label>
                <div className="relative">
                  <Input
                    id="clockOut"
                    type="time"
                    {...register('clockOut', { required: 'Clock out time is required' })}
                    className="pl-10"
                  />
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.clockOut && (
                  <p className="text-sm text-red-500">{errors.clockOut.message}</p>
                )}
              </div>
              <div className="col-span-2">
                <div className="flex justify-between rounded-md border p-3">
                  <span className="text-sm font-medium">Working Hours:</span>
                  <span id="workingHours" className="font-mono">--:--</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Add any notes about this attendance record"
              {...register('notes')}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {record ? 'Update Record' : 'Add Record'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceForm;
