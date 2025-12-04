import { Link, useLocation } from 'react-router-dom';
import { Bell, Search, Settings, User, LogOut, ChevronDown, HelpCircle, Menu, Palmtree, DollarSign, Megaphone } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Icon } from '../common';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Sample notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'leave',
      title: 'Leave Request Approved',
      message: 'Your leave request for Dec 10-12 has been approved',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'payroll',
      title: 'Payslip Available',
      message: 'Your November payslip is now available',
      time: '1 day ago',
      read: false,
    },
    {
      id: 3,
      type: 'announcement',
      title: 'Company Holiday',
      message: 'Office will be closed on Dec 25th',
      time: '2 days ago',
      read: true,
    },
  ]);

  const notificationCount = notifications.filter(n => !n.read).length;

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'leave':
        return <Palmtree className={`${iconClass} text-blue-600`} />;
      case 'payroll':
        return <DollarSign className={`${iconClass} text-green-600`} />;
      case 'announcement':
        return <Megaphone className={`${iconClass} text-orange-600`} />;
      default:
        return <Bell className={`${iconClass} text-gray-600`} />;
    }
  };

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

  const getAvatarColor = (role) => {
    switch (role) {
      case 'SuperAdmin':
        return 'bg-purple-600';
      case 'HR Manager':
        return 'bg-blue-600';
      case 'HR Administrator':
        return 'bg-green-600';
      case 'Manager':
        return 'bg-orange-600';
      case 'Employee':
        return 'bg-gray-600';
      default:
        return 'bg-blue-600';
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      'SuperAdmin': 'bg-purple-100 text-purple-700',
      'HR Manager': 'bg-blue-100 text-blue-700',
      'HR Administrator': 'bg-green-100 text-green-700',
      'Manager': 'bg-orange-100 text-orange-700',
      'Employee': 'bg-gray-100 text-gray-700',
    };
    return badges[role] || badges['Employee'];
  };



  // Navigation structure with role-based access
  const allNavItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      roles: ['Employee', 'HR Administrator', 'HR Manager', 'SuperAdmin'],
    },
    {
      name: 'My Services',
      icon: 'User',
      roles: ['Employee', 'HR Administrator', 'HR Manager', 'SuperAdmin'],
      dropdown: [
        { name: 'My Profile', path: '/profile', icon: 'User' },
        { name: 'Bank Details', path: '/bank-details', icon: 'Banknote' },
        { name: 'My Payslips', path: '/payslips', icon: 'Receipt' },
        { name: 'Leave', path: '/leave', icon: 'CalendarDays' },
        { name: 'Attendance', path: '/attendance', icon: 'Clock' },
        { name: 'My Documents', path: '/documents', icon: 'FileText' },
        { name: 'My Requests', path: '/requests', icon: 'FileSignature' },
      ],
    },
    {
      name: 'Calendar',
      icon: 'Calendar',
      roles: ['Employee', 'HR Administrator', 'HR Manager', 'SuperAdmin'],
      dropdown: [
        { name: 'Calendar Overview', path: '/calendar', icon: 'CalendarRange' },
        { name: 'Daily View', path: '/calendar/daily', icon: 'CalendarCheck' },
        { name: 'Monthly View', path: '/calendar/monthly', icon: 'Calendar' },
      ],
    },
    {
      name: 'Manager',
      icon: 'Users',
      roles: ['HR Manager', 'SuperAdmin'],
      dropdown: [
        { name: 'Approvals', path: '/manager/approvals', icon: 'CheckSquare' },
        { name: 'My Team', path: '/manager/team', icon: 'Users' },
        { name: 'Reports', path: '/manager/reports', icon: 'BarChart3' },
      ],
    },
    {
      name: 'HR Admin',
      icon: 'Settings',
      roles: ['HR Administrator', 'HR Manager', 'SuperAdmin'],
      dropdown: [
        { name: 'Attendance Admin', path: '/admin/attendance', icon: 'Clock4' },
        { name: 'Leave Approvals', path: '/admin/leave-requests', icon: 'ClipboardCheck' },
        { name: 'Departments', path: '/hr/departments', icon: 'Building2' },
        { name: 'Designations', path: '/hr/designations', icon: 'Briefcase' },
        { name: 'Policies', path: '/hr/policies', icon: 'ScrollText' },
        { name: 'Holidays', path: '/hr/holidays', icon: 'PartyPopper' },
        { name: 'Company Docs', path: '/hr/documents', icon: 'Folder' },
      ],
    },
    {
      name: 'Payroll',
      icon: 'DollarSign',
      roles: ['SuperAdmin'],
      dropdown: [
        { name: 'Payroll Dashboard', path: '/payroll', icon: 'Wallet' },
        { name: 'Employees', path: '/payroll/employees', icon: 'UserCheck' },
        { name: 'Structures', path: '/payroll/structures', icon: 'Layers' },
        { name: 'Payslips', path: '/payroll/payslips', icon: 'FileSpreadsheet' },
      ],
    },
    {
      name: 'Admin',
      icon: 'Shield',
      roles: ['SuperAdmin'],
      dropdown: [
        { name: 'User Management', path: '/users', icon: 'UserCog' },
        { name: 'System Settings', path: '/settings', icon: 'Settings' },
        { name: 'Audit Logs', path: '/admin/logs', icon: 'ListChecks' },
      ],
    },
  ];

  // Filter navigation based on user role
  const userRole = user?.role;
  const navItems = allNavItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-lg">HR</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-base font-semibold text-gray-800">HRM System</div>
              <div className="text-xs text-gray-500 -mt-0.5">Management</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                item.dropdown ? (
                  <div key={item.name} className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <Icon name={item.icon} />
                      <span>{item.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === item.name ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {openDropdown === item.name && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)}></div>
                        <div className="absolute left-0 mt-1 w-56 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-20">
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              className={`flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 ${
                                isActive(subItem.path) ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                              }`}
                              onClick={() => setOpenDropdown(null)}
                            >
                              <Icon name={subItem.icon} />
                              <span>{subItem.name}</span>
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon name={item.icon} />
                    <span>{item.name}</span>
                  </Link>
                )
              ))}
            </div>
          )}

          {/* Right Section */}
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Help */}
              <Button variant="ghost" size="sm" asChild>
                <Link to="/help">
                  <HelpCircle className="w-5 h-5" />
                </Link>
              </Button>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Button>

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
                      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                        {notificationCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-700">
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500 text-sm">No notifications</div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                !notification.read ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-sm font-medium text-gray-800">{notification.title}</h4>
                                    {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-400">{notification.time}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                      }}
                                      className="text-xs text-red-600 hover:text-red-700"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="px-4 py-3 border-t border-gray-200">
                        <Link
                          to="/notifications"
                          className="text-sm text-blue-600 hover:text-blue-700 block text-center"
                          onClick={() => setShowNotifications(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Settings */}
              {(user?.role === 'SuperAdmin' || user?.role === 'HR Manager') && (
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                  <Link to="/settings">
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
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-lg"
                >
                  <div className={`w-9 h-9 ${getAvatarColor(user?.role)} rounded-lg flex items-center justify-center`}>
                    <span className="text-white font-medium text-sm">{getUserInitials()}</span>
                  </div>
                  <div className="hidden xl:block text-left">
                    <div className="text-sm font-medium text-gray-800">
                      {user?.fullName || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded inline-block ${getRoleBadge(user?.role)}`}>
                      {user?.role}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg py-2 z-20">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${getAvatarColor(user?.role)} rounded-lg flex items-center justify-center`}>
                            <span className="text-white font-medium">{getUserInitials()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate">{user?.fullName || 'User'}</div>
                            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                            {user?.employeeNumber && (
                              <div className="text-xs text-gray-400 mt-0.5">ID: {user.employeeNumber}</div>
                            )}
                          </div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded inline-block mt-2 ${getRoleBadge(user?.role)}`}>
                          {user?.role}
                        </div>
                      </div>
                      <div className="py-1">
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </Link>
                        {(user?.role === 'SuperAdmin' || user?.role === 'HR Manager') && (
                          <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </Link>
                        )}
                        <Link to="/help" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                          <HelpCircle className="w-4 h-4" />
                          <span>Help & Support</span>
                        </Link>
                      </div>
                      <div className="border-t border-gray-200 pt-1 mt-1">
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && isAuthenticated && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              item.dropdown ? (
                <div key={item.name}>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Icon name={item.icon} />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === item.name ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === item.name && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${
                            isActive(subItem.path) ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            setOpenDropdown(null);
                            setShowMobileMenu(false);
                          }}
                        >
                          <Icon name={subItem.icon} />
                          <span>{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
                    isActive(item.path) ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Icon name={item.icon} />
                  <span>{item.name}</span>
                </Link>
              )
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
