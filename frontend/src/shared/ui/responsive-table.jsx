import React from 'react';
import { Card, CardContent } from './card';
import { cn } from '../../lib/utils';

// Responsive table that switches to card layout on mobile
export const ResponsiveTable = ({ 
  data = [], 
  columns = [], 
  className = "",
  cardClassName = "",
  tableClassName = "",
  emptyMessage = "No data available",
  loading = false,
  onRowClick = null,
  keyField = "id"
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32 sm:h-48">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500">
        <p className="text-sm sm:text-base">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Mobile Card View */}
      <div className={cn("block sm:hidden space-y-3", cardClassName)}>
        {data.map((row, index) => (
          <Card 
            key={row[keyField] || index}
            className={cn(
              "cursor-pointer hover:shadow-md transition-shadow",
              onRowClick && "hover:bg-gray-50"
            )}
            onClick={() => onRowClick && onRowClick(row)}
          >
            <CardContent className="p-4">
              {columns.map((column, colIndex) => {
                if (column.hideOnMobile) return null;
                
                const value = column.accessor ? column.accessor(row) : row[column.key];
                
                return (
                  <div key={colIndex} className="flex justify-between items-start py-1">
                    <span className="text-sm font-medium text-gray-600 flex-shrink-0 mr-3">
                      {column.header}:
                    </span>
                    <div className="text-sm text-gray-900 text-right flex-1">
                      {column.render ? column.render(value, row) : value}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className={cn("hidden sm:block overflow-x-auto", tableClassName)}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    "text-left py-3 px-4 font-medium text-gray-700 text-sm",
                    column.headerClassName
                  )}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row[keyField] || index}
                className={cn(
                  "border-b border-gray-100 hover:bg-gray-50 transition-colors",
                  onRowClick && "cursor-pointer",
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                )}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => {
                  const value = column.accessor ? column.accessor(row) : row[column.key];
                  
                  return (
                    <td
                      key={colIndex}
                      className={cn(
                        "py-3 px-4 text-sm text-gray-900",
                        column.cellClassName
                      )}
                    >
                      {column.render ? column.render(value, row) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Responsive data list component for simpler layouts
export const ResponsiveDataList = ({ 
  items = [], 
  renderItem, 
  className = "",
  emptyMessage = "No items found",
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, index) => (
        <div key={item.id || index}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
};

// Responsive grid component
export const ResponsiveGrid = ({ 
  children, 
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = "gap-4",
  className = ""
}) => {
  const gridCols = `grid-cols-${cols.default} sm:grid-cols-${cols.sm} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg}`;
  
  return (
    <div className={cn("grid", gridCols, gap, className)}>
      {children}
    </div>
  );
};

// Responsive stats cards
export const ResponsiveStatsGrid = ({ stats = [], className = "" }) => {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6", className)}>
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                {stat.change && (
                  <p className={cn(
                    "text-xs sm:text-sm mt-1",
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  )}>
                    {stat.change}
                  </p>
                )}
              </div>
              {stat.icon && (
                <div className={cn("p-2 rounded-lg", stat.iconBg || "bg-blue-100")}>
                  {stat.icon}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ResponsiveTable;