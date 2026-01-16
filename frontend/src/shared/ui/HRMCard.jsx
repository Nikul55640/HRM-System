import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { cn } from '../../lib/utils';
import { Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';

const HRMCard = ({ 
  title, 
  subtitle, 
  children, 
  actions = [], 
  onView, 
  onEdit, 
  onDelete,
  className,
  headerActions,
  ...props 
}) => {
  return (
    <Card className={cn("hover:shadow-md transition-shadow duration-200", className)} {...props}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
          {(headerActions || onView || onEdit || onDelete) && (
            <div className="flex items-center gap-2">
              {headerActions}
              {onView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onView}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={action.onClick}
                className={action.className}
              >
                {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Specialized card variants for different HRM use cases
const HRMStatsCard = ({ title, value, subtitle, icon: Icon, trend, className, ...props }) => (
  <Card className={cn("hover:shadow-md transition-shadow duration-200", className)} {...props}>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={cn(
            "font-medium",
            trend.type === 'increase' ? 'text-green-600' : 'text-red-600'
          )}>
            {trend.value}
          </span>
          <span className="text-gray-500 ml-1">{trend.label}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const HRMListCard = ({ items = [], title, emptyMessage = "No items found", className, ...props }) => (
  <Card className={cn("", className)} {...props}>
    {title && (
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
    )}
    <CardContent className={title ? "pt-0" : "p-4"}>
      {items.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex-1">
                {item.title && (
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {item.title}
                  </p>
                )}
                {item.subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.subtitle}
                  </p>
                )}
              </div>
              {item.badge && (
                <div className="ml-4">
                  {item.badge}
                </div>
              )}
              {item.actions && (
                <div className="ml-4 flex gap-2">
                  {item.actions}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export { HRMCard, HRMStatsCard, HRMListCard };