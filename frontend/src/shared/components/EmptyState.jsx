import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  actionLabel,
  className = "" 
}) => {
  return (
    <Card className={`text-center py-12 ${className}`}>
      <CardContent className="space-y-4">
        {Icon && (
          <div className="mx-auto w-16 h-16 text-gray-400 flex items-center justify-center">
            <Icon size={64} />
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-gray-500 max-w-md mx-auto">{description}</p>
          )}
        </div>
        {action && actionLabel && (
          <Button onClick={action} className="mt-4">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;