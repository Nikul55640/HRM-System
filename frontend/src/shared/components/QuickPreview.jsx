import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X, Eye, Edit, User, Mail, Phone, Building2, Briefcase, Calendar } from 'lucide-react';
import { formatIndianDate } from '../../utils/indianFormatters';

const QuickPreview = ({ 
  open, 
  onClose, 
  item, 
  title,
  fields = [], 
  actions = [],
  className = "" 
}) => {
  if (!item) return null;

  const defaultFields = [
    { key: 'name', label: 'Name', icon: User },
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'phone', label: 'Phone', icon: Phone },
    { key: 'department', label: 'Department', icon: Building2 },
    { key: 'designation', label: 'Designation', icon: Briefcase },
    { key: 'status', label: 'Status', type: 'status' }
  ];

  const fieldsToShow = fields.length > 0 ? fields : defaultFields;

  const renderFieldValue = (field, value) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">Not specified</span>;
    }

    switch (field.type) {
      case 'date':
        return formatIndianDate(new Date(value));
      case 'status':
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800',
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800',
          cancelled: 'bg-gray-100 text-gray-800'
        };
        return (
          <Badge className={statusColors[value?.toLowerCase()] || 'bg-gray-100 text-gray-800'}>
            {value}
          </Badge>
        );
      case 'object':
        return typeof value === 'object' ? value?.name || value?.title || 'N/A' : value;
      default:
        return value;
    }
  };

  const getFieldIcon = (field) => {
    const IconComponent = field.icon;
    return IconComponent ? <IconComponent className="w-4 h-4 text-gray-400" /> : null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`max-w-md mx-4 ${className}`}>
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {title || 'Quick Preview'}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Main Info */}
          <div className="text-center pb-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              {item.name || item.title || item.firstName + ' ' + (item.lastName || '')}
            </h3>
            {item.employeeId && (
              <p className="text-sm text-gray-600">ID: {item.employeeId}</p>
            )}
          </div>

          {/* Fields */}
          <div className="space-y-3">
            {fieldsToShow.map((field, index) => {
              const value = field.key.includes('.') 
                ? field.key.split('.').reduce((obj, key) => obj?.[key], item)
                : item[field.key];
              
              if (field.key === 'name' || field.key === 'title') return null; // Skip as it's shown in header
              
              return (
                <div key={index} className="flex items-center gap-3">
                  {getFieldIcon(field)}
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-gray-600">
                      {field.label}
                    </label>
                    <div className="text-sm text-gray-900 truncate">
                      {renderFieldValue(field, value)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          {actions.length > 0 && (
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`w-full ${action.className || ''}`}
                >
                  {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickPreview;