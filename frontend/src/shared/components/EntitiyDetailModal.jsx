import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X, Calendar, User, Building2, FileText, Clock, MapPin } from 'lucide-react';
import { formatIndianDate, formatIndianCurrency } from '../../utils/indianFormatters';

const DetailModal = ({ 
  open, 
  onClose, 
  title, 
  data, 
  sections = [], 
  actions = [],
  className = "" 
}) => {
  if (!data) return null;

  const renderFieldValue = (field, value) => {
    // Handle nested object access (e.g., 'parentDepartment.name')
    if (field.key && field.key.includes('.')) {
      const keys = field.key.split('.');
      let nestedValue = data;
      for (const key of keys) {
        nestedValue = nestedValue?.[key];
        if (nestedValue === undefined || nestedValue === null) break;
      }
      value = nestedValue;
    }

    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">Not specified</span>;
    }

    switch (field.type) {
      case 'date':
        try {
          return formatIndianDate(new Date(value));
        } catch {
          return <span className="text-gray-400 italic">Invalid date</span>;
        }
      case 'currency':
        try {
          return formatIndianCurrency(parseFloat(value));
        } catch {
          return <span className="text-gray-400 italic">Invalid amount</span>;
        }
      case 'badge':
        return (
          <Badge 
            className={field.badgeClass || 'bg-blue-100 text-blue-800'}
          >
            {value}
          </Badge>
        );
      case 'status':
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800',
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800',
          cancelled: 'bg-gray-100 text-gray-800',
          high: 'bg-red-100 text-red-800',
          normal: 'bg-blue-100 text-blue-800',
          low: 'bg-gray-100 text-gray-800',
          true: 'bg-green-100 text-green-800',
          false: 'bg-red-100 text-red-800'
        };
        const displayValue = typeof value === 'boolean' ? (value ? 'Active' : 'Inactive') : value;
        return (
          <Badge className={statusColors[value?.toString()?.toLowerCase()] || 'bg-gray-100 text-gray-800'}>
            {displayValue}
          </Badge>
        );
      case 'boolean':
        return (
          <Badge className={value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {value ? 'Yes' : 'No'}
          </Badge>
        );
      case 'list':
        if (Array.isArray(value)) {
          return (
            <div className="space-y-1">
              {value.map((item, index) => (
                <div key={index} className="text-sm">
                  {typeof item === 'object' ? item.name || item.title || JSON.stringify(item) : item}
                </div>
              ))}
            </div>
          );
        }
        return value;
      case 'longtext':
        return (
          <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto bg-gray-50 p-3 rounded border">
            {value}
          </div>
        );
      case 'email':
        return (
          <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800 underline">
            {value}
          </a>
        );
      case 'phone':
        return (
          <a href={`tel:${value}`} className="text-blue-600 hover:text-blue-800 underline">
            {value}
          </a>
        );
      case 'url':
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
            {value}
          </a>
        );
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      default:
        // Handle objects by displaying their string representation
        if (typeof value === 'object' && value !== null) {
          if (value.name) return value.name;
          if (value.title) return value.title;
          if (value.label) return value.label;
          return JSON.stringify(value);
        }
        return value;
    }
  };

  const getFieldIcon = (field) => {
    const iconMap = {
      date: Calendar,
      user: User,
      department: Building2,
      description: FileText,
      time: Clock,
      location: MapPin
    };
    
    const IconComponent = iconMap[field.icon];
    return IconComponent ? <IconComponent className="w-4 h-4 text-gray-400" /> : null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl mx-4 max-h-[90vh] overflow-y-auto ${className}`}>
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {title}
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

        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-3">
              {section.label && (
                <h3 className="text-base font-medium text-gray-900 border-b border-gray-200 pb-2">
                  {section.label}
                </h3>
              )}
              
              {section.component ? (
                section.component
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.fields?.map((field, fieldIndex) => {
                    // Get the value using the improved nested access
                    let fieldValue = field.value;
                    if (field.key) {
                      if (field.key.includes('.')) {
                        const keys = field.key.split('.');
                        fieldValue = data;
                        for (const key of keys) {
                          fieldValue = fieldValue?.[key];
                          if (fieldValue === undefined || fieldValue === null) break;
                        }
                      } else {
                        fieldValue = data[field.key];
                      }
                    }

                    return (
                      <div key={fieldIndex} className={field.fullWidth ? 'sm:col-span-2' : ''}>
                        <div className="flex items-start gap-2">
                          {getFieldIcon(field)}
                          <div className="flex-1 min-w-0">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              {field.label}
                            </label>
                            <div className="text-sm text-gray-900">
                              {renderFieldValue(field, fieldValue)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                onClick={action.onClick}
                disabled={action.disabled}
                className={action.className}
              >
                {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DetailModal;