import React from 'react';
import { cn } from '../../lib/utils';

const RadioGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div
    className={cn("grid gap-2", className)}
    {...props}
    ref={ref}
    role="radiogroup"
  />
));
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <div className="flex items-center space-x-2">
    <input
      type="radio"
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
    {children && (
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {children}
      </label>
    )}
  </div>
));
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };