import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Calendar, Download, History, BarChart3 } from 'lucide-react';

const QuickActionsMenu = ({ onExport, onViewHistory, onViewStats }) => {
  const actions = [
    {
      icon: Calendar,
      label: 'View Calendar',
      description: 'See monthly calendar',
      onClick: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
      color: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
    },
    {
      icon: History,
      label: 'Session History',
      description: 'View all sessions',
      onClick: onViewHistory,
      color: 'bg-green-50 hover:bg-green-100 text-green-700',
    },
    {
      icon: Download,
      label: 'Export Report',
      description: 'Download PDF',
      onClick: onExport,
      color: 'bg-purple-50 hover:bg-purple-100 text-purple-700',
    },
    {
      icon: BarChart3,
      label: 'Statistics',
      description: 'View analytics',
      onClick: onViewStats,
      color: 'bg-orange-50 hover:bg-orange-100 text-orange-700',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`h-auto flex-col items-start p-4 ${action.color}`}
              onClick={action.onClick}
            >
              <action.icon className="h-5 w-5 mb-2" />
              <div className="text-left">
                <div className="font-semibold text-sm">{action.label}</div>
                <div className="text-xs opacity-70">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsMenu;
