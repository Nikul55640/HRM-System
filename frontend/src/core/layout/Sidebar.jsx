import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { Button } from "../../shared/ui/button";
import { Icon } from "../../shared/components";
import useAuth from "../hooks/useAuth";
import { usePermissions } from "../hooks";
import { MODULES } from "../utils/rolePermissions";
import { X } from "lucide-react";

const Sidebar = ({ setLayoutSidebarExpanded, mobileMenuOpen, setMobileMenuOpen }) => {
  // ===================================================
  // STATE MANAGEMENT
  // ===================================================
  const [openSections, setOpenSections] = useState(["Overview", "My Workspace"]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  
  // ===================================================
  // CONSTANTS
  // ===================================================
  const DEFAULT_OPEN_SECTIONS = ["Overview", "My Workspace"];
  
  // ===================================================
  // HOOKS
  // ===================================================
  const location = useLocation();
  const { user } = useAuth();
  const { can } = usePermissions();

  // ===================================================
  // EFFECTS
  // ===================================================
  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, setMobileMenuOpen]);

  // Handle escape key and body scroll for mobile menu
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen, setMobileMenuOpen]);

  // ===================================================
  // UTILITY FUNCTIONS
  // ===================================================
  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const toggleSection = (section) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  // ===================================================
  // NAVIGATION CONFIGURATION
  // ===================================================
  const allNavItems = [
    // 1️⃣ OVERVIEW - Always visible
    {
      section: "Overview",
      icon: "LayoutDashboard",
      collapsible: true,
      showIf: () => true,
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: "LayoutDashboard",
          showIf: () => true,
        },
        {
          name: "Notifications",
          path: "/notifications",
          icon: "Bell",
          showIf: () => user?.role === "Employee" && can.do(MODULES.EMPLOYEE.VIEW_OWN),
        },
      ],
    },

    // 2️⃣ MY WORKSPACE - Employee-focused
    {
      section: "My Workspace",
      icon: "User",
      collapsible: true,
      showIf: () => user?.role === "Employee",
      items: [
        {
          name: "Profile",
          path: "/employee/profile",
          icon: "User",
          showIf: () => user?.role === "Employee" && can.do(MODULES.EMPLOYEE.VIEW_OWN),
        },
        {
          name: "Bank Details",
          path: "/employee/bank-details",
          icon: "Banknote",
          showIf: () => user?.role === "Employee" && can.do(MODULES.EMPLOYEE.VIEW_OWN),
        },
        {
          name: "Attendance",
          path: "/employee/attendance",
          icon: "Clock",
          showIf: () => user?.role === "Employee" && can.do(MODULES.ATTENDANCE.VIEW_OWN),
        },
        {
          name: "Attendance Corrections",
          path: "/employee/attendance/corrections",
          icon: "ClipboardEdit",
          showIf: () => user?.role === "Employee" && can.do(MODULES.ATTENDANCE.VIEW_OWN),
        },
        {
          name: "Leave",
          path: "/employee/leave",
          icon: "CalendarDays",
          showIf: () => user?.role === "Employee" && can.do(MODULES.LEAVE.VIEW_OWN),
        },
        {
          name: "Leads",
          path: "/employee/leads",
          icon: "Target",
          showIf: () => user?.role === "Employee" && can.do(MODULES.LEAD.VIEW_OWN),
        },
        {
          name: "Shifts",
          path: "/employee/shifts",
          icon: "Calendar",
          showIf: () => user?.role === "Employee" && can.do(MODULES.ATTENDANCE.VIEW_OWN),
        },
        {
          name: "Calendar",
          path: "/employee/calendar",
          icon: "CalendarRange",
          showIf: () => user?.role === "Employee" && can.do(MODULES.CALENDAR.VIEW_OWN),
        },
      ],
    },

    // 3️⃣ EMPLOYEE SETTINGS
    {
      section: "Settings",
      icon: "Settings",
      collapsible: true,
      showIf: () => user?.role === "Employee",
      items: [
        {
          name: "Profile",
          path: "/employee/settings/profile",
          icon: "User",
          showIf: () => user?.role === "Employee" && can.do(MODULES.EMPLOYEE.VIEW_OWN),
        },
        {
          name: "Security",
          path: "/employee/settings/security",
          icon: "Shield",
          showIf: () => user?.role === "Employee" && can.do(MODULES.EMPLOYEE.VIEW_OWN),
        },
        {
          name: "Emergency Contacts",
          path: "/employee/settings/emergency-contacts",
          icon: "Phone",
          showIf: () => user?.role === "Employee" && can.do(MODULES.EMPLOYEE.VIEW_OWN),
        },
      ]
    },

    // 4️⃣ REQUESTS & APPROVALS - Clear intent
    {
      section: "Requests & Approvals",
      icon: "ClipboardCheck",
      collapsible: true,
      showIf: () =>
        (user?.role === "HR" || user?.role === "HR_Manager" || user?.role === "SuperAdmin") &&
        can.doAny([
          MODULES.ATTENDANCE.APPROVE_CORRECTION,
          MODULES.LEAVE.APPROVE_ANY,
        ]),
      items: [
        {
          name: "Attendance Corrections",
          path: "/admin/attendance/corrections",
          icon: "ClipboardEdit",
          showIf: () => can.do(MODULES.ATTENDANCE.APPROVE_CORRECTION),
        },
        {
          name: "Leave Requests",
          path: "/admin/leave",
          icon: "FileText",
          showIf: () => can.doAny([MODULES.LEAVE.APPROVE_ANY, MODULES.LEAVE.VIEW_ALL]),
        },
      ],
    },

    // 5️⃣ ATTENDANCE & TIME - One clear place
    {
      section: "Attendance & Time",
      icon: "Clock",
      collapsible: true,
      showIf: () =>
        (user?.role === "HR" || user?.role === "HR_Manager" || user?.role === "SuperAdmin") &&
        can.doAny([MODULES.ATTENDANCE.VIEW_ALL, MODULES.ATTENDANCE.EDIT_ANY]),
      items: [
        {
          name: "Attendance Overview",
          path: "/admin/attendance",
          icon: "Clock4",
          showIf: () => can.doAny([MODULES.ATTENDANCE.VIEW_ALL, MODULES.ATTENDANCE.EDIT_ANY]),
        },
        {
          name: "Live Attendance",
          path: "/admin/attendance/live",
          icon: "Activity",
          showIf: () => can.doAny([MODULES.ATTENDANCE.VIEW_ALL, MODULES.ATTENDANCE.EDIT_ANY]),
        },
        {
          name: "Shift Management",
          path: "/admin/shifts",
          icon: "Clock",
          showIf: () => can.do(MODULES.ATTENDANCE.MANAGE_SHIFTS),
        },
      ],
    },

    // 6️⃣ LEAVE & HOLIDAYS - Reduces duplication
    {
      section: "Leave & Holidays",
      icon: "CalendarDays",
      collapsible: true,
      showIf: () =>
        (user?.role === "HR" || user?.role === "HR_Manager" || user?.role === "SuperAdmin") &&
        can.doAny([
          MODULES.LEAVE.VIEW_ALL,
          MODULES.LEAVE.MANAGE_BALANCE,
          MODULES.CALENDAR.MANAGE_HOLIDAYS,
        ]),
      items: [
        {
          name: "Leave Balances",
          path: "/admin/leave-balances",
          icon: "Scale",
          showIf: () => can.do(MODULES.LEAVE.MANAGE_BALANCE),
        },
        {
          name: "Rollover",
          path: "/admin/leave-balance-rollover",
          icon: "RefreshCw",
          showIf: () => user?.role === "SuperAdmin" && can.do(MODULES.LEAVE.MANAGE_BALANCE),
        },
        {
          name: "Holiday Management",
          path: "/admin/calendar/management",
          icon: "CalendarCog",
          showIf: () => can.doAny([MODULES.CALENDAR.MANAGE_EVENTS, MODULES.CALENDAR.MANAGE_HOLIDAYS]),
        },
        {
          name: "Smart Calendar",
          path: "/admin/calendar/smart",
          icon: "Settings",
          showIf: () => can.doAny([
            MODULES.CALENDAR.MANAGE_SMART_CALENDAR, 
            MODULES.CALENDAR.VIEW_SMART_CALENDAR, 
            MODULES.CALENDAR.MANAGE_EVENTS, 
            MODULES.CALENDAR.MANAGE_HOLIDAYS
          ]),
        },
        {
          name: "Holiday Sync",
          path: "/admin/calendar/calendarific",
          icon: "Globe2",
          showIf: () => can.doAny([MODULES.CALENDAR.MANAGE_HOLIDAYS, MODULES.SYSTEM.MANAGE_CONFIG]),
        },
      ],
    },

    // 7️⃣ PEOPLE - HR mental model
    {
      section: "People",
      icon: "Users",
      collapsible: true,
      showIf: () =>
        (user?.role === "HR" || user?.role === "HR_Manager" || user?.role === "SuperAdmin") &&
        can.doAny([
          MODULES.EMPLOYEE.VIEW_ALL,
          MODULES.DEPARTMENT.VIEW,
        ]),
      items: [
        {
          name: "Employees",
          path: "/admin/employees",
          icon: "Users",
          showIf: () => can.do(MODULES.EMPLOYEE.VIEW_ALL),
        },
        {
          name: "Departments",
          path: "/admin/departments",
          icon: "Building2",
          showIf: () => can.doAny([MODULES.DEPARTMENT.VIEW, MODULES.DEPARTMENT.CREATE]),
        },
        {
          name: "Designations",
          path: "/admin/designations",
          icon: "Award",
          showIf: () => can.doAny([MODULES.EMPLOYEE.VIEW_ALL, MODULES.EMPLOYEE.UPDATE_ANY]),
        },
        {
          name: "Bank Verification",
          path: "/admin/bank-verification",
          icon: "Banknote",
          showIf: () => can.doAny([MODULES.EMPLOYEE.VIEW_ALL, MODULES.EMPLOYEE.UPDATE_ANY]),
        },
        {
          name: "Lead Management",
          path: "/admin/leads",
          icon: "Target",
          showIf: () => can.doAny([MODULES.LEAD.CREATE, MODULES.LEAD.MANAGE]),
        },
      ],
    },

    // 8️⃣ ORGANIZATION - Company-wide assets
    {
      section: "Organization",
      icon: "Building2",
      collapsible: true,
      showIf: () =>
        (user?.role === "HR" || user?.role === "HR_Manager" || user?.role === "SuperAdmin") &&
        can.doAny([
          MODULES.SYSTEM.VIEW_CONFIG,
          MODULES.ANNOUNCEMENT.VIEW,
        ]),
      items: [
        {
          name: "Policies",
          path: "/admin/policies",
          icon: "FileText",
          showIf: () => can.doAny([MODULES.SYSTEM.MANAGE_CONFIG, MODULES.SYSTEM.VIEW_CONFIG]),
        },
        {
          name: "Documents",
          path: "/admin/documents",
          icon: "Folder",
          showIf: () => can.doAny([MODULES.SYSTEM.MANAGE_CONFIG, MODULES.SYSTEM.VIEW_CONFIG]),
        },
        {
          name: "Announcements",
          path: "/admin/announcements",
          icon: "Megaphone",
          showIf: () => can.doAny([MODULES.ANNOUNCEMENT.VIEW, MODULES.ANNOUNCEMENT.CREATE]),
        },
      ],
    },

    // 9️⃣ SYSTEM - Danger zone
    {
      section: "System",
      icon: "Shield",
      collapsible: true,
      showIf: () =>
        user?.role === "SuperAdmin" &&
        can.doAny([
          MODULES.USER.VIEW,
          MODULES.SYSTEM.VIEW_CONFIG,
          MODULES.SYSTEM.VIEW_AUDIT_LOGS,
        ]),
      items: [
        {
          name: "Users & Roles",
          path: "/admin/users",
          icon: "UserCog",
          showIf: () => can.do(MODULES.USER.VIEW),
        },
        {
          name: "System Settings",
          path: "/admin/system-policies",
          icon: "Settings",
          showIf: () => can.do(MODULES.SYSTEM.MANAGE_CONFIG),
        },
        {
          name: "Audit Logs",
          path: "/admin/audit-logs",
          icon: "ListChecks",
          showIf: () => can.do(MODULES.SYSTEM.VIEW_AUDIT_LOGS),
        },
      ],
    },
  ];

  // ===================================================
  // NAVIGATION PROCESSING
  // ===================================================
  // Filter navigation based on permissions
  const nav = allNavItems
    .filter((section) => {
      if (section.showIf && typeof section.showIf === "function") {
        return section.showIf();
      }
      return true;
    })
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.showIf && typeof item.showIf === "function") {
          return item.showIf();
        }
        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);

  // Badge logic removed - not currently used in navigation items

  // ===================================================
  // COMPONENT HELPERS
  // ===================================================
  const SidebarHeader = ({ isMobile = false }) => (
    <div className="p-3 border-b border-gray-200 flex items-center justify-between">
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(false)}
          className="p-1"
        >
          <X className="w-4 h-4" />
        </Button>
      )}

      <div className={`flex items-center gap-2 p-0 ${isMobile ? 'flex-1 justify-center' : ''}`}>
        <div className="w-8 h-8 m-1 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-semibold text-xs">HR</span>
        </div>
        {(isMobile || isSidebarExpanded) && (
          <div className="p-0.5" >
            <h1 className="text-sm  font-semibold text-gray-800">HRM System</h1>
            <p className="text-xs text-gray-500">Management</p>
          </div>
        )}
      </div>
      {/* Toggle button removed - using hover-only behavior */}
    </div>
  );

  const SidebarFooter = () => (
    <div className="p-3 border-t border-gray-200">
      <div className="text-xs text-gray-500 text-center">
        <div className="font-medium text-gray-700">HRM System v1.0</div>
        <div className="mt-1">© 2025</div>
      </div>
    </div>
  );

  const NavigationItem = ({ item, isMobile = false }) => (
    <Link
      to={item.path}
      onClick={handleNavClick}
      className={`w-full flex items-center py-1.5 rounded-lg text-sm transition-colors ${
        (isMobile || isSidebarExpanded)
          ? "gap-2 px-2 justify-start"
          : "justify-center"
      } ${
        isActive(item.path)
          ? "bg-blue-50 text-blue-700 font-medium"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Icon name={item.icon} className="w-4 h-4 flex-shrink-0" />
      {(isMobile || isSidebarExpanded) && (
        <span className="flex-1">{item.name}</span>
      )}
    </Link>
  );

  // ===================================================
  // RENDER
  // ===================================================
  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 
          flex flex-col transition-transform duration-300 z-50 lg:hidden
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarHeader isMobile={true} />

        {/* Mobile Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="mt-2 px-2 space-y-1">
            {nav.map((group) => (
              <div key={group.section}>
                {/* Section Header */}
                {group.collapsible ? (
                  <button
                    onClick={() => toggleSection(group.section)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      openSections.includes(group.section)
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon name={group.icon} className="w-4 h-4" />
                    <span className="flex-1 text-left">{group.section}</span>
                    <Icon
                      name="ChevronDown"
                      className={`w-3 h-3 transition-transform ${
                        openSections.includes(group.section) ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <div className="text-xs uppercase text-gray-500 font-medium px-2 py-1.5">
                    {group.section}
                  </div>
                )}

                {/* Menu Items */}
                {(!group.collapsible || openSections.includes(group.section)) && (
                  <div className="space-y-0.5 mt-1">
                    {group.items.map((item) => (
                      <NavigationItem key={item.path} item={item} isMobile={true} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <SidebarFooter />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex fixed top-0 left-0 h-screen bg-white border-r border-gray-200 
          flex-col transition-all duration-300 z-50
          ${isSidebarExpanded ? 'w-64' : 'w-20'}
        `}
        onMouseEnter={() => {
          setIsSidebarExpanded(true);
          setLayoutSidebarExpanded(true);
          setOpenSections(DEFAULT_OPEN_SECTIONS);
        }}
        onMouseLeave={() => {
          setIsSidebarExpanded(false);
          setLayoutSidebarExpanded(false);
          setOpenSections([]);
        }}
      >
        <SidebarHeader />

        {/* Desktop Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="mt-2 px-4 space-y-1">
            {nav.map((group) => (
              <div key={group.section}>
                {/* Section Header */}
                {group.collapsible ? (
                  <button
                    onClick={() => toggleSection(group.section)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      openSections.includes(group.section)
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      name={group.icon}
                      className={isSidebarExpanded ? "w-4 h-4" : "w-5 h-5"}
                    />
                    {isSidebarExpanded && (
                      <>
                        <span className="flex-1 text-left">{group.section}</span>
                        <Icon
                          name="ChevronDown"
                          className={`w-3 h-3 transition-transform ${
                            openSections.includes(group.section) ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}
                  </button>
                ) : (
                  isSidebarExpanded && (
                    <div className="text-xs uppercase text-gray-500 font-medium px-2 py-1.5">
                      {group.section}
                    </div>
                  )
                )}

                {/* Menu Items */}
                {(!group.collapsible || openSections.includes(group.section)) && (
                  <div className="space-y-0.5 mt-1">
                    {group.items.map((item) => (
                      <NavigationItem key={item.path} item={item} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {isSidebarExpanded && <SidebarFooter />}
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  setLayoutSidebarExpanded: PropTypes.func.isRequired,
  mobileMenuOpen: PropTypes.bool.isRequired,
  setMobileMenuOpen: PropTypes.func.isRequired,
};

export default Sidebar;