/**
 * Select Component
 * Reusable select dropdown component
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

const Select = ({ value, onValueChange, children, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Find the selected item's text
  const getSelectedText = () => {
    let selectedText = '';
    
    const findSelectedInChildren = (children) => {
      React.Children.forEach(children, (child) => {
        if (child?.type === SelectContent) {
          React.Children.forEach(child.props.children, (item) => {
            if (item?.type === SelectItem && item.props.value === value) {
              selectedText = item.props.children;
            }
          });
        }
      });
    };
    
    findSelectedInChildren(children);
    return selectedText;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            isOpen,
            onClick: () => !disabled && setIsOpen(!isOpen),
            disabled,
            selectedText: getSelectedText()
          });
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, {
            isOpen,
            value,
            onValueChange: (newValue) => {
              onValueChange?.(newValue);
              setIsOpen(false);
            }
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = ({ children, className, isOpen, onClick, disabled, selectedText, ...props }) => {
  return (
    <button
      type="button"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (child.type === SelectValue) {
          return React.cloneElement(child, { selectedText });
        }
        return child;
      })}
      <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform', isOpen && 'rotate-180')} />
    </button>
  );
};

const SelectValue = ({ placeholder, children, selectedText }) => {
  return (
    <span className="block truncate">
      {selectedText || children || <span className="text-gray-500">{placeholder}</span>}
    </span>
  );
};

const SelectContent = ({ children, className, isOpen, value, onValueChange, ...props }) => {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'absolute top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg',
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (child.type === SelectItem) {
          return React.cloneElement(child, {
            isSelected: value === child.props.value,
            onSelect: () => onValueChange?.(child.props.value)
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectItem = ({ value, children, className, isSelected, onSelect, ...props }) => {
  return (
    <button
      type="button"
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100',
        isSelected && 'bg-gray-100',
        className
      )}
      onClick={onSelect}
      {...props}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4" />
        </span>
      )}
      {children}
    </button>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };