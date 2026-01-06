import { Link } from 'react-router-dom';
import { Bell, Search, Settings, User, LogOut, ChevronDown, HelpCircle, Mail, Menu } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '../../shared/ui/button';
import { Icon } from '../../shared/components';
import useAuth from '../hooks/useAuth';
import NotificationBell from '../../components/NotificationBell';

const Header = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.fullName) {
      const names = user.fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0].substring(0, 2).toUpperCase();
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  // Avatar color based on role
  const getAvatarColor = (role) => {
    switch (role) {
      case 'SuperAdmin':
        return 'bg-purple-600';
      case 'HR_Manager':
        return 'bg-blue-600';
      case 'HR':
        return 'bg-green-600';
      case 'Manager':
        return 'bg-orange-600';
      case 'Employee':
        return 'bg-gray-600';
      default:
        return 'bg-blue-600';
    }
  };

  // Role badge color
  const getRoleBadge = (role) => {
    const badges = {
      'SuperAdmin': 'bg-purple-100 text-purple-700',
      'HR_Manager': 'bg-blue-100 text-blue-700',
      'HR': 'bg-green-100 text-green-700',
      'Manager': 'bg-orange-100 text-orange-700',
      'Employee': 'bg-gray-100 text-gray-700',
    };
    return badges[role] || badges['Employee'];
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 w-full">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Mobile Menu + Search */}
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              {/* Help */}
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <Link to="/help">
                  <HelpCircle className="w-5 h-5" />
                </Link>
              </Button>

              {/* Notifications */}
              <NotificationBell />

              {/* Settings (Admin/Manager only) */}
              {(user?.role === 'SuperAdmin' || user?.role === 'HR_Manager') && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hidden sm:flex"
                >
                  <Link to="/admin/settings">
                    <Settings className="w-5 h-5" />
                  </Link>
                </Button>
              )}

              {/* Divider */}
              <div className="h-8 w-px bg-gray-200 mx-2"></div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-50 rounded-lg"
                >
                  {/* User Avatar with Initials */}
                  <div className={`w-9 h-9 ${getAvatarColor(user?.role)} rounded-lg flex items-center justify-center`}>
                    <span className="text-white font-medium text-sm">{getUserInitials()}</span>
                  </div>
                  
                  {/* User Info */}
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-medium text-gray-800">
                      {user?.fullName || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded inline-block ${getRoleBadge(user?.role)}`}>
                      {user?.role}
                    </div>
                  </div>
                  
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                    
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-lg border border-gray-200 shadow-lg py-2 z-20">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${getAvatarColor(user?.role)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white font-medium">{getUserInitials()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate">
                              {user?.fullName || 'User'}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {user?.email}
                            </div>
                            {user?.employeeNumber && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                ID: {user.employeeNumber}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded inline-block mt-2 ${getRoleBadge(user?.role)}`}>
                          {user?.role}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          to="employee/profile"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </Link>
                        
                        <Link
                          to="/notifications"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Mail className="w-4 h-4" />
                          <span>Messages</span>
                        </Link>
                        
                        {(user?.role === 'SuperAdmin' || user?.role === 'HR_Manager') && (
                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </Link>
                        )}

                        <Link
                          to="/help"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>Help & Support</span>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-200 pt-1 mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
