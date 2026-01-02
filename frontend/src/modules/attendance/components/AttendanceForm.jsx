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
import api from '../../../services/api';
import { getEmployeeFullName } from '../../../utils/employeeDataMapper';


const AttendanceForm = ({ record, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeResults, setEmployeeResults] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [statusOptions, setStatusOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    loadStatusOptions();
  }, []);

  const loadStatusOptions = async () => {
    try {
      const response = await api.get('/admin/attendance-status');
      if (response.data.success) {
        setStatusOptions(response.data.data);
      }
    } catch (error) {
      console.error('Error loading status options:', error);
      // Fallback to hardcoded options
      setStatusOptions([
        { value: 'present', label: 'Present' },
        { value: 'absent', label: 'Absent' },
        { value: 'leave', label: 'On Leave' },
        { value: 'half_day', label: 'Half Day' },
        { value: 'holiday', label: 'Holiday' },
        { value: 'incomplete', label: 'Incomplete' },
        { value: 'pending_correction', label: 'Pending Correction' },
      ]);
    } finally {
      setLoadingOptions(false);
    }
  };
  
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    defaultValues: {
      employeeId: record?.employeeId || '',
      date: record?.date ? parseISO(record.date) : new Date(),
      status: record?.status || 'present',
      clockIn: record?.clockIn ? format(parseISO(record.clockIn), 'HH:mm') : '09:00',
      clockOut: record?.clockOut ? format(parseISO(record.clockOut), 'HH:mm') : '18:00',
      notes: record?.remarks || '',
    },
  });

  // Reset form when record changes
  useEffect(() => {
    if (record) {
      reset({
        employeeId: record.employeeId || '',
        date: record.date ? parseISO(record.date) : new Date(),
        status: record.status || 'present',
        clockIn: record.clockIn ? format(parseISO(record.clockIn), 'HH:mm') : '09:00',
        clockOut: record.clockOut ? format(parseISO(record.clockOut), 'HH:mm') : '18:00',
        notes: record.remarks || '',
      });
    }
  }, [record, reset]);

  const status = watch('status');
  const date = watch('date');
  const clockIn = watch('clockIn');
  const clockOut = watch('clockOut');

  // Set selected employee if editing
  useEffect(() => {
    if (record?.employee) {
      const employee = {
        id: record.employeeId,
        name: getEmployeeFullName(record.employee),
        employeeId: record.employee.employeeId,
      };
      setSelectedEmployee(employee);
      setValue('employeeId', record.employeeId);
    }
  }, [record, setValue]);

  // Calculate working hours
  useEffect(() => {
    if (status === 'present' && clockIn && clockOut) {
      try {
        const [inHours, inMinutes] = clockIn.split(':').map(Number);
        const [outHours, outMinutes] = clockOut.split(':').map(Number);
        
        // Convert to minutes for easier calculation
        const clockInMinutes = inHours * 60 + inMinutes;
        const clockOutMinutes = outHours * 60 + outMinutes;
        
        let totalMinutes = clockOutMinutes - clockInMinutes;
        
        // Handle next day clock out (e.g., night shift)
        if (totalMinutes < 0) {
          totalMinutes += 24 * 60; // Add 24 hours
        }
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        // Update working hours display
        const workingHours = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const workingHoursElement = document.getElementById('workingHours');
        if (workingHoursElement) {
          workingHoursElement.textContent = workingHours;
        }
      } catch (error) {
        console.error('Error calculating working hours:', error);
        const workingHoursElement = document.getElementById('workingHours');
        if (workingHoursElement) {
          workingHoursElement.textContent = '--:--';
        }
      }
    } else {
      const workingHoursElement = document.getElementById('workingHours');
      if (workingHoursElement) {
        workingHoursElement.textContent = '--:--';
      }
    }
  }, [status, clockIn, clockOut]);

  const handleEmployeeSearch = async (query) => {
    setEmployeeSearch(query);
    if (query.length > 2) {
      try {
        const response = await api.get('/employees/search', {
          params: { q: query, limit: 10 }
        });
        
        if (response.data.success) {
          const employees = response.data.data.employees.map(emp => ({
            id: emp.id,
            name: getEmployeeFullName(emp),
            employeeId: emp.employeeId
          }));
          setEmployeeResults(employees);
        } else {
          setEmployeeResults([]);
        }
      } catch (error) {
        console.error('Error searching employees:', error);
        // Fallback to mock data if API fails
        setEmployeeResults([
          { id: '1', name: 'John Doe', employeeId: 'EMP001' },
          { id: '2', name: 'Jane Smith', employeeId: 'EMP002' },
          { id: '3', name: 'Robert Johnson', employeeId: 'EMP003' },
        ].filter(emp => 
          emp.name.toLowerCase().includes(query.toLowerCase()) ||
          emp.employeeId.toLowerCase().includes(query.toLowerCase())
        ));
      }
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
      
      if (!selectedEmployee && !data.employeeId) {
        alert('Please select an employee');
        return;
      }
      
      // Format the data before submitting
      const formattedData = {
        ...data,
        employeeId: selectedEmployee?.id || data.employeeId,
        date: formatDate(data.date),
        clockIn: data.status === 'present' && data.clockIn ? `${data.clockIn}:00` : null,
        clockOut: data.status === 'present' && data.clockOut ? `${data.clockOut}:00` : null,
        remarks: data.notes, // Map notes to remarks field
      };
      
      console.log('Submitting attendance data:', formattedData);
      
      await onSubmit(formattedData);
      
      // Close the form on successful submission
      onClose();
      
    } catch (error) {
      console.error('Form submission error:', error);
      alert(error.message || 'Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
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

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employee">Employee *</Label>
            {selectedEmployee ? (
              <div className="flex items-center justify-between rounded-md border p-3 bg-gray-50">
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
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg max-h-48 overflow-y-auto">
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

          {/* Date and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Date *</Label>
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
              <Label htmlFor="status">Status *</Label>
              {loadingOptions ? (
                <div className="flex items-center justify-center h-10 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
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
              )}
            </div>
          </div>

          {/* Clock In/Out Times (only shown for present status) */}
          {status === 'present' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clockIn">Clock In *</Label>
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
                  <Label htmlFor="clockOut">Clock Out *</Label>
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
              </div>
              
              {/* Working Hours Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-900">Total Working Hours:</span>
                  <span id="workingHours" className="font-mono text-lg font-bold text-blue-900">--:--</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder="Add any notes about this attendance record..."
              {...register('notes')}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || (!selectedEmployee && !watch('employeeId'))}>
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
