/**
 * Holiday Types Constants
 * Centralized configuration for holiday categories
 */

import { Building2, Church, MapPin, Calendar } from 'lucide-react';

export const HOLIDAY_TYPES = [
  {
    value: 'national',
    label: 'National',
    icon: Building2,
    description: 'Official national holidays'
  },
  {
    value: 'religious',
    label: 'Religious',
    icon: Church,
    description: 'Religious observances and festivals'
  },
  {
    value: 'local',
    label: 'Local',
    icon: MapPin,
    description: 'Regional and local holidays'
  },
  {
    value: 'observance',
    label: 'Observance',
    icon: Calendar,
    description: 'Special observances and commemorations'
  }
];

export const DEFAULT_SELECTED_TYPES = ['national', 'religious'];
