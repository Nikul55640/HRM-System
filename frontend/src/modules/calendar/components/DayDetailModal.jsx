import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Gift, 
  Award,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import useCalendarStore from '../stores/useCalendarStore';
import LeaveApplicationModal from './LeaveApplicationModal';

const DayDetailModal = ({ 
  isOpen, 
  onClose, 
  selectedDate,