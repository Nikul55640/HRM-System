import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Users, LogOut } from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';
import { toast } from 'react-toastify';

const UserSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { login, logout } = useAuthStore();
  const navigate = useNavigate();

  const testUsers = [
    {
      email: 'superadmin@hrm.com',
      password: 'Admin@123',
      role: 'SuperAdmin',
      label: '👑 Super Admin',
    },
    {
      email: 'hradmin@hrm.com',
      password: 'Admin@123',
      role: 'HR Administrator',
      label: '👔 HR Admin',
    },
    {
      email: 'hrmanager@hrm.com',
      password: 'Manager@123',
      role: 'HR Manager',
      label: '👨‍💼 HR Manager',
    },
    {
      email: 'employee@hrm.com',
      password: 'Employee@123',
      role: 'Employee',
      label: '👤 Employee',
    },
  ];

  const handleSwitch = async (user) => {
    try {
      console.log('🔄 Switching to:', user.email);
      
      // Logout current user
      logout();
      
      // Login as new user
      await login(user.email, user.password);
      
      toast.success(`Switched to ${user.label}`);
      
      // Redirect based on role
      if (user.role === 'SuperAdmin' || user.role === 'HR Administrator') {
        navigate('/dashboard');
      } else if (user.role === 'HR Manager') {
        navigate('/manager/team');
      } else {
        navigate('/profile');
      }
      
      setIsOpen(false);
      
      // Reload to ensure clean state
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('Switch failed:', error);
      toast.error('Failed to switch user');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg"
          title="Quick User Switch (Testing)"
        >
          <Users className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-80 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Quick Switch User</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-2">
              {testUsers.map((user) => (
                <Button
                  key={user.email}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleSwitch(user)}
                >
                  <span className="mr-2">{user.label}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {user.email}
                  </span>
                </Button>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                🧪 Testing Mode - Quick user switching
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserSwitcher;