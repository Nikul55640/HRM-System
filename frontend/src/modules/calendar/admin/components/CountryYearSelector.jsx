/**
 * Country and Year Selector Component
 * Reusable component for selecting country and year
 */

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../shared/ui/select';
import { Input } from '../../../../shared/ui/input';
import { Label } from '../../../../shared/ui/label';

const CountryYearSelector = ({ 
  country, 
  year, 
  countries, 
  onCountryChange, 
  onYearChange,
  disabled = false 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="country">Country</Label>
        <Select value={country} onValueChange={onCountryChange} disabled={disabled}>
          <SelectTrigger id="country">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.flag} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="year">Year</Label>
        <Input
          id="year"
          type="number"
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value) || new Date().getFullYear())}
          min="2020"
          max="2030"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default CountryYearSelector;
