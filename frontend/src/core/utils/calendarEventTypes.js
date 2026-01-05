import React from 'react';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  Plane, 
  Cake, 
  PartyPopper, 
  MapPin, 
  Building2, 
  Clock, 
  FileText 
} from 'lucide-react';

/**
 * Standardized Calendar Event Types Configuration
 * Provides consistent colors, icons, and labels across the application
 */

export const EVENT_TYPES = {
  holiday: {
    label: 'Holiday',
    color: '#dc2626', // Red
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-500',
    icon: Calendar,
    priority: 1
  },
  meeting: {
    label: 'Meeting',
    color: '#3b82f6', // Blue
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-500',
    icon: Users,
    priority: 2
  },
  training: {
    label: 'Training',
    color: '#059669', // Green
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-500',
    icon: BookOpen,
    priority: 3
  },
  leave: {
    label: 'Leave',
    color: '#f59e0b', // Orange
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-500',
    icon: Plane,
    priority: 4
  },
  birthday: {
    label: 'Birthday',
    color: '#ec4899', // Pink
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-800',
    borderColor: 'border-pink-500',
    icon: Cake,
    priority: 5
  },
  anniversary: {
    label: 'Anniversary',
    color: '#8b5cf6', // Purple
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-500',
    icon: PartyPopper,
    priority: 6
  },
  event: {
    label: 'Event',
    color: '#10b981', // Emerald
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-500',
    icon: MapPin,
    priority: 7
  },
  company_event: {
    label: 'Company Event',
    color: '#6366f1', // Indigo
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-800',
    borderColor: 'border-indigo-500',
    icon: Building2,
    priority: 8
  },
  deadline: {
    label: 'Deadline',
    color: '#ef4444', // Red
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-500',
    icon: Clock,
    priority: 9
  },
  other: {
    label: 'Other',
    color: '#6b7280', // Gray
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-500',
    icon: FileText,
    priority: 10
  }
};

/**
 * Get event type configuration
 * @param {string} eventType - The event type
 * @returns {object} Event type configuration
 */
export const getEventTypeConfig = (eventType) => {
  return EVENT_TYPES[eventType] || EVENT_TYPES.other;
};

/**
 * Get event color (hex)
 * @param {string} eventType - The event type
 * @returns {string} Hex color code
 */
export const getEventColor = (eventType) => {
  return getEventTypeConfig(eventType).color;
};

/**
 * Get event CSS classes
 * @param {string} eventType - The event type
 * @returns {object} CSS classes for different contexts
 */
export const getEventClasses = (eventType) => {
  const config = getEventTypeConfig(eventType);
  return {
    badge: `${config.bgColor} ${config.textColor}`,
    border: config.borderColor,
    dot: config.color
  };
};

/**
 * Get event icon component
 * @param {string} eventType - The event type
 * @returns {React.Component} Lucide React icon component
 */
export const getEventIcon = (eventType) => {
  return getEventTypeConfig(eventType).icon;
};

/**
 * Render event icon with proper styling
 * @param {string} eventType - The event type
 * @param {string} className - Additional CSS classes
 * @returns {React.Element} Rendered icon element
 */
export const renderEventIcon = (eventType, className = "h-4 w-4") => {
  const IconComponent = getEventIcon(eventType);
  return React.createElement(IconComponent, { className });
};

/**
 * Get event label
 * @param {string} eventType - The event type
 * @returns {string} Human-readable label
 */
export const getEventLabel = (eventType) => {
  return getEventTypeConfig(eventType).label;
};

/**
 * Get all event types for filters
 * @returns {array} Array of event type options
 */
export const getEventTypeOptions = () => {
  return Object.entries(EVENT_TYPES).map(([key, config]) => ({
    value: key,
    label: config.label,
    icon: config.icon,
    color: config.color
  }));
};

/**
 * Sort events by priority and date
 * @param {array} events - Array of events
 * @returns {array} Sorted events
 */
export const sortEventsByPriority = (events) => {
  return events.sort((a, b) => {
    const aPriority = getEventTypeConfig(a.eventType).priority;
    const bPriority = getEventTypeConfig(b.eventType).priority;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // If same priority, sort by date
    return new Date(a.startDate) - new Date(b.startDate);
  });
};