import React, { useState, useEffect } from 'react';
import { Filter, X, Download, Users, Building2, Calendar } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useOrganizationStore } from '../../../stores/useOrganizationStore';
import { useEmployeeStore } from '../../../stores/useEmployeeStore';
import api from '../../../services/api';

const CalendarFilters = ({
  filters,
  onFiltersChange,
  onClearFilters,
  onExport,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [eventTypeOptions, setEventTypeOptions] = useState([]);
  const { departments, fetchDepartments } = useOrganizationStore();
  const { employees, fetchEmployees } = useEmployeeStore();

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
    loadEventTypes();
  }, [fetchDepartments, fetchEmployees]);

  const loadEventTypes = async () => {
    try {
      const response = await api.get('/admin/event-types');
      if (response.data.success) {
        setEventTypeOptions(response.data.data);
      }
    } catch (error) {
      console.error('Error loading event types:', error);
      // Fallback to hardcoded options
      setEventTypeOptions([
        { value: 'holiday', label: 'Holidays', color: 'bg-red-100 text-red-800' },
        { value: 'meeting', label: 'Meetings', color: 'bg-blue-100 text-blue-800' },
        { value: 'training', label: 'Training', color: 'bg-green-100 text-green-800' },
        { value: 'company_event', label: 'Company Events', color: 'bg-purple-100 text-purple-800' },
        { value: 'birthday', label: 'Birthdays', color: 'bg-pink-100 text-pink-800' },
        { value: 'anniversary', label: 'Anniversaries', color: 'bg-indigo-100 text-indigo-800' }
      ]);
    }
  };

  const handleFilterChange = (key, value) => {
    onFiltersChange({ [key]: value });
  };

  const hasActiveFilters = filters.departmentId || filters.employeeId || filters.eventTypes.length > 0 || filters.includeAttendance;

  return (
    <div className={cn("bg-white border border-gray-200 rounded-lg", className)}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Active
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onExport('xlsx')}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Filter className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
          </button>
        </div>
      </div>
      
      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={filters.departmentId || ''}
                onChange={(e) => handleFilterChange('departmentId', e.target.value || null)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Employee Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select
                value={filters.employeeId || ''}
                onChange={(e) => handleFilterChange('employeeId', e.target.value || null)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.personalInfo?.firstName} {emp.personalInfo?.lastName} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Include Attendance */}
            <div className="flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.includeAttendance}
                  onChange={(e) => handleFilterChange('includeAttendance', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Include Attendance
                </span>
              </label>
            </div>
          </div>
          
          {/* Event Types Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Types
            </label>
            <div className="flex flex-wrap gap-2">
              {eventTypeOptions.map((option) => {
                const isSelected = filters.eventTypes.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      const newEventTypes = isSelected
                        ? filters.eventTypes.filter(type => type !== option.value)
                        : [...filters.eventTypes, option.value];
                      handleFilterChange('eventTypes', newEventTypes);
                    }}
                    className={cn(
                      "inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border transition-colors",
                      isSelected
                        ? `${option.color} border-current`
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {option.label}
                    {isSelected && (
                      <X className="w-3 h-3 ml-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-end pt-2 border-t border-gray-200">
              <button
                onClick={onClearFilters}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <X className="w-4 h-4 mr-1.5" />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarFilters;