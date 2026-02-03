import { Link, useLocation } from 'react-router-dom';
import { Search, Settings, User, LogOut, ChevronDown, HelpCircle, Mail, Menu, Home, Calendar, Users, BarChart3, Clock, Plus, FileText, Shield, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '../../shared/ui/button';
import { Badge } from '../../shared/ui/badge';
import useAuth from '../hooks/useAuth';
import NotificationBell from '../../components/NotificationBell';

const Header = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const location = useLocation();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setShowUserMenu(false);
    setShowSearchResults(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  // Enhanced search functionality with categories
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.length > 0);
  };

  // Categorize search results for better organization
  const getCategorizedSearchResults = () => {
    if (!searchQuery) return [];

    const allItems = getQuickNavItems();
    const filteredItems = allItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group by categories
    const categories = {
      'Profile & Settings': [],
      'Attendance': [],
      'Leave Management': [],
      'Employee Management': [],
      'Calendar & Events': [],
      'System Administration': [],
      'Reports & Analytics': [],
      'Other': []
    };

    filteredItems.forEach(item => {
      if (item.name.toLowerCase().includes('profile') || item.name.toLowerCase().includes('settings') || item.name.toLowerCase().includes('account') || item.name.toLowerCase().includes('bank') || item.name.toLowerCase().includes('emergency')) {
        categories['Profile & Settings'].push(item);
      } else if (item.name.toLowerCase().includes('attendance') || item.name.toLowerCase().includes('shift')) {
        categories['Attendance'].push(item);
      } else if (item.name.toLowerCase().includes('leave')) {
        categories['Leave Management'].push(item);
      } else if (item.name.toLowerCase().includes('employee') || item.name.toLowerCase().includes('department') || item.name.toLowerCase().includes('designation') || item.name.toLowerCase().includes('user') || item.name.toLowerCase().includes('lead')) {
        categories['Employee Management'].push(item);
      } else if (item.name.toLowerCase().includes('calendar') || item.name.toLowerCase().includes('holiday') || item.name.toLowerCase().includes('announcement')) {
        categories['Calendar & Events'].push(item);
      } else if (item.name.toLowerCase().includes('system') || item.name.toLowerCase().includes('audit') || item.name.toLowerCase().includes('email') || item.name.toLowerCase().includes('policies') || item.name.toLowerCase().includes('documents')) {
        categories['System Administration'].push(item);
      } else if (item.name.toLowerCase().includes('report') || item.name.toLowerCase().includes('analytics')) {
        categories['Reports & Analytics'].push(item);
      } else {
        categories['Other'].push(item);
      }
    });

    // Filter out empty categories
    return Object.entries(categories).filter(([_, items]) => items.length > 0);
  };

  // Quick navigation items based on user role
  const getQuickNavItems = () => {
    const baseItems = [
      { name: 'Dashboard', path: '/dashboard', icon: Home },
    ];

    if (user?.role === 'Employee') {
      return [
        ...baseItems,
        { name: 'My Profile', path: '/employee/profile', icon: User },
        { name: 'My Attendance', path: '/employee/attendance', icon: Clock },
        { name: 'My Leaves', path: '/employee/leave', icon: Calendar },
        { name: 'My Calendar', path: '/employee/calendar', icon: Calendar },
        { name: 'Attendance Corrections', path: '/employee/attendance/corrections', icon: AlertCircle },
        { name: 'Bank Details', path: '/employee/bank-details', icon: Shield },
        { name: 'Emergency Contacts', path: '/employee/settings/emergency-contacts', icon: HelpCircle },
        { name: 'My Leads', path: '/employee/leads', icon: Users },
        { name: 'My Shifts', path: '/employee/shifts', icon: Clock },
      ];
    }

    if (user?.role === 'SuperAdmin') {
      return [
        ...baseItems,
        { name: 'User Management', path: '/admin/users', icon: Users },
        { name: 'Employee Management', path: '/admin/employees', icon: Users },
        { name: 'Department Management', path: '/admin/departments', icon: Users },
        { name: 'Designation Management', path: '/admin/designations', icon: Users },
        { name: 'Attendance Management', path: '/admin/attendance', icon: Clock },
        { name: 'Live Attendance', path: '/admin/attendance/live', icon: Clock },
        { name: 'Attendance Corrections', path: '/admin/attendance/corrections', icon: AlertCircle },
        { name: 'Leave Management', path: '/admin/leave', icon: Calendar },
        { name: 'Leave Balances', path: '/admin/leave-balances', icon: Calendar },
        { name: 'Leave Balance Rollover', path: '/admin/leave-balance-rollover', icon: Calendar },
        { name: 'Lead Management', path: '/admin/leads', icon: Users },
        { name: 'Shift Management', path: '/admin/shifts', icon: Clock },
        { name: 'Calendar Management', path: '/admin/calendar/management', icon: Calendar },
        { name: 'Smart Calendar', path: '/admin/calendar/smart', icon: Calendar },
        { name: 'Holiday Management', path: '/admin/calendar/calendarific', icon: Calendar },
        { name: 'Bank Verification', path: '/admin/bank-verification', icon: Shield },
        { name: 'Announcements', path: '/admin/announcements', icon: Mail },
        { name: 'Company Policies', path: '/admin/policies', icon: FileText },
        { name: 'Company Documents', path: '/admin/documents', icon: FileText },
        { name: 'System Settings', path: '/admin/settings', icon: Settings },
        { name: 'System Policies', path: '/admin/system-policies', icon: Settings },
        { name: 'Audit Logs', path: '/admin/audit-logs', icon: BarChart3 },
        { name: 'Email Testing', path: '/admin/email-testing', icon: Mail },
      ];
    }

    if (['HR_Manager', 'HR'].includes(user?.role)) {
      return [
        ...baseItems,
        { name: 'Employee Management', path: '/admin/employees', icon: Users },
        { name: 'Add New Employee', path: '/admin/employees/new', icon: Plus },
        { name: 'Department Management', path: '/admin/departments', icon: Users },
        { name: 'Designation Management', path: '/admin/designations', icon: Users },
        { name: 'Attendance Management', path: '/admin/attendance', icon: Clock },
        { name: 'Live Attendance', path: '/admin/attendance/live', icon: Clock },
        { name: 'Attendance Corrections', path: '/admin/attendance/corrections', icon: AlertCircle },
        { name: 'Leave Management', path: '/admin/leave', icon: Calendar },
        { name: 'Leave Balances', path: '/admin/leave-balances', icon: Calendar },
        { name: 'Lead Management', path: '/admin/leads', icon: Users },
        { name: 'Shift Management', path: '/admin/shifts', icon: Clock },
        { name: 'Calendar Management', path: '/admin/calendar/management', icon: Calendar },
        { name: 'Smart Calendar', path: '/admin/calendar/smart', icon: Calendar },
        { name: 'Holiday Management', path: '/admin/calendar/calendarific', icon: Calendar },
        { name: 'Bank Verification', path: '/admin/bank-verification', icon: Shield },
        { name: 'Announcements', path: '/admin/announcements', icon: Mail },
        { name: 'Company Policies', path: '/admin/policies', icon: FileText },
        { name: 'Company Documents', path: '/admin/documents', icon: FileText },
      ];
    }

    if (user?.role === 'Manager') {
      return [
        ...baseItems,
        { name: 'My Profile', path: '/employee/profile', icon: User },
        { name: 'My Attendance', path: '/employee/attendance', icon: Clock },
        { name: 'My Leaves', path: '/employee/leave', icon: Calendar },
        { name: 'My Calendar', path: '/employee/calendar', icon: Calendar },
        { name: 'Team Management', path: '/manager/team', icon: Users },
        { name: 'Team Attendance', path: '/manager/attendance', icon: Clock },
        { name: 'Team Leaves', path: '/manager/leaves', icon: Calendar },
      ];
    }

    return baseItems;
  };

  const quickNavItems = getQuickNavItems();
  const categorizedResults = getCategorizedSearchResults();

  // Filter search results (fallback for simple display)
  const searchResults = quickNavItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        return 'bg-gradient-to-br from-purple-600 to-purple-700';
      case 'HR_Manager':
        return 'bg-gradient-to-br from-blue-600 to-blue-700';
      case 'HR':
        return 'bg-gradient-to-br from-green-600 to-green-700';
      case 'Manager':
        return 'bg-gradient-to-br from-orange-600 to-orange-700';
      case 'Employee':
        return 'bg-gradient-to-br from-gray-600 to-gray-700';
      default:
        return 'bg-gradient-to-br from-blue-600 to-blue-700';
    }
  };

  // Role badge color
  const getRoleBadge = (role) => {
    const badges = {
      'SuperAdmin': 'bg-purple-100 text-purple-800 border-purple-200',
      'HR_Manager': 'bg-blue-100 text-blue-800 border-blue-200',
      'HR': 'bg-green-100 text-green-800 border-green-200',
      'Manager': 'bg-orange-100 text-orange-800 border-orange-200',
      'Employee': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return badges[role] || badges['Employee'];
  };

  // Get current time
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="px-4 sm:px-6 w-full">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Mobile Menu + Search */}
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Search with Enhanced Functionality */}
            <div className="flex-1 max-w-xl relative" ref={searchRef}>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pages, employees, or features..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                />
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && (categorizedResults.length > 0 || searchResults.length > 0) && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSearchResults(false)}
                  ></div>
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg py-2 z-20 max-h-80 overflow-y-auto">
                    {categorizedResults.length > 0 ? (
                      // Categorized results
                      categorizedResults.map(([categoryName, items]) => (
                        <div key={categoryName} className="mb-2 last:mb-0">
                          <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                            {categoryName}
                          </div>
                          {items.map((item) => {
                            const IconComponent = item.icon;
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => {
                                  setShowSearchResults(false);
                                  setSearchQuery('');
                                }}
                              >
                                <IconComponent className="w-4 h-4 text-gray-400" />
                                <span>{item.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      ))
                    ) : (
                      // Simple results fallback
                      <>
                        <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Quick Navigation
                        </div>
                        {searchResults.map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => {
                                setShowSearchResults(false);
                                setSearchQuery('');
                              }}
                            >
                              <IconComponent className="w-4 h-4 text-gray-400" />
                              <span>{item.name}</span>
                            </Link>
                          );
                        })}
                      </>
                    )}
                    
                    {/* No results message */}
                    {categorizedResults.length === 0 && searchResults.length === 0 && (
                      <div className="px-3 py-4 text-center text-gray-500 text-sm">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center Section - Current Time (Desktop only) */}
          <div className="hidden xl:flex items-center px-4">
            <div className="text-sm text-gray-600 font-medium">
              {currentTime}
            </div>
          </div>

          {/* Right Section - Actions */}
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              {/* Help - Only for Employees */}
              {user?.role === 'Employee' && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hover:bg-gray-100"
                >
                  <Link to="/help">
                    <HelpCircle className="w-4 h-4" />
                  </Link>
                </Button>
              )}

              {/* Notifications */}
              <NotificationBell />

              {/* Settings (Admin/Manager only) */}
              {(user?.role === 'SuperAdmin' || user?.role === 'HR_Manager') && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hidden sm:flex hover:bg-gray-100"
                >
                  <Link to="/admin/settings">
                    <Settings className="w-4 h-4" />
                  </Link>
                </Button>
              )}

              {/* Divider */}
              <div className="h-8 w-px bg-gray-200 mx-2"></div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {/* User Avatar with Initials */}
                  <div className={`w-8 h-8 ${getAvatarColor(user?.role)} rounded-lg flex items-center justify-center shadow-sm`}>
                    <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
                  </div>
                  
                  {/* User Info */}
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.fullName || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <Badge variant="secondary" className={`text-xs ${getRoleBadge(user?.role)} border`}>
                      {user?.role?.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Enhanced Dropdown Menu */}
                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                    
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl py-2 z-20">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${getAvatarColor(user?.role)} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {user?.fullName || 'User'}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {user?.email}
                            </div>
                            {user?.employeeNumber && (
                              <div className="text-xs text-gray-400 mt-1">
                                ID: {user.employeeNumber}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className={`text-xs mt-2 ${getRoleBadge(user?.role)} border`}>
                          {user?.role?.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {/* Profile - Only show for employees or users with employee records */}
                        {(user?.role === 'Employee' || user?.employeeNumber) ? (
                          <Link
                            to="/employee/profile"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="w-4 h-4 text-gray-400" />
                            <span>My Profile</span>
                          </Link>
                        ) : (
                          // Account Settings for admin users without employee profiles
                          <Link
                            to="/admin/account"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="w-4 h-4 text-gray-400" />
                            <span>Account Settings</span>
                          </Link>
                        )}
                        
                        <Link
                          to="/notifications"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>Messages</span>
                        </Link>
                        
                        {/* System Settings - Only for SuperAdmin and HR_Manager */}
                        {(user?.role === 'SuperAdmin' || user?.role === 'HR_Manager') && (
                          <Link
                            to="/admin/settings"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="w-4 h-4 text-gray-400" />
                            <span>System Settings</span>
                          </Link>
                        )}

                        {/* User Management - Only for SuperAdmin */}
                        {user?.role === 'SuperAdmin' && (
                          <Link
                            to="/admin/users"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>User Management</span>
                          </Link>
                        )}

                        <Link
                          to="/help"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <HelpCircle className="w-4 h-4 text-gray-400" />
                          <span>Help & Support</span>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 pt-2 mt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
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
