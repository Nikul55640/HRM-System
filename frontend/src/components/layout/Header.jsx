import { Link } from 'react-router-dom';
import { Bell, Search, Settings, User, LogOut, ChevronDown, HelpCircle, Mail } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import useAuth from '../../hooks/useAuth';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notificationCount] = useState(3);
  const userMenuRef = useRef(null);

  // Close dropdown when clicking outside
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

  // Avatar gradient based on role
  const getAvatarGradient = (role) => {
    switch (role) {
      case 'SuperAdmin':
        return 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700';
      case 'HR Manager':
        return 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700';
      case 'HR Administrator':
        return 'bg-gradient-to-br from-green-500 via-green-600 to-green-700';
      case 'Manager':
        return 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700';
      case 'Employee':
        return 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700';
      default:
        return 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700';
    }
  };

  // Role badge with gradient
  const getRoleBadge = (role) => {
    const badges = {
      'SuperAdmin': 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm',
      'HR Manager': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm',
      'HR Administrator': 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm',
      'Manager': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm',
      'Employee': 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-sm',
    };
    return badges[role] || badges['Employee'];
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Logo/Title */}
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg">HR</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  HRM System
                </div>
                <div className="text-xs text-gray-500 -mt-1">Human Resource Management</div>
              </div>
            </Link>
          </div>

          {/* Center Section - Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search employees, documents, or anything..."
                className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {/* Right Section - Actions */}
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              {/* Help */}
              <Link
                to="/help"
                className="relative p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
                title="Help & Support"
              >
                <HelpCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>

              {/* Notifications */}
              <Link
                to="/notifications"
                className="relative p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
                title="Notifications"
              >
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-semibold shadow-lg animate-pulse">
                    {notificationCount}
                  </span>
                )}
              </Link>

              {/* Settings (Admin/Manager only) */}
              {(user?.role === 'SuperAdmin' || user?.role === 'HR Manager') && (
                <Link
                  to="/settings"
                  className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hidden sm:block group"
                  title="Settings"
                >
                  <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                </Link>
              )}

              {/* Divider */}
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-2"></div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                >
                  {/* User Avatar with Initials */}
                  <div className={`w-10 h-10 ${getAvatarGradient(user?.role)} rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105`}>
                    <span className="text-white font-bold text-sm">{getUserInitials()}</span>
                  </div>
                  
                  {/* User Info */}
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-semibold text-gray-900 leading-tight">
                      {user?.fullName || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded-md inline-block mt-0.5 ${getRoleBadge(user?.role)}`}>
                      {user?.role}
                    </div>
                  </div>
                  
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
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
                    <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-20">
                      {/* User Info Header */}
                      <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 ${getAvatarGradient(user?.role)} rounded-xl flex items-center justify-center shadow-md`}>
                            <span className="text-white font-bold text-lg">{getUserInitials()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
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
                        <div className={`text-xs px-3 py-1 rounded-lg inline-block mt-3 ${getRoleBadge(user?.role)}`}>
                          {user?.role}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">My Profile</span>
                        </Link>
                        
                        <Link
                          to="/notifications"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">Messages</span>
                          {notificationCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {notificationCount}
                            </span>
                          )}
                        </Link>
                        
                        {(user?.role === 'SuperAdmin' || user?.role === 'HR Manager') && (
                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                            <span className="font-medium">Settings</span>
                          </Link>
                        )}

                        <Link
                          to="/help"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">Help & Support</span>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 pt-2 mt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors group font-medium"
                        >
                          <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
