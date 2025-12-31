import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { Button } from "../../shared/ui/button";
import { Icon } from "../../shared/components";
import useAuth from "../hooks/useAuth";
import { usePermissions } from "../hooks";
import { MODULES } from "../utils/rolePermissions";

const Sidebar = ({ setLayoutSidebarExpanded }) => {
  const [openSections, setOpenSections] = useState([
    "General",
    "My Self Service",
  ]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const DEFAULT_OPEN_SECTIONS = ["General", "My Self Service"];


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

  // Navigation structure based on actual routes and permissions
  const allNavItems = [
    // ===================================================
    // GENERAL SECTION - Always visible
    // ===================================================
    {
      section: "General",
      icon: "Home",
      showIf: () => true,
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: "LayoutDashboard",
          showIf: () => true,
        },
      ],
    },

    // ===================================================
    // EMPLOYEE SELF-SERVICE SECTION
    // ===================================================
    {
      section: "My Self Service",
      icon: "User",
      collapsible: true,
      showIf: () => user?.role === "Employee",
      items: [
        {
          name: "My Profile",
          path: "/employee/profile",
          icon: "User",
          showIf: () => can.do(MODULES.EMPLOYEE.VIEW_OWN),
        },
        {
          name: "Bank Details",
          path: "/employee/bank-details",
          icon: "Banknote",
          showIf: () => can.do(MODULES.EMPLOYEE.VIEW_OWN),
        },
        {
          name: "My Attendance",
          path: "/employee/attendance",
          icon: "Clock",
          showIf: () => can.do(MODULES.ATTENDANCE.VIEW_OWN),
        },
        {
          name: "Attendance Corrections",
          path: "/employee/attendance/corrections",
          icon: "ClipboardEdit",
          showIf: () => can.do(MODULES.ATTENDANCE.VIEW_OWN),
        },
        {
          name: "My Leave",
          path: "/employee/leave",
          icon: "CalendarDays",
          showIf: () => can.do(MODULES.LEAVE.VIEW_OWN),
        },
        {
          name: "My Leads",
          path: "/employee/leads",
          icon: "Target",
          showIf: () => can.do(MODULES.LEAD.VIEW),
        },
        {
          name: "My Shifts",
          path: "/employee/shifts",
          icon: "Calendar",
          showIf: () => can.do(MODULES.ATTENDANCE.VIEW_OWN),
        },
        {
          name: "Calendar",
          path: "/employee/calendar",
          icon: "CalendarRange",
          showIf: () => can.do(MODULES.CALENDAR.VIEW),
        },
      ],
    },

    // ===================================================
    // HR ADMINISTRATION SECTION
    // ===================================================
    {
      section: "HR Administration",
      icon: "Settings",
      collapsible: true,
      showIf: () =>
        (user?.role === "HR Administrator" || user?.role === "HR Manager" || user?.role === "SuperAdmin") &&
        can.doAny([
          MODULES.EMPLOYEE.VIEW_ALL,
          MODULES.ATTENDANCE.VIEW_ALL,
          MODULES.LEAVE.VIEW_ALL,
        ]),
      items: [
        // Employee Management
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
          showIf: () => can.doAny([MODULES.EMPLOYEE.VIEW_ALL, MODULES.EMPLOYEE.EDIT_ANY]),
        },

        // Attendance Management
        {
          name: "Attendance Management",
          path: "/admin/attendance",
          icon: "Clock4",
          showIf: () => can.doAny([MODULES.ATTENDANCE.VIEW_ALL, MODULES.ATTENDANCE.EDIT_ANY]),
        },
        {
          name: "Attendance Corrections",
          path: "/admin/attendance/corrections",
          icon: "ClipboardEdit",
          showIf: () => can.doAny([MODULES.ATTENDANCE.VIEW_ALL, MODULES.ATTENDANCE.EDIT_ANY]),
        },
        {
          name: "Live Attendance",
          path: "/admin/attendance/live",
          icon: "Activity",
          showIf: () => can.doAny([MODULES.ATTENDANCE.VIEW_ALL, MODULES.ATTENDANCE.EDIT_ANY]),
        },

        // Leave Management
        {
          name: "Leave Requests",
          path: "/admin/leave",
          icon: "FileText",
          showIf: () => can.doAny([MODULES.LEAVE.APPROVE_ANY, MODULES.LEAVE.VIEW_ALL]),
        },
        {
          name: "Leave Balances",
          path: "/admin/leave-balances",
          icon: "Scale",
          showIf: () => can.do(MODULES.LEAVE.MANAGE_BALANCE),
        },

        // Lead Management
        {
          name: "Lead Management",
          path: "/admin/leads",
          icon: "Target",
          showIf: () => can.doAny([MODULES.LEAD.CREATE, MODULES.LEAD.MANAGE_ALL]),
        },

        // Shift Management
        {
          name: "Shift Management",
          path: "/admin/shifts",
          icon: "Clock",
          showIf: () => can.do(MODULES.ATTENDANCE.MANAGE_SHIFTS),
        },

        // Calendar Management
        {
          name: "Calendar Management",
          path: "/admin/calendar",
          icon: "CalendarCog",
          showIf: () => can.do(MODULES.CALENDAR.MANAGE),
        },
      ],
    },

    // ===================================================
    // CALENDAR VIEWS SECTION - Removed (now unified)
    // ===================================================

    // ===================================================
    // SYSTEM ADMINISTRATION SECTION
    // ===================================================
    {
      section: "System Administration",
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
          name: "User Management",
          path: "/users",
          icon: "UserCog",
          showIf: () => can.do(MODULES.USER.VIEW),
        },
        {
          name: "System Policies",
          path: "/system-policies",
          icon: "Settings",
          showIf: () => can.do(MODULES.SYSTEM.MANAGE_CONFIG),
        },
        {
          name: "Audit Logs",
          path: "/audit-logs",
          icon: "ListChecks",
          showIf: () => can.do(MODULES.SYSTEM.VIEW_AUDIT_LOGS),
        },
      ],
    },
  ];

  // Filter navigation based on permissions
  const nav = allNavItems
    .filter((section) => {
      // Check if section should be shown
      if (section.showIf && typeof section.showIf === "function") {
        return section.showIf();
      }
      return true;
    })
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // Check if item should be shown
        if (item.showIf && typeof item.showIf === "function") {
          return item.showIf();
        }
        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);

  const totalBadges = nav.reduce(
    (sum, group) =>
      sum +
      group.items.reduce((itemSum, item) => itemSum + (item.badge || 0), 0),
    0
  );

const handleMouseEnter = () => {
  setIsSidebarExpanded(true);
  setLayoutSidebarExpanded(true);
  setOpenSections(DEFAULT_OPEN_SECTIONS); // 👈 restore defaults
};


const handleMouseLeave = () => {
  setIsSidebarExpanded(false);
  setLayoutSidebarExpanded(false);
  setOpenSections([]); // 👈 collapse all sections
};

  
  const handleNavClick = () => {
    setIsSidebarExpanded(false);
    setLayoutSidebarExpanded(false);
  };

  return (
    <aside
      style={{ width: isSidebarExpanded ? 250 : 70 }}
      className="
        bg-white
        border-r
        border-gray-200
        flex
        flex-col
        transition-all
        duration-300
        fixed
        top-0
        left-0
        h-screen
        z-40
        overflow-hidden
      "
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* HEADER */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        {isSidebarExpanded && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-lg">HR</span>
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-800">
                HRM System
              </h1>
              <p className="text-xs text-gray-500">Management</p>
            </div>
          </div>
        )}

       <Button
  variant="ghost"
  size="sm"
  onClick={() => {
    const next = !isSidebarExpanded;
    setIsSidebarExpanded(next);
    setLayoutSidebarExpanded(next);
    setOpenSections(next ? DEFAULT_OPEN_SECTIONS : []);
  }}
>

          {isSidebarExpanded ? (
            <Icon name="ChevronLeft" className="w-10 h-10" />
          ) : (
            <Icon name="ChevronRight" className="w-10 h-10 " />
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
      <div className="flex-1 overflow-y-auto">
        <nav className="mt-4 px-3 space-y-2">
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
                  <Icon
                    name={group.icon}
                    className={isSidebarExpanded ? "w-5 h-5" : "w-6 h-6"}
                  />
                  {isSidebarExpanded && (
                    <>
                      <span className="flex-1 text-left">{group.section}</span>
                      <Icon
                        name="ChevronDown"
                        className={`w-4 h-4 transition-transform ${
                          openSections.includes(group.section)
                            ? "rotate-180"
                            : ""
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
                      className={`w-full flex items-center py-2 rounded-lg text-sm transition-colors ${
                        isSidebarExpanded
                          ? "gap-3 px-3 justify-start"
                          : "justify-center"
                      } ${
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
      </div>

      {/* FOOTER */}
      {isSidebarExpanded && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <div className="font-medium text-gray-700">HRM System v1.0</div>
            <div className="mt-1">© 2025</div>
          </div>
        </div>
      )}
    </aside>
  );
};

Sidebar.propTypes = {
  setLayoutSidebarExpanded: PropTypes.func.isRequired,
};

export default Sidebar;