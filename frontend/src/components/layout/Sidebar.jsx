import { useState } from "react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Sidebar = () => {
  const [openSections, setOpenSections] = useState(["General"]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const toggleSection = (section) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const Icon = ({ name, className = "w-5 h-5" }) => {
    const LucideIcon = Icons[name];
    return LucideIcon ? (
      <LucideIcon className={className} />
    ) : (
      <Icons.Circle className={className} />
    );
  };

  // Navigation structure with role-based access
  const allNavItems = [
    {
      section: "General",
      icon: "Home",
      roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"],
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: "LayoutDashboard",
          roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"],
        },
        {
          name: "Directory",
          path: "/directory",
          icon: "BookOpen",
          roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"],
        },
      ],
    },
    {
      section: "My Self Service",
      icon: "User",
      roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"],
      items: [
        { name: "My Profile", path: "/profile", icon: "User", roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },
        { name: "Bank Details", path: "/bank-details", icon: "Banknote", roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },
        { name: "My Payslips", path: "/payslips", icon: "Receipt", roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },
        { name: "Leave", path: "/leave", icon: "CalendarDays", roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },
        { name: "Attendance", path: "/attendance", icon: "Clock", roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },
        { name: "My Documents", path: "/documents", icon: "FileText", roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },
        { name: "My Requests", path: "/requests", icon: "FileSignature", roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },
      ],
    },
    {
      section: "Calendar",
      icon: "Calendar",
      collapsible: true,
      roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"],
      items: [
        { name: "Calendar Overview", path: "/calendar", icon: "CalendarRange", roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },
        { name: "Daily View", path: "/calendar/daily", icon: "CalendarCheck", roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },
        { name: "Monthly View", path: "/calendar/monthly", icon: "Calendar", roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },
      ],
    },
    {
      section: "Manager Tools",
      icon: "Users",
      collapsible: true,
      roles: ["HR Manager", "SuperAdmin"],
      items: [
        {
          name: "Approvals",
          path: "/manager/approvals",
          icon: "CheckSquare",
          roles: ["HR Manager", "SuperAdmin"],
        },
        {
          name: "My Team",
          path: "/manager/team",
          icon: "Users",
          roles: ["HR Manager", "SuperAdmin"],
        },
        {
          name: "Reports",
          path: "/manager/reports",
          icon: "BarChart3",
          roles: ["HR Manager", "SuperAdmin"],
        },
      ],
    },
    {
      section: "HR Administration",
      icon: "Settings",
      collapsible: true,
      roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
      items: [
        {
          name: "Attendance Admin",
          path: "/admin/attendance",
          icon: "Clock4",
          roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
        },
        {
          name: "Leave Approvals",
          path: "/admin/leave-requests",
          icon: "ClipboardCheck",
          roles: ["HR Administrator", "HR Manager", "SuperAdmin"],
        },
        {
          name: "Departments",
          path: "/hr/departments",
          icon: "Building2",
          roles: ["HR Manager", "SuperAdmin"],
        },
        {
          name: "Designations",
          path: "/hr/designations",
          icon: "Briefcase",
          roles: ["HR Manager", "SuperAdmin"],
        },
        {
          name: "Policies",
          path: "/hr/policies",
          icon: "ScrollText",
          roles: ["HR Manager", "SuperAdmin"],
        },
        {
          name: "Holidays",
          path: "/hr/holidays",
          icon: "PartyPopper",
          roles: ["HR Manager", "SuperAdmin"],
        },
        {
          name: "Company Docs",
          path: "/hr/documents",
          icon: "Folder",
          roles: ["HR Manager", "SuperAdmin"],
        },
      ],
    },
    {
      section: "Payroll",
      icon: "DollarSign",
      collapsible: true,
      roles: ["SuperAdmin"],
      items: [
        {
          name: "Payroll Dashboard",
          path: "/payroll",
          icon: "Wallet",
          roles: ["SuperAdmin"],
        },
        {
          name: "Employees",
          path: "/payroll/employees",
          icon: "UserCheck",
          roles: ["SuperAdmin"],
        },
        {
          name: "Structures",
          path: "/payroll/structures",
          icon: "Layers",
          roles: ["SuperAdmin"],
        },
        {
          name: "Payslips",
          path: "/payroll/payslips",
          icon: "FileSpreadsheet",
          roles: ["SuperAdmin"],
        },
      ],
    },
    {
      section: "Admin Panel",
      icon: "Shield",
      collapsible: true,
      roles: ["SuperAdmin"],
      items: [
        {
          name: "User Management",
          path: "/users",
          icon: "UserCog",
          roles: ["SuperAdmin"],
        },
        {
          name: "System Settings",
          path: "/settings",
          icon: "Settings",
          roles: ["SuperAdmin"],
        },
        {
          name: "Audit Logs",
          path: "/admin/logs",
          icon: "ListChecks",
          roles: ["SuperAdmin"],
        },
      ],
    },
  ];

  // Filter navigation based on user role
  const userRole = user?.role;
  
  const nav = allNavItems
    .filter(section => {
      if (!section.roles || section.roles.length === 0) return true;
      return section.roles.includes(userRole);
    })
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (!item.roles || item.roles.length === 0) return true;
        return item.roles.includes(userRole);
      })
    }))
    .filter(section => section.items.length > 0);

  const totalBadges = nav.reduce(
    (sum, group) =>
      sum +
      group.items.reduce((itemSum, item) => itemSum + (item.badge || 0), 0),
    0
  );

  return (
    <motion.aside
      animate={{ width: isSidebarExpanded ? 280 : 80 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700 shadow-2xl flex flex-col relative"
    >
      {/* HEADER */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-900">
        <motion.div
          animate={{
            opacity: isSidebarExpanded ? 1 : 0,
            width: isSidebarExpanded ? "auto" : 0,
          }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 overflow-hidden"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <Icons.Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">HRM System</h1>
            <p className="text-xs text-gray-400">Management Portal</p>
          </div>
        </motion.div>

        <button
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          {isSidebarExpanded ? (
            <Icons.ChevronLeft className="w-5 h-5 text-gray-300" />
          ) : (
            <Icons.ChevronRight className="w-5 h-5 text-gray-300" />
          )}
        </button>
      </div>

      {/* BADGES */}
      {isSidebarExpanded && totalBadges > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center gap-2 shadow-lg"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-xs font-semibold text-white">
            {totalBadges} pending action{totalBadges > 1 ? "s" : ""}
          </span>
        </motion.div>
      )}

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto mt-4 px-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        {nav.map((group) => (
          <div key={group.section}>
            {/* Section Header */}
            {group.collapsible ? (
              <motion.button
                onClick={() => toggleSection(group.section)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  openSections.includes(group.section)
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon name={group.icon} className="w-5 h-5" />
                {isSidebarExpanded && (
                  <>
                    <span className="flex-1 text-sm font-medium text-left">{group.section}</span>
                    <motion.div
                      animate={{
                        rotate: openSections.includes(group.section) ? 180 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icons.ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </>
                )}
              </motion.button>
            ) : (
              isSidebarExpanded && (
                <div className="text-xs uppercase text-gray-500 font-bold px-3 py-2 tracking-wider">
                  {group.section}
                </div>
              )
            )}

            {/* Menu Items */}
            <AnimatePresence>
              {(!group.collapsible ||
                openSections.includes(group.section)) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1 mt-1"
                >
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                        isActive(item.path)
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <Icon
                        name={item.icon}
                        className={`w-5 h-5 ${
                          isActive(item.path) ? "text-white" : "group-hover:scale-110 transition-transform"
                        }`}
                      />
                      {isSidebarExpanded && (
                        <>
                          <span className="text-sm font-medium">{item.name}</span>
                          {item.badge && item.badge > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-md">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* FOOTER */}
      {isSidebarExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 border-t border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900"
        >
          <div className="text-xs text-gray-400 text-center">
            <div className="font-semibold text-gray-300">HRM System v1.0</div>
            <div className="mt-1">© 2025 All rights reserved</div>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
