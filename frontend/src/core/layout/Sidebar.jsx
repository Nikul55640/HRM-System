import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../../shared/ui/button";
import { Icon } from "../../shared/components";
import useAuth from "../hooks/useAuth";
import { usePermissions } from "../hooks";
import { MODULES } from "../utils/rolePermissions";

const Sidebar = () => {
  const [openSections, setOpenSections] = useState(["General"]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const location = useLocation();
  const { user } = useAuth();
  const { can } = usePermissions();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const toggleSection = (section) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };



  // Navigation structure with permission-based access
  const allNavItems = [
    {
      section: "General",
      icon: "Home",
      showIf: () => true, // Always show for authenticated users
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: "LayoutDashboard",
          showIf: () => true, // Everyone can see dashboard
        },
        {
          name: "Directory",
          path: "/directory",
          icon: "BookOpen",
          showIf: () => can.do(MODULES.EMPLOYEE.VIEW_ALL), // Only HR roles can see directory
        },
      ],
    },
    // Employee Self-Service Section (only for users with employeeId)
    {
      section: "My Self Service",
      icon: "User",
      showIf: () => !!user?.employeeId && !can.doAny([MODULES.EMPLOYEE.VIEW_ALL, MODULES.SYSTEM.MANAGE_CONFIG]), // Only show for employees, not admins
      items: [
        { name: "My Profile", path: "/employee/profile", icon: "User", showIf: () => can.do(MODULES.EMPLOYEE.VIEW_OWN) },
        { name: "Settings", path: "/employee/settings", icon: "Settings", showIf: () => can.do(MODULES.EMPLOYEE.VIEW_OWN) },
        { name: "Bank Details", path: "/employee/bank-details", icon: "Banknote", showIf: () => can.do(MODULES.EMPLOYEE.VIEW_OWN) },
        { name: "My Payslips", path: "/employee/payslips", icon: "Receipt", showIf: () => can.do(MODULES.PAYROLL.VIEW_OWN) },
        { name: "Leave", path: "/employee/leave", icon: "CalendarDays", showIf: () => can.do(MODULES.LEAVE.VIEW_OWN) },
        { name: "Attendance", path: "/employee/attendance", icon: "Clock", showIf: () => can.do(MODULES.ATTENDANCE.VIEW_OWN) },
        { name: "My Documents", path: "/employee/documents", icon: "FileText", showIf: () => can.do(MODULES.EMPLOYEE.VIEW_DOCUMENTS) },
        { name: "My Requests", path: "/employee/requests", icon: "FileSignature", showIf: () => can.do(MODULES.LEAVE.VIEW_OWN) },
      ],
    },
    {
      section: "Calendar",
      icon: "Calendar",
      collapsible: true,
      showIf: () => can.do(MODULES.LEAVE.VIEW_CALENDAR),
      items: [
        { name: "Calendar Overview", path: "/calendar", icon: "CalendarRange", showIf: () => can.do(MODULES.LEAVE.VIEW_CALENDAR) },
        { name: "Daily View", path: "/calendar/daily", icon: "CalendarCheck", showIf: () => can.do(MODULES.LEAVE.VIEW_CALENDAR) },
        { name: "Monthly View", path: "/calendar/monthly", icon: "Calendar", showIf: () => can.do(MODULES.LEAVE.VIEW_CALENDAR) },
      ],
    },
    {
      section: "Manager Tools",
      icon: "Users",
      collapsible: true,
      showIf: () => can.doAny([MODULES.EMPLOYEE.VIEW_TEAM, MODULES.LEAVE.APPROVE_TEAM]),
      items: [
        {
          name: "Approvals",
          path: "/manager/approvals",
          icon: "CheckSquare",
          showIf: () => can.doAny([MODULES.LEAVE.APPROVE_TEAM, MODULES.ATTENDANCE.APPROVE_CORRECTION]),
        },
        {
          name: "My Team",
          path: "/manager/team",
          icon: "Users",
          showIf: () => can.do(MODULES.EMPLOYEE.VIEW_TEAM),
        },
        {
          name: "Reports",
          path: "/manager/reports",
          icon: "BarChart3",
          showIf: () => can.do(MODULES.REPORTS.VIEW_TEAM),
        },
      ],
    },
    {
      section: "HR Administration",
      icon: "Settings",
      collapsible: true,
      showIf: () => can.doAny([MODULES.ATTENDANCE.VIEW_ALL, MODULES.LEAVE.VIEW_ALL, MODULES.EMPLOYEE.VIEW_ALL]),
      items: [
        {
          name: "Employees",
          path: "/employees",
          icon: "Users",
          showIf: () => can.do(MODULES.EMPLOYEE.VIEW_ALL),
        },
        {
          name: "Attendance Admin",
          path: "/admin/attendance",
          icon: "Clock4",
          showIf: () => can.doAny([MODULES.ATTENDANCE.VIEW_ALL, MODULES.ATTENDANCE.EDIT_ANY]),
        },
        {
          name: "Attendance Settings",
          path: "/attendance-settings",
          icon: "Settings",
          showIf: () => can.doAny([MODULES.ATTENDANCE.VIEW_ALL, MODULES.SYSTEM.MANAGE_CONFIG]),
        },
        {
          name: "Leave Approvals",
          path: "/admin/leave-requests",
          icon: "ClipboardCheck",
          showIf: () => can.doAny([MODULES.LEAVE.APPROVE_ANY, MODULES.LEAVE.VIEW_ALL]),
        },
        {
          name: "Leave Types",
          path: "/admin/leave-types",
          icon: "ListChecks",
          showIf: () => can.doAny([MODULES.LEAVE.MANAGE_POLICIES, MODULES.SYSTEM.MANAGE_CONFIG]),
        },
        {
          name: "Departments",
          path: "/hr/departments",
          icon: "Building2",
          showIf: () => can.doAny([MODULES.DEPARTMENT.VIEW, MODULES.DEPARTMENT.CREATE]),
        },
        {
          name: "Designations",
          path: "/hr/designations",
          icon: "Briefcase",
          showIf: () => can.do(MODULES.EMPLOYEE.VIEW_ALL),
        },
        {
          name: "Calendar Management",
          path: "/admin/calendar",
          icon: "Calendar",
          showIf: () => can.do(MODULES.CALENDAR.MANAGE),
        },
        {
          name: "Policies",
          path: "/hr/policies",
          icon: "ScrollText",
          showIf: () => can.doAny([MODULES.LEAVE.MANAGE_POLICIES, MODULES.SYSTEM.VIEW_CONFIG]),
        },
        {
          name: "Holidays",
          path: "/hr/holidays",
          icon: "PartyPopper",
          showIf: () => can.do(MODULES.LEAVE.MANAGE_POLICIES),
        },
        {
          name: "Leads",
          path: "/admin/leads",
          icon: "Target",
          showIf: () => can.doAny([MODULES.LEAD.VIEW, MODULES.LEAD.MANAGE_ALL]),
        },
        {
          name: "Company Docs",
          path: "/hr/documents",
          icon: "Folder",
          showIf: () => can.do(MODULES.EMPLOYEE.MANAGE_DOCUMENTS),
        },
      ],
    },
    {
      section: "Payroll",
      icon: "DollarSign",
      collapsible: true,
      showIf: () => can.do(MODULES.PAYROLL.VIEW_ALL),
      items: [
        {
          name: "Payroll Dashboard",
          path: "/admin/payroll",
          icon: "Wallet",
          showIf: () => can.do(MODULES.PAYROLL.VIEW_ALL),
        },
        {
          name: "Employees",
          path: "/admin/payroll/employees",
          icon: "UserCheck",
          showIf: () => can.do(MODULES.PAYROLL.VIEW_ALL),
        },
        {
          name: "Structures",
          path: "/admin/payroll/structures",
          icon: "Layers",
          showIf: () => can.do(MODULES.PAYROLL.MANAGE_STRUCTURE),
        },
      ],
    },
    {
      section: "System Administration",
      icon: "Shield",
      collapsible: true,
      showIf: () => can.doAny([MODULES.USER.VIEW, MODULES.SYSTEM.VIEW_CONFIG]),
      items: [
        {
          name: "User Management",
          path: "/admin/users",
          icon: "UserCog",
          showIf: () => can.do(MODULES.USER.VIEW),
        },
        {
          name: "System Settings",
          path: "/admin/settings",
          icon: "Settings",
          showIf: () => can.do(MODULES.SYSTEM.MANAGE_CONFIG),
        },
        {
          name: "Audit Logs",
          path: "/admin/logs",
          icon: "ListChecks",
          showIf: () => can.do(MODULES.SYSTEM.VIEW_AUDIT_LOGS),
        },
      ],
    },
  ];

  // Filter navigation based on permissions
  const nav = allNavItems
    .filter(section => {
      // Check if section should be shown
      if (section.showIf && typeof section.showIf === 'function') {
        return section.showIf();
      }
      return true;
    })
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        // Check if item should be shown
        if (item.showIf && typeof item.showIf === 'function') {
          return item.showIf();
        }
        return true;
      })
    }))
    .filter(section => section.items.length > 0);

  const totalBadges = nav.reduce(
    (sum, group) =>
      sum +
      group.items.reduce((itemSum, item) => itemSum + (item.badge || 0), 0),
    0
  );

  const handleMouseEnter = () => {
    setIsSidebarExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsSidebarExpanded(false);
  };

  const handleNavClick = () => {
    setIsSidebarExpanded(false);
  };

  return (
    <aside
      style={{ width: isSidebarExpanded ? 250 : 70 }}
      className="bg-white border-r border-gray-200 flex flex-col transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* HEADER */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {isSidebarExpanded && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-lg">HR</span>
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-800">HRM System</h1>
              <p className="text-xs text-gray-500">Management</p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
        >
          {isSidebarExpanded ? (
            <Icon name="ChevronLeft" className="w-5 h-5" />
          ) : (
            <Icon name="ChevronRight" className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* BADGES */}
      {isSidebarExpanded && totalBadges > 0 && (
        <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-xs font-medium text-blue-700">
            {totalBadges} pending action{totalBadges > 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto mt-4 px-3 space-y-2">
        {nav.map((group) => (
          <div key={group.section}>
            {/* Section Header */}
            {group.collapsible ? (
              <button
                onClick={() => toggleSection(group.section)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  openSections.includes(group.section)
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon name={group.icon} className="w-5 h-5" />
                {isSidebarExpanded && (
                  <>
                    <span className="flex-1 text-left">{group.section}</span>
                    <Icon
                      name="ChevronDown"
                      className={`w-4 h-4 transition-transform ${
                        openSections.includes(group.section) ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>
            ) : (
              isSidebarExpanded && (
                <div className="text-xs uppercase text-gray-500 font-medium px-3 py-2">
                  {group.section}
                </div>
              )
            )}

            {/* Menu Items */}
            {(!group.collapsible || openSections.includes(group.section)) && (
              <div className="space-y-1 mt-1">
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive(item.path)
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon name={item.icon} className="w-5 h-5" />
                    {isSidebarExpanded && (
                      <>
                        <span>{item.name}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* FOOTER */}
      {isSidebarExpanded && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <div className="font-medium text-gray-700">HRM System v1.0</div>
            <div className="mt-1">© 2026</div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
