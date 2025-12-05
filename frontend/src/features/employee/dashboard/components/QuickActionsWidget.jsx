import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, DollarSign, User, Upload, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Button } from '../../../../components/ui/button'
import { Badge } from '../../../../components/ui/badge'

const QuickActionsWidget = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: Calendar,
      label: 'Apply Leave',
      description: 'Request time off',
      onClick: () => navigate('/employee/leave/apply'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      shortcut: 'Alt+L',
      key: 'l',
    },
    {
      icon: DollarSign,
      label: 'View Payslip',
      description: 'Check salary details',
      onClick: () => navigate('/employee/payslips'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      shortcut: 'Alt+P',
      key: 'p',
    },
    {
      icon: FileText,
      label: 'Submit Request',
      description: 'Reimbursement, advance',
      onClick: () => navigate('/employee/requests/new'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      shortcut: 'Alt+R',
      key: 'r',
    },
    {
      icon: User,
      label: 'Update Profile',
      description: 'Edit personal info',
      onClick: () => navigate('/employee/profile'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      shortcut: 'Alt+U',
      key: 'u',
    },
    {
      icon: Upload,
      label: 'Upload Document',
      description: 'Add certificates',
      onClick: () => navigate('/employee/documents'),
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      shortcut: 'Alt+D',
      key: 'd',
    },
    {
      icon: CreditCard,
      label: 'Bank Details',
      description: 'Update account info',
      onClick: () => navigate('/employee/bank-details'),
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      shortcut: 'Alt+B',
      key: 'b',
    },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey) {
        const action = quickActions.find(a => a.key === event.key.toLowerCase());
        if (action) {
          event.preventDefault();
          action.onClick();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto flex-col items-start p-4 hover:shadow-md transition-shadow relative group"
                onClick={action.onClick}
              >
                <div className={`p-2 rounded-lg ${action.bgColor} mb-2`}>
                  <IconComponent className={`h-5 w-5 ${action.color}`} />
                </div>
                <p className="font-medium text-sm">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
                {action.shortcut && (
                  <Badge 
                    variant="secondary" 
                    className="absolute top-2 right-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {action.shortcut}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsWidget;
